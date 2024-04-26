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

interface ICreateCategoryInput {
    name: string;
    description?: string;
    image?: string;
    status?: boolean;
}

interface ICategoryFetchOptions {
    search: string;
    page: number;
    limit: number;
    sort: ICategorySortOptions;
}

interface ICollectionFetchOptions extends ICategoryFetchOptions {
    page?: number;
    limit?: number;
    sortOrder?: ISortOrder;
    status?: string;
}

export type ICategorySortOptions = ("name" | "status" | "createdAt" | "updatedAt") | undefined;

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
