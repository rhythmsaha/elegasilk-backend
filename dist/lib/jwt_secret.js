"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminSecret = exports.CUSTOMER_JWT_SECRET = void 0;
const dotenv = require("dotenv");
dotenv.config();
exports.CUSTOMER_JWT_SECRET = process.env.CUSTOMER_JWT_SECRET;
exports.adminSecret = process.env.ADMIN_ACCESS_TOKEN_JWT_SECRET;
