import ErrorHandler from "../../utils/ErrorHandler";
import generateOTP from "../../utils/generateOtp";
import crypto from "crypto";

export const validateAdminPasswordResetToken = async (token: string) => {
    // Check if token exists in redis
    // If exists, check if token is valid
    // If valid, return true
    // If not valid, return false
    if (!token) return false;
    return true;
};
