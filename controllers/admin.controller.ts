import asyncHandler from "express-async-handler";
import Admin, { IAdmin } from "../models/Admin.model";
import ErrorHandler from "../utils/ErrorHandler";
import jwt, { Secret, JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import validator from "validator";
import { validateStrongPassword } from "../utils/validate";

//  Create new admin
interface ICreateAdminInput extends IAdmin {
    password: string;
}

export const registerNewAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { firstName, lastName, username, email, password, role, avatar, status }: ICreateAdminInput = req.body;

    try {
        //    Check user role
        const adminRole = req.admin?.role;

        // Only super admin can create another superAdmin and admin
        if (adminRole !== "superadmin" && role === "superadmin") {
            return next(new ErrorHandler("Only superadmin can create a superadmin", 403));
        }

        if (adminRole !== "superadmin" && role === "admin") {
            return next(new ErrorHandler("Only superadmin can create an admin", 403));
        }

        // Only admin & super admin can create a moderator
        if (adminRole !== "superadmin" && adminRole !== "admin" && role === "moderator") {
            return next(new ErrorHandler("Only admin can create a moderator", 403));
        }

        // Moderators are not allowed to create any other user
        if (adminRole === "moderator") {
            return next(new ErrorHandler("Moderators are not allowed to create any other user", 403));
        }

        // Check if admin already exists
        const adminExists = await Admin.exists({ $or: [{ username }, { email }] });

        if (adminExists && adminExists._id) {
            return next(new ErrorHandler("Admin already exists", 400));
        }

        // Validate if password is strong (8 characters, including 1 uppercase letter, 1 lowercase letter, 1 number, and 1 symbol)
        validateStrongPassword(password);

        // Create new admin
        const admin = await Admin.create({
            firstName,
            lastName,
            username,
            email,
            hashed_password: password,
            role,
            avatar,
            status,
        });

        const newAdminData = {
            _id: admin._id,
            firstName: admin.firstName,
            lastName: admin.lastName,
            username: admin.username,
            email: admin.email,
            role: admin.role,
            avatar: admin.avatar,
            status: admin.status,
        };

        res.status(201).json({
            success: true,
            message: `User created successfully`,
            user: newAdminData,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

//  Login admin
interface ILoginAdminInput {
    username: string;
    password: string;
}

export const loginAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { username, password }: ILoginAdminInput = req.body;

    if (!username || !password) {
        return next(new ErrorHandler("Please provide username and password", 400));
    }

    const adminUser = await Admin.findOne({ username }).select("+hashed_password");

    if (!adminUser) {
        return next(new ErrorHandler("Invalid credentials", 401));
    }

    const isPasswordMatch = await adminUser.comparePassword(password);

    if (!isPasswordMatch) {
        return next(new ErrorHandler("Invalid credentials", 401));
    }

    const accessToken = adminUser.signAccessToken();
});
