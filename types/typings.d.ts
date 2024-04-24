import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";
import { IAdmin } from "../models/Admin.model";
import { IProduct } from "../models/Product.model";

interface ICreateAdminInput {
    firstName: string;
    lastName: string;
    username: string;
    email?: string;
    password: string;
    role: "moderator" | "admin" | "superadmin";
    status: boolean;
    avatar?: string;
}

interface IUpdateAdminInput {
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
    password?: string;
    role?: "moderator" | "admin" | "superadmin";
    status?: boolean;
    avatar?: string;
}

interface ILoginAdminInput {
    username: string;
    password: string;
}

export interface IRequestAdminObject {
    _id: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
    role?: "moderator" | "admin" | "superadmin";
    status?: boolean;
    avatar?: string;
}

interface IRequestCustomerObject {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    avatar?: string;
}

export type ISortOrder = "asc" | "desc";

declare global {
    namespace Express {
        interface Request {
            admin: IRequestAdminObject;
            jwtPayload?: JwtPayload;
            customer: IRequestCustomerObject;
        }
    }
}
