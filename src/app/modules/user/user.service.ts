import { prisma } from '../../lib/prisma';
import AppError from '../../errorHelper/AppError';
import status from 'http-status';
import { Prisma, User } from '../../../generated/prisma/client';
import { QueryBuilder } from '../../utils/QueryBuilder';
import { IQueryParams } from '../../interfaces/query.interface';
import { userSearchableFields, userFilterableFields } from './user.constant';
import { UserStatus } from '../../../generated/prisma/enums';
import { IUpdateUserProfile } from './user.interface';
import { IRequestUser } from '../../interfaces/req.user.interface';
import { deleteFileFromCloudinary } from '../../utils/cloudinary';


// get all users (admin)
const getAllUser = async (query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<User, Prisma.UserWhereInput, Prisma.UserInclude>(prisma.user, query, {
    searchableFields: userSearchableFields,
    filterableFields: userFilterableFields,
  });


  const result = await queryBuilder
    .search()
    .filter()
    .include({
      reviews: true,
      comments: true,
    })
    .sort()
    .paginate()
    .fields()
    .execute();

  return result;
};

// change user status
const changeUserStatus = async (userId: string, newStatus: UserStatus, admin: IRequestUser) => {
  if (admin.userId === userId) {
    throw new AppError(status.BAD_REQUEST, 'You cannot change your own status');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId, isDeleted: false },
  });

  if (!user) {
    throw new AppError(status.NOT_FOUND, 'User not found');
  }


  if (user.status === newStatus) {
    throw new AppError(status.BAD_REQUEST, 'User is already in this status');
  }

  const result = await prisma.$transaction(async (tx) => {
    let updatedUser;

    if (newStatus === UserStatus.DELETED) {
      // Soft delete: mark as deleted and invalidate sessions
      updatedUser = await tx.user.update({
        where: { id: userId },
        data: { isDeleted: true, status: UserStatus.DELETED, deletedAt: new Date() },
      });
      await tx.session.deleteMany({
        where: { userId },
      });
    } else if (user.isDeleted) {
      // Restoring a previously deleted user — clear deletion flags
      updatedUser = await tx.user.update({
        where: { id: userId },
        data: { status: newStatus, isDeleted: false, deletedAt: null },
      });
    } else {
      // Simple status change (ACTIVE ↔ BLOCKED)
      updatedUser = await tx.user.update({
        where: { id: userId },
        data: { status: newStatus },
      });
    }

    return updatedUser;
  });

  return result;
};

// update my profile
const updateMyProfile = async (userId: string, payload: IUpdateUserProfile) => {
  const user = await prisma.user.findUnique({
    where: { id: userId, isDeleted: false, status: UserStatus.ACTIVE },
  });

  if (!user) {
    throw new AppError(status.NOT_FOUND, 'User not found');
  }

  if (user.name === payload.name) {
    throw new AppError(status.BAD_REQUEST, 'You are already using this name');
  }

  // Clean up old profile photo from Cloudinary if a new one is being uploaded
  if (payload.image && user.image) {
    await deleteFileFromCloudinary(user.image);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: payload,
  });

  return updatedUser;
};

// soft delete user
const softDeleteUser = async (userId: string, admin: IRequestUser) => {
  if (admin.userId === userId) {
    throw new AppError(status.BAD_REQUEST, 'You cannot delete your own account');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId, isDeleted: false, status: { in: [UserStatus.ACTIVE, UserStatus.BLOCKED] } },
  });

  if (!user) {
    throw new AppError(status.NOT_FOUND, 'User not found');
  }

  const result = await prisma.$transaction(async (tx) => {
    const deletedUser = await tx.user.update({
      where: { id: userId },
      data: { isDeleted: true, status: UserStatus.DELETED, deletedAt: new Date() },
    });

    // Invalidate all active sessions
    await tx.session.deleteMany({
      where: { userId },
    });

    return deletedUser;
  });

  return result;
};

export const UserService = {
  getAllUser,
  changeUserStatus,
  updateMyProfile,
  softDeleteUser,
};
