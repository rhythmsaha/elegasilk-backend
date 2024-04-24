import asyncHandler from "express-async-handler";
import Admin, { IAdmin } from "../../models/Admin.model";
import ErrorHandler from "../../utils/ErrorHandler";
import AdminService from "../../services/admin/AdminService";
import { Request, Response, NextFunction } from "express";
import { ICreateAdminInput, ILoginAdminInput } from "../../types/typings";

/**
 * Registers a new admin user.
 *
 * @remarks
 * Only super admin can create another superAdmin and admin.
 * Only admin & super admin can create a moderator.
 * Moderators are not allowed to create any other user.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function.
 * @returns A JSON response with the newly created admin user data.
 *
 * @throws {ErrorHandler} 400 error if admin already exists. 403 error if user role is not authorized. 500 error for any other server error.
 */
export const registerNewAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { firstName, lastName, username, email, password, role, avatar, status }: ICreateAdminInput = req.body;

    // Check user role
    const adminRole = req.admin?.role;

    // Only super admin can create another superAdmin and admin
    if (adminRole !== "superadmin" && role === "superadmin") {
        throw new ErrorHandler("Only superadmin can create a superadmin", 403);
    }

    if (adminRole !== "superadmin" && role === "admin") {
        throw new ErrorHandler("Only superadmin can create an admin", 403);
    }

    // Only admin & super admin can create a moderator
    if (adminRole !== "superadmin" && adminRole !== "admin" && role === "moderator") {
        throw new ErrorHandler("Only admin can create a moderator", 403);
    }

    // Moderators are not allowed to create any other user
    if (adminRole === "moderator") {
        throw new ErrorHandler("Moderators are not allowed to create any other user", 403);
    }

    // Create new admin
    const admin = await AdminService.createAdmin({
        firstName,
        lastName,
        username,
        email,
        password,
        role,
        avatar,
        status,
    });

    res.status(201).json({
        success: true,
        message: `User created successfully`,
        user: admin,
    });
});

/**
 * Logs in an admin user and returns a JWT access token along with the user data.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A JSON response with a success message, user data, and access token.
 * @throws An error if the username or password is missing, the credentials are invalid, or there is an issue generating the access token.
 */
export const loginAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { username, password }: ILoginAdminInput = req.body;

    if (!username || !password) return next(new ErrorHandler("Please provide username and password", 400));

    const session = await AdminService.login(username, password);

    res.status(200).json(session);
});

/**
 * Retrieves the admin session by validating the JWT token from the header, getting the admin ID from the JWT payload, and retrieving the admin from the database. If the admin is not found or the account is inactive, an error is returned. If the admin is found, the user data is retrieved and cached in Redis for 30 days. A new JWT token is created if the expiry time is less than or equal to 24 hours. The user data and access token are sent in the response.
 * 
 * Get JWT Token from header -> check if jwt can be decoded -> get admin id from jwt payload -> get admin from database -> check jwt expiry time left -> if jwt expiry time is less or equal to 24 hours then create new jwt -> send response
 * JWT validation and receiving admin id will be handled by middleware

 * 
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns The admin session data and access token in the response.
 */
export const getAdminSession = asyncHandler(async (req: Request, res: Response) => {
    // Get User id from admin object in request
    const adminId = req.admin?._id;

    // get session
    const session = await AdminService.refreshSession(adminId);

    // Send response
    res.status(200).json(session);
});

/**
 * Updates the profile of the currently logged in admin.
 *
 * Middleware would handle getting user id from jwt token, roles and permissions
 *
 * @param req - The request object containing the admin's updated profile information.
 * @param res - The response object to send the updated admin profile information.
 * @param next - The next middleware function.
 * @returns A JSON response indicating success or failure of the profile update.
 */
export const updateSelfProfile = asyncHandler(async (req: Request, res: Response) => {
    // Get admin id from admin object in request
    const adminId = req.admin?._id;
    // Get fields to update from body {firstName, lastName, username, email, avatar}
    const { firstName, lastName, username, email, avatar }: IAdmin = req.body;

    const updatedAdmin = await AdminService.updateProfile(adminId, {
        firstName,
        lastName,
        username,
        email,
        avatar,
    });

    // Send response
    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: updatedAdmin,
    });
});

/**
 * Deletes the profile of the currently logged in admin user.
 * @function
 * @async
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next function.
 * @returns {Promise<void>} - Promise that resolves with no value.
 */
export const deleteSelfProfile = asyncHandler(async (req: Request, res: Response) => {
    // Middleware would handle getting user id from jwt token & handle roles and permissions.

    // Get admin id from admin object in request
    const adminId = req.admin?._id;

    await AdminService.deleteAdmin(adminId);

    // Send response
    res.status(200).json({
        success: true,
        message: "User deleted successfully",
    });
});

/**
 * Updates the password of the authenticated admin user.
 * @param req - The request object containing the admin user's id and the current and new passwords.
 * @param res - The response object to send the success message and the new access token.
 * @param next - The next middleware function to handle errors.
 * @returns A JSON response with a success message and a new access token.
 */
export const updateSelfPassword = asyncHandler(async (req: Request, res: Response) => {
    const adminId = req.admin?._id;

    const { currentPassword, newPassword } = req.body;

    const session = await AdminService.updatePassword(adminId, currentPassword, newPassword);

    res.status(200).json({
        success: true,
        message: "Password updated successfully",
        session,
    });
});

/**
 * Forgot password controller for admin users.
 * @param req - Express Request object.
 * @param res - Express Response object.
 * @param next - Express NextFunction object.
 * @returns Returns a JSON response indicating success or failure of the password reset request.
 */
export const forgotPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // get email or username from body
    const emailOrUsername = req.params.query;

    // validate if email or username is provided
    if (!emailOrUsername) {
        return next(new ErrorHandler("Please provide email or username", 400));
    }

    // Send Email to user with token
    const token = await AdminService.sendPasswordResetEmail(emailOrUsername);

    // send response
    res.status(200).json({
        success: true,
        message: "Password reset code sent to email",
        token,
    });
});

/**
 * Verify reset password code
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction object
 * @returns Promise<void>
 */
export const verifyResetPasswordCode = asyncHandler(async (req: Request, res: Response) => {
    // Get token and code from body
    const { token, code } = req.body;

    // Call Reset Password Service
    const sessionData = await AdminService.verifyPasswordResetCode(token, code);

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

/**
 * Reset the password of an admin user.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A JSON response indicating whether the password reset was successful or not.
 */
export const resetPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { token, code, newPassword } = req.body;

    if (!token) return next(new ErrorHandler("Please provide token", 400));
    if (!code) return next(new ErrorHandler("Please provide code", 400));
    if (!newPassword) return next(new ErrorHandler("Please provide new password", 400));

    await AdminService.resetPassword(token, code, newPassword);

    // send response
    res.status(200).json({
        success: true,
        message: "Password reset successfully",
    });
});

// ------------------------------------------------------------------

/**
 * Update an admin user.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A JSON response indicating whether the user was updated successfully or not.
 */
export const updateAdminUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    let { firstName, lastName, username, email, role, avatar, status }: IAdmin = req.body;

    const requestedUserRole = req.admin?.role;
    const requestedUserId = req.admin?._id;

    const existingUserId = req.params.id;

    if (requestedUserId === existingUserId) throw new ErrorHandler("Access Denied!", 403);

    const existingUserRole = await AdminService.getRole(existingUserId);

    if (requestedUserRole === "superadmin") {
        const updatedUser = await AdminService.updateProfile(existingUserId, {
            firstName,
            lastName,
            username,
            email,
            role,
            avatar,
            status,
        });

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            user: updatedUser,
        });

        return;
    } else if (requestedUserRole === "admin" && existingUserRole === "moderator") {
        const updatedUser = await AdminService.updateProfile(existingUserId, {
            firstName,
            lastName,
            username,
            email,
            avatar,
            status,
        });

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            user: updatedUser,
        });

        return;
    } else {
        throw new ErrorHandler("Access Denied!", 403);
    }
});

/**
 * Deletes an admin user.
 * @function
 * @async
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next function.
 * @returns {Promise<void>} - Promise that resolves with no value.
 * @throws {ErrorHandler} - Throws an error if user is not found or if the requesting user is unauthorized.
 */
export const deleteAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const requestedUserRole = req.admin?.role;
    const requestedUserId = req.admin?._id;
    const existingUserId = req.params.id;

    if (requestedUserId === existingUserId) throw new ErrorHandler("Access Denied!", 403);

    const existingUserRole = await AdminService.getRole(existingUserId);

    if (existingUserRole === "superadmin" && requestedUserRole !== "superadmin") {
        throw new ErrorHandler("Access Denied!", 403);
    }

    if (requestedUserRole === "admin" && existingUserRole === "admin") {
        throw new ErrorHandler("Access Denied!", 403);
    }

    if (requestedUserRole === "moderator") {
        throw new ErrorHandler("Access Denied!", 403);
    }

    // Delete admin
    await AdminService.deleteAdmin(existingUserId);

    // Send response
    res.status(200).json({
        success: true,
        message: "User deleted successfully",
    });
});

/**
 * Get all admins
 * @route GET /api/v1/admins
 * @access Private (superadmin, admin)
 */
export const getAllAdmins = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const requestedUserRole = req.admin?.role;

    const users = await Admin.find();
    if (!users) return next(new ErrorHandler("Something went wrong", 500));
    if (users.length === 0) return next(new ErrorHandler("No users found", 404));

    let usersArr = [] as IAdmin[];

    // only super admin can get all admins
    if (requestedUserRole === "superadmin") usersArr = users;

    // admins are not allowed to get super admins but get all other admins and moderators
    if (requestedUserRole === "admin") {
        const requestedUser = users.find((user) => user._id.toString() === req.admin?._id.toString());
        usersArr = users.filter((user) => user.role !== "superadmin" && user.role !== "admin");
        usersArr.push(requestedUser as IAdmin);
    }

    const formattedUsers = usersArr.map((user) => {
        return {
            _id: user._id,
            fullName: `${user.firstName} ${user.lastName}`,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            status: user.status,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    });

    // send response
    res.status(200).json({
        success: true,
        users: formattedUsers,
    });
});

/**
 * Retrieves an admin user by ID.
 *
 * @async
 * @function
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next function.
 * @returns {Promise<void>} - Promise that resolves with the retrieved user data or an error.
 * @throws {ErrorHandler} - Error if user is not found or if the requesting user is unauthorized.
 */
export const getAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const requestedUserRole = req.admin?.role;
    const existingUserId = req.params.id;

    const user = await AdminService.getAdminProfile(existingUserId);

    if (requestedUserRole === "admin" && user.role !== "moderator") {
        throw new ErrorHandler("Access Denied!", 403);
    }

    res.status(200).json({
        success: true,
        user,
    });
});
