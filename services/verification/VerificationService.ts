import { redis } from "../../lib/redis";
import ErrorHandler from "../../utils/ErrorHandler";

export interface IVerifyUserIdSessionData {
    userId: string;
    code: string;
}

class verificationService {
    public static generateOTP(length: number) {
        if (length > 10) throw new Error("OTP length should be less than 10");

        const digits = "0123456789";

        let otp = "";

        for (let i = 0; i < length; i++) {
            otp += digits[Math.floor(Math.random() * 10)];
        }

        return otp;
    }

    public static async createUserIdVerificationCode(userId: string) {
        const code = this.generateOTP(6);
        const token = crypto.randomUUID();

        const sessionData = {
            userId,
            code,
        };

        const setRedisCache = await redis.set(`verifyUserId:${token}`, JSON.stringify(sessionData), "EX", 60 * 10);

        if (setRedisCache !== "OK") throw new Error("Failed to set token in redis");

        return { code, token };
    }

    public static async verifyUserIdVerificationCode(token: string, code: string) {
        if (!token) throw new ErrorHandler("Please provide token", 400);
        if (!code) throw new ErrorHandler("Please provide code", 400);

        const cachedData = await redis.get(`verifyUserId:${token}`);
        if (!cachedData) throw new ErrorHandler("Invalid token", 400);

        const sessionData: IVerifyUserIdSessionData = JSON.parse(cachedData);

        if (sessionData.code !== code) throw new ErrorHandler("Invalid code", 400);

        return {
            userId: sessionData.userId,
            code: sessionData.code,
            token,
        };
    }
}

export default verificationService;
