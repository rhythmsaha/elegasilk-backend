"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdmin = exports.getAllAdmins = exports.deleteAdmin = exports.updateAdminUser = exports.resetPassword = exports.verifyResetPasswordCode = exports.forgotPassword = exports.updateSelfPassword = exports.deleteSelfProfile = exports.updateSelfProfile = exports.getAdminSession = exports.loginAdmin = exports.registerNewAdmin = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Admin_model_1 = __importDefault(require("../../models/Admin.model"));
const ErrorHandler_1 = __importDefault(require("../../utils/ErrorHandler"));
const validator_1 = __importDefault(require("validator"));
const validate_1 = require("../../utils/validate");
const createTokens_1 = require("../../services/admin/createTokens");
const validateTokens_1 = require("../../services/admin/validateTokens");
const AdminSession_1 = __importDefault(require("../../utils/admin/AdminSession"));
/**
 * Registers a new admin user.
 *
 * @remarks
 * Only super admin can create another superAdmin and admin. Only admin & super admin can create a moderator. Moderators are not allowed to create any other user.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function.
 * @returns A JSON response with the newly created admin user data.
 *
 * @throws {ErrorHandler} 400 error if admin already exists. 403 error if user role is not authorized. 500 error for any other server error.
 */
exports.registerNewAdmin = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { firstName, lastName, username, email, password, role, avatar, status } = req.body;
    try {
        // Check user role
        const adminRole = (_a = req.admin) === null || _a === void 0 ? void 0 : _a.role;
        // Only super admin can create another superAdmin and admin
        if (adminRole !== "superadmin" && role === "superadmin") {
            return next(new ErrorHandler_1.default("Only superadmin can create a superadmin", 403));
        }
        if (adminRole !== "superadmin" && role === "admin") {
            return next(new ErrorHandler_1.default("Only superadmin can create an admin", 403));
        }
        // Only admin & super admin can create a moderator
        if (adminRole !== "superadmin" && adminRole !== "admin" && role === "moderator") {
            return next(new ErrorHandler_1.default("Only admin can create a moderator", 403));
        }
        // Moderators are not allowed to create any other user
        if (adminRole === "moderator") {
            return next(new ErrorHandler_1.default("Moderators are not allowed to create any other user", 403));
        }
        // Check if admin already exists
        const adminExists = yield Admin_model_1.default.exists({ $or: [{ username }, { email }] });
        if (adminExists && adminExists._id) {
            return next(new ErrorHandler_1.default("Admin already exists", 400));
        }
        // Validate if password is strong (8 characters, including 1 uppercase letter, 1 lowercase letter, 1 number, and 1 symbol)
        (0, validate_1.validateStrongPassword)(password);
        // Create new admin
        const admin = yield Admin_model_1.default.create({
            firstName: firstName.toLowerCase(),
            lastName: lastName.toLowerCase(),
            username: username.toLowerCase(),
            email: email === null || email === void 0 ? void 0 : email.toLowerCase(),
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
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
}));
/**
 * Logs in an admin user and returns a JWT access token along with the user data.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A JSON response with a success message, user data, and access token.
 * @throws An error if the username or password is missing, the credentials are invalid, or there is an issue generating the access token.
 */
exports.loginAdmin = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    if (!username || !password) {
        return next(new ErrorHandler_1.default("Please provide username and password", 400));
    }
    const adminUser = yield Admin_model_1.default.findOne({ username }).select("+hashed_password");
    if (!adminUser) {
        return next(new ErrorHandler_1.default("Invalid credentials!", 401));
    }
    // check if admin user status is active - status is boolean
    if (!adminUser.status) {
        return next(new ErrorHandler_1.default("Your account is not active. Please contact your administrator", 401));
    }
    const isPasswordMatch = yield adminUser.comparePassword(password);
    if (!isPasswordMatch) {
        return next(new ErrorHandler_1.default("Invalid credentials!", 401));
    }
    // send JWT, and initial required parameteres of admin object as Response
    const adminSession = AdminSession_1.default.from(adminUser);
    const loginSession = adminSession.loginSession;
    res.status(200).json(loginSession);
}));
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
exports.getAdminSession = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    // Get User id from admin object in request
    const adminId = (_b = req.admin) === null || _b === void 0 ? void 0 : _b._id;
    // Get admin from database
    const admin = yield Admin_model_1.default.findById(adminId);
    // Check if admin exists
    if (!admin) {
        return next(new ErrorHandler_1.default("Admin not found", 404));
    }
    // Check if admin status is active
    if (!admin.status) {
        return next(new ErrorHandler_1.default("Your account is not active. Please contact your administrator", 401));
    }
    const adminSession = AdminSession_1.default.from(admin);
    const refreshTokenSession = adminSession.refreshTokenSession;
    // Send response
    res.status(200).json(refreshTokenSession);
}));
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
exports.updateSelfProfile = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    // Get admin id from admin object in request
    const adminId = (_c = req.admin) === null || _c === void 0 ? void 0 : _c._id;
    // Get fields to update from body {firstName, lastName, username, email, avatar}
    const { firstName, lastName, username, email, avatar } = req.body;
    // Update admin profile in database
    const updateAdmin = yield Admin_model_1.default.findByIdAndUpdate(adminId, { firstName, lastName, username, email, avatar }, { new: true });
    if (!updateAdmin)
        return next(new ErrorHandler_1.default("Something went wrong", 500));
    const adminSession = AdminSession_1.default.from(updateAdmin);
    const updateProfileSession = adminSession.updateProfileSession;
    // Send response
    res.status(200).json(updateProfileSession);
}));
/**
 * Deletes the profile of the currently logged in admin user.
 * @function
 * @async
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next function.
 * @returns {Promise<void>} - Promise that resolves with no value.
 */
exports.deleteSelfProfile = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Middleware would handle getting user id from jwt token & handle roles and permissions.
    var _d;
    // Get admin id from admin object in request
    const adminId = (_d = req.admin) === null || _d === void 0 ? void 0 : _d._id;
    yield Admin_model_1.default.findByIdAndDelete(adminId);
    // Send response
    res.status(200).json({
        success: true,
        message: "User deleted successfully",
    });
}));
/**
 * Updates the password of the authenticated admin user.
 * @param req - The request object containing the admin user's id and the current and new passwords.
 * @param res - The response object to send the success message and the new access token.
 * @param next - The next middleware function to handle errors.
 * @returns A JSON response with a success message and a new access token.
 */
exports.updateSelfPassword = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Middleware would handle getting user id from jwt token & handle roles and permissions.
    var _e;
    // Get admin id from admin object in request
    const adminId = (_e = req.admin) === null || _e === void 0 ? void 0 : _e._id;
    // Get fields to update from body {currentPassword, newPassword}
    const { currentPassword, newPassword } = req.body;
    // Validate if password is strong (8 characters, including 1 uppercase letter, 1 lowercase letter, 1 number, and 1 symbol)
    (0, validate_1.validateStrongPassword)(newPassword);
    // Check if admin exists
    const admin = yield Admin_model_1.default.findById(adminId).select("+hashed_password");
    if (!admin)
        return next(new ErrorHandler_1.default("Admin not found", 404));
    // Check if current password matches
    const isPasswordMatch = yield admin.comparePassword(currentPassword);
    if (!isPasswordMatch)
        return next(new ErrorHandler_1.default("Current password is incorrect", 400));
    // Update admin
    admin.hashed_password = newPassword;
    const saveAdmin = yield admin.save();
    if (!saveAdmin)
        return next(new ErrorHandler_1.default("Something went wrong", 500));
    // generate new token
    const accessToken = admin.signAccessToken();
    // Send response
    res.status(200).json({
        success: true,
        message: "Password updated successfully",
        accessToken,
    });
}));
/**
 * Forgot password controller for admin users.
 * @param req - Express Request object.
 * @param res - Express Response object.
 * @param next - Express NextFunction object.
 * @returns Returns a JSON response indicating success or failure of the password reset request.
 */
exports.forgotPassword = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // users can send email or username to reset password
    // get email or username from body
    const emailOrUsername = req.params.query;
    // validate if email or username is provided
    if (!emailOrUsername) {
        return next(new ErrorHandler_1.default("Please provide email or username", 400));
    }
    // validate if email or username is valid
    if (!validator_1.default.isEmail(emailOrUsername) && !validator_1.default.isAlphanumeric(emailOrUsername)) {
        return next(new ErrorHandler_1.default("Please provide valid email or username", 400));
    }
    // check if email or username exists in database
    const user = yield Admin_model_1.default.findOne({
        $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });
    // if user doesn't exist then send response to contact upper management to reset password
    if (!user)
        return next(new ErrorHandler_1.default("User not found", 404));
    // if user exists then generate otp
    const token = yield (0, createTokens_1.createAdminPasswordResetCode)(user._id);
    // Send Email to user with token
    // send response
    res.status(200).json({
        success: true,
        message: "Password reset code sent to email",
        token,
    });
}));
/**
 * Verify reset password code
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction object
 * @returns Promise<void>
 */
exports.verifyResetPasswordCode = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const sessionData = yield (0, validateTokens_1.verifyResetPasswordService)(req, next);
    // if session data is not valid then send error
    if (!sessionData)
        return next(new ErrorHandler_1.default("Access Denied!", 400));
    // send response
    res.status(200).json({
        success: true,
        message: "code verified",
        data: {
            code: sessionData.code,
            token: sessionData.token,
        },
    });
}));
/**
 * Reset the password of an admin user.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A JSON response indicating whether the password reset was successful or not.
 */
exports.resetPassword = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // verify reset password code with service
    const sessionData = yield (0, validateTokens_1.verifyResetPasswordService)(req, next);
    // if session data is not valid then send error
    if (!sessionData)
        return next(new ErrorHandler_1.default("Access Denied!", 400));
    // get password from body
    const { password } = req.body;
    // validate if password is strong
    (0, validate_1.validateStrongPassword)(password);
    // if token exists then get admin from database
    const user = yield Admin_model_1.default.findById(sessionData.userId);
    // if user doesn't exist then send response error
    if (!user)
        return next(new ErrorHandler_1.default("User not found", 404));
    // update admin password
    user.hashed_password = password;
    // save admin
    yield user.save();
    // send response
    res.status(200).json({
        success: true,
        message: "Password reset successfully",
    });
}));
// ------------------------------------------------------------------
/**
 * Update an admin user.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A JSON response indicating whether the user was updated successfully or not.
 */
exports.updateAdminUser = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _f, _g;
    // get req.admin from middleware
    const requestedUserRole = (_f = req.admin) === null || _f === void 0 ? void 0 : _f.role;
    const requestedUserId = (_g = req.admin) === null || _g === void 0 ? void 0 : _g._id;
    // Get update User id from params
    const existingUserId = req.params.id;
    //  Send error if requested user id and existing user id are same
    if (requestedUserId === existingUserId) {
        return next(new ErrorHandler_1.default("You cannot update your own user", 403));
    }
    // Get fields to update from body {firstName, lastName, username, email, role, avatar, status}
    let { firstName, lastName, username, email, role, avatar, status } = req.body;
    // convert to lowercase
    firstName = firstName === null || firstName === void 0 ? void 0 : firstName.toLowerCase();
    lastName = lastName === null || lastName === void 0 ? void 0 : lastName.toLowerCase();
    username = username === null || username === void 0 ? void 0 : username.toLowerCase();
    email = email === null || email === void 0 ? void 0 : email.toLowerCase();
    // Check if admin exists
    const existingUser = yield Admin_model_1.default.findById(existingUserId);
    if (!existingUser) {
        return next(new ErrorHandler_1.default("User not found", 404));
    }
    const existingUserRole = existingUser === null || existingUser === void 0 ? void 0 : existingUser.role;
    // check if requested user is super admin
    if (requestedUserRole === "superadmin") {
        existingUser.firstName = firstName;
        existingUser.lastName = lastName;
        existingUser.username = username;
        existingUser.email = email;
        existingUser.role = role;
        existingUser.status = status;
        if (avatar) {
            existingUser.avatar = avatar;
        }
    }
    // Check if requested user is admin
    else if (requestedUserRole === "admin") {
        // check if existing user is super admin
        if (existingUserRole === "superadmin") {
            return next(new ErrorHandler_1.default("You cannot update a superadmin", 403));
        }
        // check if existing user is admin and send error
        else if (existingUserRole === "admin") {
            return next(new ErrorHandler_1.default("You cannot update another admin", 403));
        }
        // check if existing user is moderator
        else if (existingUserRole === "moderator") {
            //   admins can not update role of existing moderator
            if (role !== "moderator") {
                return next(new ErrorHandler_1.default("You cannot update role of existing moderator", 403));
            }
            existingUser.firstName = firstName;
            existingUser.lastName = lastName;
            existingUser.username = username;
            existingUser.email = email;
            existingUser.status = status;
            if (avatar) {
                existingUser.avatar = avatar;
            }
        }
        else {
            return next(new ErrorHandler_1.default("You are not permitted for updates", 400));
        }
    }
    // No other user can update any other user
    else {
        return next(new ErrorHandler_1.default("You are not permitted for updates", 400));
    }
    // Update admin
    const updatedUser = yield existingUser.save();
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
}));
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
exports.deleteAdmin = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _h, _j;
    // get req.admin from middleware
    const requestedUserRole = (_h = req.admin) === null || _h === void 0 ? void 0 : _h.role;
    const requestedUserId = (_j = req.admin) === null || _j === void 0 ? void 0 : _j._id;
    // Get update User id from params
    const existingUserId = req.params.id;
    //  Send error if requested user id and existing user id are same
    if (requestedUserId === existingUserId)
        return next(new ErrorHandler_1.default("unauthorized!", 403));
    // Check if admin exists
    const existingUser = yield Admin_model_1.default.findById(existingUserId);
    if (!existingUser)
        return next(new ErrorHandler_1.default("User not found", 404));
    const existingUserRole = existingUser === null || existingUser === void 0 ? void 0 : existingUser.role;
    // Moderators are not allowed to delete any other user
    if (requestedUserRole === "moderator")
        return next(new ErrorHandler_1.default("unauthorized!", 403));
    // admins can not delete super admin
    if (requestedUserRole === "admin" && existingUserRole === "superadmin")
        return next(new ErrorHandler_1.default("You cannot delete a superadmin", 403));
    // admins can not delete another admin
    if (requestedUserRole === "admin" && existingUserRole === "admin")
        return next(new ErrorHandler_1.default("You cannot delete another admin", 403));
    // Delete admin
    const deleted = yield existingUser.deleteOne();
    if (!deleted)
        return next(new ErrorHandler_1.default("Something went wrong", 500));
    // Send response
    res.status(200).json({
        success: true,
        message: "User deleted successfully",
    });
}));
/**
 * Get all admins
 * @route GET /api/v1/admins
 * @access Private (superadmin, admin)
 */
exports.getAllAdmins = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _k;
    // get req.admin from middleware
    const requestedUserRole = (_k = req.admin) === null || _k === void 0 ? void 0 : _k.role;
    const users = yield Admin_model_1.default.find();
    if (!users)
        return next(new ErrorHandler_1.default("Something went wrong", 500));
    if (users.length === 0)
        return next(new ErrorHandler_1.default("No users found", 404));
    let usersArr = [];
    // only super admin can get all admins
    if (requestedUserRole === "superadmin") {
        usersArr = users;
    }
    // admins are not allowed to get super admins but get all other admins and moderators
    if (requestedUserRole === "admin") {
        const requestedUser = users.find((user) => { var _a; return user._id.toString() === ((_a = req.admin) === null || _a === void 0 ? void 0 : _a._id.toString()); });
        usersArr = users.filter((user) => user.role !== "superadmin" && user.role !== "admin");
        usersArr.push(requestedUser);
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
        message: "All users",
        users: formattedUsers,
    });
}));
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
exports.getAdmin = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _l;
    // get req.admin from middleware
    const requestedUserRole = (_l = req.admin) === null || _l === void 0 ? void 0 : _l.role;
    // Get user id from params
    const existingUserId = req.params.id;
    //  send error if requested user role is not authorized
    if (requestedUserRole !== "superadmin" && requestedUserRole !== "admin")
        return next(new ErrorHandler_1.default("unauthorized!", 403));
    // Check if admin exists
    const user = yield Admin_model_1.default.findById(existingUserId);
    // Send error if user is not found
    if (!user)
        return next(new ErrorHandler_1.default("User not found", 404));
    // Get existing user role
    const existingUserRole = user === null || user === void 0 ? void 0 : user.role;
    // Only super admin can get another superAdmin and admin
    if (requestedUserRole === "admin" && existingUserRole === "superadmin")
        return next(new ErrorHandler_1.default("You cannot get a superadmin", 403));
    if (requestedUserRole === "admin" && existingUserRole === "admin")
        return next(new ErrorHandler_1.default("You cannot get another admin", 403));
    const userData = AdminSession_1.default.from(user);
    const profile = userData.adminProfile;
    // Send response
    res.status(200).json({
        success: true,
        user: profile,
    });
}));
