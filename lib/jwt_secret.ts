import { Secret } from "jsonwebtoken";
const dotenv = require("dotenv");
dotenv.config();

export const CUSTOMER_JWT_SECRET = process.env.CUSTOMER_JWT_SECRET as Secret;
export const adminSecret = process.env.ADMIN_ACCESS_TOKEN_JWT_SECRET as Secret;
