import { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import ErrorHandler from "../utils/ErrorHandler";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import Admin from "../models/Admin.model";
import { IRequestAdminObject } from "../types/typings";

// Check if admin is authenticated
type role = "moderator" | "admin" | "superadmin" | "guest";

// Authorize Access token
export const authorizeAccessToken = (secret: Secret, customer = false) => {
    return expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization?.split(" ")[1];

            if (!token) throw new Error();

            const decoded = jwt.verify(token, secret) as JwtPayload;

            if (!decoded) throw new Error();

            if (!customer) {
                req.admin = {
                    _id: decoded.id,
                };
            } else {
                req.customer = {
                    _id: decoded.id,
                };
            }

            req.jwtPayload = {
                ...decoded,
            };

            next();
        } catch (error: any) {
            throw new ErrorHandler("Please login to access this resource", 401);
        }
    });
};

export const authorizeCustomerAccessToken = (secret: Secret) => {
    return expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization?.split(" ")[1];
            if (!token) throw new Error();

            const decoded = jwt.verify(token, secret) as JwtPayload;

            if (!decoded) throw new Error();

            req.customer = {
                _id: decoded.id,
            };

            req.jwtPayload = {
                ...decoded,
            };

            next();
        } catch (error: any) {}
    });
};

// Check if admin has permission to access a resource
export const authorizeAdminRole = (...roles: role[]) => {
    return expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.admin?._id;

        let cacheData = null;

        if (!cacheData) {
            const admin = await Admin.findById(userId);

            if (!admin) return next(new ErrorHandler("Please login to access this resource", 401));

            if (!roles.includes(admin.role as role)) {
                return next(new ErrorHandler("You are not authorized to access this resource", 403));
            }

            req.admin = {
                ...(req.admin as IRequestAdminObject),
                role: admin.role,
            };

            next();
        } else {
            const admin = JSON.parse(cacheData) as IRequestAdminObject;

            if (!roles.includes(admin.role as role)) {
                return next(new ErrorHandler("You are not authorized to access this resource", 403));
            }

            req.admin = {
                ...(req.admin as IRequestAdminObject),
                role: admin.role,
            };

            next();
        }
    });
};
