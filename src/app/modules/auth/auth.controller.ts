import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { TokenUtils } from "../../utils/token";
import AppError from "../../errorHelper/AppError";

const registerUser = catchAsync(
    async (req: Request, res: Response) => {
        console.log(req.cookies);
        const payload = req.body;
        const result = await AuthService.registerUser(payload);
        const { accessToken, refreshToken, token, ...rest } = result;
        TokenUtils.setAccessTokenCookie(res, accessToken);
        TokenUtils.setRefreshTokenCookie(res, refreshToken);
        TokenUtils.setBetterAuthSessionCookie(res, token as string);
        sendResponse(res, {
            httpStatusCode: status.CREATED,
            success: true,
            message: "User registered successfully",
            data: {
                token,
                accessToken,
                refreshToken,
                ...rest
            },
        });
    }
);

const loginUser = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const result = await AuthService.loginUser(payload);
        const { accessToken, refreshToken, token, ...rest } = result;
        TokenUtils.setAccessTokenCookie(res, accessToken);
        TokenUtils.setRefreshTokenCookie(res, refreshToken);
        TokenUtils.setBetterAuthSessionCookie(res, token);
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User logged in successfully",
            data: {
                token,
                accessToken,
                refreshToken,
                ...rest
            },
        });
    }
);

const getMe = catchAsync(
    async (req: Request, res: Response) => {
        const user = req.user;
        const result = await AuthService.getMe(user);
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User Profile fetched Successfully",
            data: result,
        });
    }
);

const getNewToken = catchAsync(
    async (req: Request, res: Response) => {
        const refreshToken = req.cookies.refreshToken;
        const betterAuthSessionToken = req.cookies["better-auth.session_token"];

        if(!refreshToken) {
            throw new AppError(status.UNAUTHORIZED, "Refresh token is missing")
        }

        const result = await AuthService.getNewToken(refreshToken, betterAuthSessionToken);

        const { accessToken, refreshToken: newRefreshToken, sessionToken} = result;

        TokenUtils.setAccessTokenCookie(res, accessToken);
        TokenUtils.setRefreshTokenCookie(res, newRefreshToken);
        TokenUtils.setBetterAuthSessionCookie(res, sessionToken);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "New Tokens Generated Successfully",
            data: {
                accessToken,
                refreshToken: newRefreshToken,
                sessionToken,
            },
        });
    }
)

export const AuthController = {
    registerUser,
    loginUser,
    getMe,
    getNewToken,
};