import { Prisma, Purchase } from '../../../generated/prisma/client';
import { prisma } from '../../lib/prisma';
import { QueryBuilder } from '../../utils/QueryBuilder';
import { IQueryParams } from '../../interfaces/query.interface';
import { PurchaseFilterableFields, PurchaseSearchableFields } from './purchase.constant';

const getMyPurchases = async (userId: string, query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<Purchase, Prisma.PurchaseWhereInput, Prisma.PurchaseInclude>(prisma.purchase, query, {
    searchableFields: PurchaseSearchableFields,
    filterableFields: PurchaseFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .where({ userId })
    .include({
      media: {
        select: {
          id: true,
          title: true,
          posterUrl: true,
          mediaType: true,
        }
      },
      payments: true,
    })
    .sort()
    .paginate()
    .fields()
    .execute();

  return result;
};

const getAllPurchases = async (query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<Purchase, Prisma.PurchaseWhereInput, Prisma.PurchaseInclude>(prisma.purchase, query, {
    searchableFields: PurchaseSearchableFields,
    filterableFields: PurchaseFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .include({
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      media: {
        select: {
          id: true,
          title: true,
          posterUrl: true,
          mediaType: true,
        }
      },
      payments: true,
    })
    .sort()
    .paginate()
    .fields()
    .execute();

  return result;
};

export const PurchaseService = {
  getMyPurchases,
  getAllPurchases,
};
