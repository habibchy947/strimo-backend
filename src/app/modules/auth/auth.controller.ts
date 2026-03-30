import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { TokenUtils } from "../../utils/token";

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

export const AuthController = {
    registerUser,
    loginUser,
};