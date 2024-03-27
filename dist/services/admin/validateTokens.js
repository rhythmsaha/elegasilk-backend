"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyResetPasswordService = exports.validateAdminPasswordResetCode = void 0;
const redis_1 = require("../../lib/redis");
const ErrorHandler_1 = __importDefault(require("../../utils/ErrorHandler"));
const validateAdminPasswordResetCode = (token, code) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if token exists in redis
    const cachedData = yield redis_1.redis.get(`reset-pwd:${token}`);
    // If not exists, throw error
    if (!cachedData)
        throw new ErrorHandler_1.default("Invalid token", 400);
    const sessionData = JSON.parse(cachedData);
    // If exists, check if code is valid
    if (sessionData.code !== code)
        throw new ErrorHandler_1.default("Invalid code", 400);
    return sessionData;
});
exports.validateAdminPasswordResetCode = validateAdminPasswordResetCode;
const verifyResetPasswordService = (req, next) => __awaiter(void 0, void 0, void 0, function* () {
    // validate if token, userId, code is provided in body
    const { token, code } = req.body;
    if (!token)
        return next(new ErrorHandler_1.default("Please provide token", 400));
    // check if token valid
    const sessionData = yield (0, exports.validateAdminPasswordResetCode)(token, code);
    return {
        userId: sessionData.userId,
        code: sessionData.code,
        token,
    };
});
exports.verifyResetPasswordService = verifyResetPasswordService;
