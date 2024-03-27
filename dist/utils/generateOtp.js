"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generateOTP = (length) => {
    if (length > 10)
        throw new Error("OTP length should be less than 10");
    const digits = "0123456789";
    let otp = "";
    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
};
exports.default = generateOTP;
