"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateStrongPassword = void 0;
const validator_1 = __importDefault(require("validator"));
const ErrorHandler_1 = __importDefault(require("./ErrorHandler"));
const validateStrongPassword = (password) => {
    const isStrongPassword = validator_1.default.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
        returnScore: false,
    });
    if (!isStrongPassword) {
        throw new ErrorHandler_1.default("Password must be at least 8 characters, including 1 uppercase letter, 1 lowercase letter, 1 number, and 1 symbol", 400);
    }
    return true;
};
exports.validateStrongPassword = validateStrongPassword;
