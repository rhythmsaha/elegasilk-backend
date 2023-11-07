import validator from "validator";
import ErrorHandler from "./ErrorHandler";

export const validateStrongPassword = (password: string) => {
    const isStrongPassword = validator.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
        returnScore: false,
    });

    if (!isStrongPassword) {
        throw new ErrorHandler(
            "Password must be at least 8 characters, including 1 uppercase letter, 1 lowercase letter, 1 number, and 1 symbol",
            400
        );
    }

    return true;
};
