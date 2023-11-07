import { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import ErrorHandler from "../utils/ErrorHandler";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import Admin from "../models/Admin.model";
import type { IAdminRequest } from "../types";

// Check if admin is authenticated
type role = "moderator" | "admin" | "superadmin" | "guest";

export const isAdminAuthenticated = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.headers.authorization?.split(" ")[1];
    // check if token exists
    if (!accessToken) {
        return next(new ErrorHandler("Please login to access this resource", 401));
    }

    const decoded = jwt.verify(accessToken, process.env.ADMIN_ACCESS_TOKEN_JWT_SECRET as Secret) as JwtPayload;

    if (!decoded) {
        return next(new ErrorHandler("Please login to access this resource", 401));
    }

    const admin = await Admin.findById(decoded.id).select("_id, role");

    if (!admin) {
        return next(new ErrorHandler("Please login to access this resource", 401));
    }

    req.admin = {
        _id: admin._id,
        role: admin.role,
    } as IAdminRequest;
});

// Check if admin has permission to access a resource
export const authorizeAdminRole = (...roles: role[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!roles.includes(req.admin?.role as role)) {
            return next(new ErrorHandler("You are not authorized to access this resource", 403));
        }
        next();
    };
};
