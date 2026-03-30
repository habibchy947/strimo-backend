import status from "http-status";
import AppError from "../../errorHelper/AppError";
import { auth } from "../../lib/auth";
import { ILoginUserPayload, IRegisterUserPayload } from "./auth.interface";
import { prisma } from "../../lib/prisma";
import { UserStatus } from "../../../generated/prisma/enums";
import { TokenUtils } from "../../utils/token";

const registerUser = async (payload: IRegisterUserPayload) => {
    const { name, email, password } = payload;

    const data = await auth.api.signUpEmail({
        body: {
            name,
            email,
            password,
        }
    });

    if (!data.user) {
        throw new AppError(status.BAD_REQUEST, "Failed to register user");
    }

    const accessToken = TokenUtils.getAccessToken({
        userId: data.user.id,
        role: data.user.role,
        name: data.user.name,
        email: data.user.email,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified,
    });

    const refreshToken = TokenUtils.getRefreshToken({
        userId: data.user.id,
        role: data.user.role,
        name: data.user.name,
        email: data.user.email,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified,
    });

    return {
        ...data,
        accessToken,
        refreshToken,
    };
};

const loginUser = async (payload: ILoginUserPayload) => {
    const { email, password } = payload;

    const data = await auth.api.signInEmail({
        body: {
            email,
            password,
        }
    });

    if (data.user.status === UserStatus.BLOCKED) {
        throw new AppError(status.FORBIDDEN, "User is Blocked");
    };
    if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
        throw new AppError(status.NOT_FOUND, "User is Deleted");
    };

    const accessToken = TokenUtils.getAccessToken({
        userId: data.user.id,
        role: data.user.role,
        name: data.user.name,
        email: data.user.email,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified,
    });

    const refreshToken = TokenUtils.getRefreshToken({
        userId: data.user.id,
        role: data.user.role,
        name: data.user.name,
        email: data.user.email,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified,
    });

    return {
        ...data,
        accessToken,
        refreshToken,
    };
};


export const AuthService = {
    registerUser,
    loginUser,
};