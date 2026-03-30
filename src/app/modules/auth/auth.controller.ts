import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

const registerUser = catchAsync(
    async (req: Request, res: Response) => {
        console.log(req.cookies);
        const payload = req.body;
        const result = await AuthService.registerUser(payload);
        sendResponse(res, {
            httpStatusCode: status.CREATED,
            success: true,
            message: "User registered successfully",
            data: result,
        });
    }
);

const loginUser = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const result = await AuthService.loginUser(payload);
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User logged in successfully",
            data: result,
        });
    }
);

export const AuthController = {
    registerUser,
    loginUser,
};