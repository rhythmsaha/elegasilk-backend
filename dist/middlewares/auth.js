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
exports.authorizeAdminRole = exports.authorizeCustomerAccessToken = exports.authorizeAccessToken = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Admin_model_1 = __importDefault(require("../models/Admin.model"));
// Authorize Access token
const authorizeAccessToken = (secret, customer = false) => {
    return (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
            if (!token)
                throw new Error();
            const decoded = jsonwebtoken_1.default.verify(token, secret);
            if (!decoded)
                throw new Error();
            if (!customer) {
                req.admin = {
                    _id: decoded.id,
                };
            }
            else {
                req.customer = {
                    _id: decoded.id,
                };
            }
            req.jwtPayload = Object.assign({}, decoded);
            next();
        }
        catch (error) {
            return next(new ErrorHandler_1.default("Please login to access this resource", 401));
        }
    }));
};
exports.authorizeAccessToken = authorizeAccessToken;
const authorizeCustomerAccessToken = (secret) => {
    return (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
            if (!token)
                throw new Error();
            const decoded = jsonwebtoken_1.default.verify(token, secret);
            if (!decoded)
                throw new Error();
            req.customer = {
                _id: decoded.id,
            };
            req.jwtPayload = Object.assign({}, decoded);
            next();
        }
        catch (error) { }
    }));
};
exports.authorizeCustomerAccessToken = authorizeCustomerAccessToken;
// Check if admin has permission to access a resource
const authorizeAdminRole = (...roles) => {
    return (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const userId = (_a = req.admin) === null || _a === void 0 ? void 0 : _a._id;
        let cacheData = null;
        if (!cacheData) {
            const admin = yield Admin_model_1.default.findById(userId);
            if (!admin)
                return next(new ErrorHandler_1.default("Please login to access this resource", 401));
            if (!roles.includes(admin.role)) {
                return next(new ErrorHandler_1.default("You are not authorized to access this resource", 403));
            }
            req.admin = Object.assign(Object.assign({}, req.admin), { role: admin.role });
            next();
        }
        else {
            const admin = JSON.parse(cacheData);
            if (!roles.includes(admin.role)) {
                return next(new ErrorHandler_1.default("You are not authorized to access this resource", 403));
            }
            req.admin = Object.assign(Object.assign({}, req.admin), { role: admin.role });
            next();
        }
    }));
};
exports.authorizeAdminRole = authorizeAdminRole;
