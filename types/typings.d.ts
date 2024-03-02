import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";
import { IAdmin } from "../models/Admin.model";
import { IProduct } from "../models/Product.model";

interface ICreateAdminInput extends IAdmin {
    password: string;
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
    role?: "moderator" | "admin" | "superadmin" | "guest";
    status?: boolean;
    avatar?: string;
}

export type ISortOrder = "asc" | "desc";

declare global {
    namespace Express {
        interface Request {
            admin?: IRequestAdminObject;
            jwtPayload?: JwtPayload;
        }
    }
}

interface formattedProducts extends IProduct {
    attributes: {
        _id?: string;
        category: string;
        subcategory?: string[];
    }[];

    collections: string[];
}
