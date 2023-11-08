import { Request } from "express";

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

declare global {
    namespace Express {
        interface Request {
            admin: IRequestAdminObject;
        }
    }
}
