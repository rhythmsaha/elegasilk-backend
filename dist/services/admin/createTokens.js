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
exports.createAdminPasswordResetCode = void 0;
const redis_1 = require("../../lib/redis");
const generateOtp_1 = __importDefault(require("../../utils/generateOtp"));
const crypto_1 = __importDefault(require("crypto"));
const createAdminPasswordResetCode = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const code = (0, generateOtp_1.default)(6);
    const token = crypto_1.default.randomUUID();
    const sessionData = {
        userId,
        code,
    };
    // Set token in redis with expiry of 10 minutes and return the id [key: id, value: token]
    const setRedisCache = yield redis_1.redis.set(`reset-pwd:${token}`, JSON.stringify(sessionData), "EX", 60 * 10);
    if (setRedisCache !== "OK")
        throw new Error("Failed to set token in redis");
    return token;
});
exports.createAdminPasswordResetCode = createAdminPasswordResetCode;
