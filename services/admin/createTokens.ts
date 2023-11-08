import generateOTP from "../../utils/generateOtp";
import crypto from "crypto";

export const createAdminPasswordResetToken = async () => {
    const token = generateOTP(6);
    const id = crypto.randomUUID();

    // Set token in redis with expiry of 10 minutes and return the id [key: id, value: token]
    // Send email to admin with the token

    return token;
};
