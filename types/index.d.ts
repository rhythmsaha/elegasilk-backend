import { Request } from "express";
import { ObjectId } from "mongoose";

export interface IAdminRequest {
    _id: ObjectId;
    role: "moderator" | "admin" | "superadmin" | "guest";
}

declare global {
    namespace Express {
        interface Request {
            admin: IAdminRequest;
        }
    }
}
