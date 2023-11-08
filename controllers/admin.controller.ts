import asyncHandler from "express-async-handler";
import Admin, { IAdmin } from "../models/Admin.model";
import ErrorHandler from "../utils/ErrorHandler";
import jwt, { Secret, JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import validator from "validator";
import { validateStrongPassword } from "../utils/validate";
import { createAdminPasswordResetCode } from "../services/admin/createTokens";
import { validateAdminPasswordResetCode, verifyResetPasswordService } from "../services/admin/validateTokens";

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

// Update logged in admin User profile
export const updateSelfProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Middleware would handle getting user id from jwt token
    // Middleware would handle roles and permissions

    // Get admin id from admin object in request
    const adminId = req.admin?._id;
    // Get fields to update from body {firstName, lastName, username, email, avatar}
    const { firstName, lastName, username, email, avatar }: IAdmin = req.body;

    // Update admin profile in database
    const updateAdmin = await Admin.findByIdAndUpdate(
        adminId,
        { firstName, lastName, username, email, avatar },
        { new: true }
    );

    // Send response
    const userData = {
        _id: updateAdmin?._id,
        firstName: updateAdmin?.firstName,
        lastName: updateAdmin?.lastName,
        username: updateAdmin?.username,
        email: updateAdmin?.email,
        role: updateAdmin?.role,
        avatar: updateAdmin?.avatar,
    };

    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: userData,
    });
});

// Delete logged in admin User profile
export const deleteSelfProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Middleware would handle getting user id from jwt token & handle roles and permissions.

    // Get admin id from admin object in request
    const adminId = req.admin?._id;

    // Delete admin profile in database
    await Admin.findByIdAndDelete(adminId);

    // Send response
    res.status(200).json({
        success: true,
        message: "User deleted successfully",
    });
});

// update logged in admin password
export const updateSelfPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Middleware would handle getting user id from jwt token & handle roles and permissions.

    // Get admin id from admin object in request
    const adminId = req.admin?._id;

    // Get fields to update from body {currentPassword, newPassword}
    const { currentPassword, newPassword } = req.body;

    // Validate if password is strong (8 characters, including 1 uppercase letter, 1 lowercase letter, 1 number, and 1 symbol)
    validateStrongPassword(newPassword);

    // Check if admin exists
    const admin = await Admin.findById(adminId).select("+hashed_password");
    if (!admin) return next(new ErrorHandler("Admin not found", 404));

    // Check if current password matches
    const isPasswordMatch = await admin.comparePassword(currentPassword);
    if (!isPasswordMatch) return next(new ErrorHandler("Current password is incorrect", 400));

    // Update admin
    admin.hashed_password = newPassword;
    await admin.save();

    // generate new token
    const accessToken = admin.signAccessToken();

    // Send response
    res.status(200).json({
        success: true,
        message: "Password updated successfully",
        accessToken,
    });
});

// forgot password
export const forgotPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // users can send email or username to reset password
    // get email or username from body
    const { emailOrUsername } = req.body;

    // validate if email or username is provided
    if (!emailOrUsername) {
        return next(new ErrorHandler("Please provide email or username", 400));
    }

    // validate if email or username is valid
    if (!validator.isEmail(emailOrUsername) && !validator.isAlphanumeric(emailOrUsername)) {
        return next(new ErrorHandler("Please provide valid email or username", 400));
    }

    // check if email or username exists in database
    const user = await Admin.findOne({ $or: [{ email: emailOrUsername }, { username: emailOrUsername }] });

    // if user doesn't exist then send response to contact upper management to reset password
    if (!user) return next(new ErrorHandler("User not found", 404));

    // if user exists then generate otp
    const token = await createAdminPasswordResetCode(user._id);

    // Send Email to user with token

    // send response
    res.status(200).json({
        success: true,
        message: "Password reset code sent to email",
        token,
    });
});

// verify reset password code
export const verifyResetPasswordCode = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const sessionData = await verifyResetPasswordService(req, next);

    // if session data is not valid then send error
    if (!sessionData) return next(new ErrorHandler("Access Denied!", 400));

    // send response
    res.status(200).json({
        success: true,
        message: "code verified",
        data: {
            code: sessionData.code,
            token: sessionData.token,
        },
    });
});

// reset password
export const resetPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // verify reset password code with service
    const sessionData = await verifyResetPasswordService(req, next);

    // if session data is not valid then send error
    if (!sessionData) return next(new ErrorHandler("Access Denied!", 400));

    // get password from body
    const { password } = req.body;

    // validate if password is strong
    validateStrongPassword(password);

    // if token exists then get admin from database
    const user = await Admin.findById(sessionData.userId);

    // if user doesn't exist then send response error
    if (!user) return next(new ErrorHandler("User not found", 404));

    // update admin password
    user.hashed_password = password;

    // save admin
    await user.save();

    // send response
    res.status(200).json({
        success: true,
        message: "Password reset successfully",
    });
});

// ------------------------------------------------------------------------------------------------------------------------------------

// Update admin
export const updateAdminUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // get req.admin from middleware
    const requestedUserRole = req.admin?.role;
    const requestedUserId = req.admin?._id;

    // Get update User id from params
    const existingUserId = req.params.id;

    //  Send error if requested user id and existing user id are same
    if (requestedUserId === existingUserId) {
        return next(new ErrorHandler("You cannot update your own user", 403));
    }

    // Get fields to update from body {firstName, lastName, username, email, role, avatar, status}
    const { firstName, lastName, username, email, role, avatar, status }: IAdmin = req.body;

    // Check if admin exists
    const existingUser = await Admin.findById(existingUserId);

    if (!existingUser) {
        return next(new ErrorHandler("User not found", 404));
    }

    const existingUserRole = existingUser?.role;

    // check if requested user is super admin
    if (requestedUserRole === "superadmin") {
        existingUser.firstName = firstName;
        existingUser.lastName = lastName;
        existingUser.username = username;
        existingUser.email = email;
        existingUser.role = role;
        existingUser.avatar = avatar;
        existingUser.status = status;
    }
    // Check if requested user is admin
    else if (requestedUserRole === "admin") {
        // check if existing user is super admin
        if (existingUserRole === "superadmin") {
            return next(new ErrorHandler("You cannot update a superadmin", 403));
        }
        // check if existing user is admin and send error
        else if (existingUserRole === "admin") {
            return next(new ErrorHandler("You cannot update another admin", 403));
        }
        // check if existing user is moderator
        else if (existingUserRole === "moderator") {
            //   admins can not update role of existing moderator
            if (role) {
                return next(new ErrorHandler("You cannot update role of existing moderator", 403));
            }

            existingUser.firstName = firstName;
            existingUser.lastName = lastName;
            existingUser.username = username;
            existingUser.email = email;
            existingUser.avatar = avatar;
            existingUser.status = status;
        } else {
            return next(new ErrorHandler("You are not permitted for updates", 400));
        }
    }
    // No other user can update any other user
    else {
        return next(new ErrorHandler("You are not permitted for updates", 400));
    }

    // Update admin
    const updatedUser = await existingUser.save();

    // Send response
    const userData = {
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        status: updatedUser.status,
    };

    res.status(200).json({
        success: true,
        message: "User updated successfully",
        user: userData,
    });
});

// Delete admin
export const deleteAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // get req.admin from middleware
    const requestedUserRole = req.admin?.role;
    const requestedUserId = req.admin?._id;

    // Get update User id from params
    const existingUserId = req.params.id;

    //  Send error if requested user id and existing user id are same
    if (requestedUserId === existingUserId) return next(new ErrorHandler("unauthorized!", 403));

    // Check if admin exists
    const existingUser = await Admin.findById(existingUserId);
    if (!existingUser) return next(new ErrorHandler("User not found", 404));
    const existingUserRole = existingUser?.role;

    // Moderators are not allowed to delete any other user
    if (requestedUserRole === "moderator") return next(new ErrorHandler("unauthorized!", 403));

    // admins can not delete super admin
    if (requestedUserRole === "admin" && existingUserRole === "superadmin")
        return next(new ErrorHandler("You cannot delete a superadmin", 403));

    // admins can not delete another admin
    if (requestedUserRole === "admin" && existingUserRole === "admin")
        return next(new ErrorHandler("You cannot delete another admin", 403));

    // Delete admin
    const deleted = await existingUser.deleteOne();

    if (!deleted) return next(new ErrorHandler("Something went wrong", 500));

    // Send response
    res.status(200).json({
        success: true,
        message: "User deleted successfully",
    });
});

// Get all admins
export const getAllAdmins = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // get req.admin from middleware
    const requestedUserRole = req.admin?.role;

    const users = await Admin.find();

    if (!users) return next(new ErrorHandler("Something went wrong", 500));
    if (users.length === 0) return next(new ErrorHandler("No users found", 404));

    let usersArr = [] as IAdmin[];

    // only super admin can get all admins
    if (requestedUserRole === "superadmin") {
        usersArr = users;
    }

    // admins are not allowed to get super admins but get all other admins and moderators
    if (requestedUserRole === "admin") {
        usersArr = users.filter((user) => user.role !== "superadmin");
    }

    // send response
    res.status(200).json({
        success: true,
        message: "All users",
        users: usersArr,
    });
});

// Get single admin
export const getAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // get req.admin from middleware
    const requestedUserRole = req.admin?.role;

    // Get user id from params
    const existingUserId = req.params.id;

    // Moderators are not allowed to get any other user
    if (requestedUserRole === "moderator") return next(new ErrorHandler("unauthorized!", 403));

    // Only super admin can get another superAdmin and admin
    if (requestedUserRole === "admin" && existingUserId === "superadmin")
        return next(new ErrorHandler("You cannot get a superadmin", 403));

    if (requestedUserRole === "admin" && existingUserId === "admin")
        return next(new ErrorHandler("You cannot get another admin", 403));

    const user = await Admin.findById(existingUserId);

    if (!user) return next(new ErrorHandler("User not found", 404));

    // Send response
    const userData = {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        status: user.status,
    };
});
