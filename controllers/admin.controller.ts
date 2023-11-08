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

    // check if admin user status is active - status is boolean
    if (!adminUser.status) {
        return next(new ErrorHandler("Your account is not active. Please contact your administrator", 401));
    }

    const isPasswordMatch = await adminUser.comparePassword(password);

    if (!isPasswordMatch) {
        return next(new ErrorHandler("Invalid credentials", 401));
    }

    // generate jwt {_id}
    const accessToken = adminUser.signAccessToken();

    if (!accessToken) {
        return next(new ErrorHandler("Something went wrong", 500));
    }

    // send JWT, and initial required parameteres of admin object as Response

    const userData = {
        _id: adminUser._id,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role,
        avatar: adminUser.avatar,
    };

    res.status(200).json({
        success: true,
        message: "Login successful",
        user: userData,
        accessToken,
    });
});

// Logout admin
export const logoutAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // remove jwt from redis cache
    // send response
});

// Get session admin
export const getAdminSession = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Get JWT Token from header -> check if jwt can be decoded -> get admin id from jwt payload -> get admin from database -> check jwt expiry time left -> if jwt expiry time is less or equal to 24 hours then create new jwt -> send response

    // jwt validation and receiving admin id will be handled by middleware

    // Get User id from admin object in request
    const adminId = req.admin?._id;

    // Get admin from database
    const admin = await Admin.findById(adminId);

    // Check if admin exists
    if (!admin) {
        return next(new ErrorHandler("Admin not found", 404));
    }

    // Check if admin status is active
    if (!admin.status) {
        return next(new ErrorHandler("Your account is not active. Please contact your administrator", 401));
    }

    // generate new access token if expiry time is less than 24 hours
    let accessToken = req.headers.authorization?.split(" ")[1];

    // Send response
    const userData = {
        _id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        avatar: admin.avatar,
    };

    res.status(200).json({
        success: true,
        message: "Admin session",
        user: userData,
        accessToken,
    });
});

// Update admin
export const updateAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // get req.admin from middleware
    const adminRole = req.admin?.role;
    const adminId = req.admin?._id;

    // Get update User id from params
    const updateAdminId = req.params.id;

    // Get fields to update from body {firstName, lastName, username, email, role, avatar, status}
    const { firstName, lastName, username, email, role, avatar, status }: IAdmin = req.body;

    // Check if admin exists
    const admin = await Admin.findById(updateAdminId);

    if (!admin) {
        return next(new ErrorHandler("Admin not found", 404));
    }

    // Check if requested admin is super admin and existing admin role is super admin
    if (adminRole === "superadmin" && admin.role === "superadmin") {
        admin.firstName = firstName;
        admin.lastName = lastName;
        admin.username = username;
        admin.email = email;
        admin.role = role;
        admin.avatar = avatar;
        admin.status = status;
    }
    // Check if requested admin is admin and existing admin role is admin
    else if (adminRole === "admin" && admin.role === "admin") {
        if (adminId === updateAdminId) {
            admin.firstName = firstName;
            admin.lastName = lastName;
            admin.username = username;
            admin.email = email;
            admin.avatar = avatar;
            admin.status = status;
        } else {
            return next(new ErrorHandler("Admin not allowed to update another admin", 403));
        }
    }
    // Check if requested admin is admin and existing admin role is super admin
    else if (adminRole === "admin" && admin.role === "superadmin") {
        return next(new ErrorHandler("Admin not allowed to update superadmin", 403));
    }
    // Check if requested admin is admin and existing admin role is moderator
    else if (adminRole === "admin" && admin.role === "moderator") {
        if (adminId === updateAdminId) {
            admin.firstName = firstName;
            admin.lastName = lastName;
            admin.username = username;
            admin.email = email;
            admin.avatar = avatar;
            admin.status = status;
        } else {
            return next(new ErrorHandler("Admin not allowed to update another moderator", 403));
        }
    }
    // Check if requested admin is moderator and existing admin role is moderator
    else if (adminRole === "moderator" && admin.role === "moderator") {
        if (adminId === updateAdminId) {
            admin.firstName = firstName;
            admin.lastName = lastName;
            admin.username = username;
            admin.email = email;
            admin.avatar = avatar;
            admin.status = status;
        } else {
            return next(new ErrorHandler("Moderator not allowed to update another moderator", 403));
        }
    }
    // Check if requested admin is moderator and existing admin role is admin or super admin
    else if (adminRole === "moderator" && (admin.role === "admin" || admin.role === "superadmin")) {
        return next(new ErrorHandler("Moderator not allowed to update admin or superadmin", 403));
    }

    await admin.save();

    res.status(200).json({
        success: true,
        data: admin,
    });
});

// Delete admin
export const deleteAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // get req.admin from middleware
    // Get admin id from params
    // Check if admin exists
    // Moderators are not allowed to delete any other user
    // Only super admin can delete another superAdmin and admin
    // Only admin & super admin can delete a moderator
    // Delete admin
    // Send response
});

// Get all admins
export const getAllAdmins = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // only super admin can get all admins
    // admins are not allowed to get super admins but get all other admins and moderators
    // moderators are not allowed to get all admins
    // Fetch admins from database
});

// Get single admin
export const getAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // get req.admin from middleware
    // Get admin id from params
    // Check if admin exists
    // Moderators are not allowed to get any other user
    // Only super admin can get another superAdmin and admin
    // Only admin & super admin can get a moderator
    // Fetch admin from database
    // Send response
});

// update logged in admin profile
export const updateAdminProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // get req.admin from middleware
    // Get fields to update from body {firstName, lastName, username, email, avatar}
    // Check if admin exists
    // Update admin
    // Send response
});

// update logged in admin password
export const updateAdminPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // get req.admin from middleware
    // Get fields to update from body {currentPassword, newPassword}
    // Check if admin exists
    // Validate if password is strong (8 characters, including 1 uppercase letter, 1 lowercase letter, 1 number, and 1 symbol)
    // Check if current password matches
    // Update admin
    // Send response
});

// forgot password
export const forgotPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // check if request body is email or username
    // if username then check if admin and email exists
    // if email doens't exist in database then send response to contact upper management to reset password
    // if email exists then generate reset token and send email to admin with password reset link
    // send response to check email for password reset link
});

// reset password
export const resetPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // get token from params
    // get password from body
    // validate if password is strong
    // check if token exists in database
    // if token exists then get admin id from token
    // if token doesn't exist then send response to contact upper management to reset password
    // if token exists then get admin from database
    // update admin password
    // send response
});
