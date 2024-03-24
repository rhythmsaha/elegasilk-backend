import { redis } from "../../lib/redis";
import ErrorHandler from "../../utils/ErrorHandler";
import { IAdminPasswordResetSessionData } from "./createTokens";
import { NextFunction, Request } from "express";

export const validateAdminPasswordResetCode = async (token: string, code: string) => {
    // Check if token exists in redis
    const cachedData = await redis.get(`reset-pwd:${token}`);

    // If not exists, throw error
    if (!cachedData) throw new ErrorHandler("Invalid token", 400);

    const sessionData: IAdminPasswordResetSessionData = JSON.parse(cachedData);

    // If exists, check if code is valid
    if (sessionData.code !== code) throw new ErrorHandler("Invalid code", 400);

    return sessionData;
};

export const verifyResetPasswordService = async (req: Request, next: NextFunction) => {
    // validate if token, userId, code is provided in body
    const { token, code } = req.body;

    if (!token) return next(new ErrorHandler("Please provide token", 400));

    // check if token valid
    const sessionData = await validateAdminPasswordResetCode(token, code);

    return {
        userId: sessionData.userId,
        code: sessionData.code,
        token,
    };
};
