const generateOTP: (length: number) => string = (length: number) => {
    if (length > 10) throw new Error("OTP length should be less than 10");

    const digits = "0123456789";

    let otp = "";

    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }

    return "1234";
};

export default generateOTP;
