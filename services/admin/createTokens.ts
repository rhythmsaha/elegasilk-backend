import { redis } from "../../lib/redis";
import generateOTP from "../../utils/generateOtp";
import crypto from "crypto";

export interface IAdminPasswordResetSessionData {
    userId: string;
    code: string;
}

export const createAdminPasswordResetCode = async (userId: string) => {
    const code = generateOTP(6);
    const token = crypto.randomUUID();

    const sessionData = {
        userId,
        code,
    };

    // Set token in redis with expiry of 10 minutes and return the id [key: id, value: token]
    const setRedisCache = await redis.set(`reset-pwd:${token}`, JSON.stringify(sessionData), "EX", 60 * 10);

    if (setRedisCache !== "OK") throw new Error("Failed to set token in redis");

    return token;
};
