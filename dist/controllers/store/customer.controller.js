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
exports.resetPassword = exports.forgetPassword = exports.verifyCustomerEmail = exports.updateCustomerEmail = exports.getCustomerProfile = exports.deleteCustomerAccount = exports.updateCustomerPassword = exports.updateCustomerProfile = exports.refreshCustomerSession = exports.loginCustomer = exports.verifyCustomerAccount = exports.resendVerificationLink = exports.createCustomer = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Customer_model_1 = __importDefault(require("../../models/store/Customer.model"));
const ErrorHandler_1 = __importDefault(require("../../utils/ErrorHandler"));
const validator_1 = __importDefault(require("validator"));
const VerificationToken_model_1 = __importDefault(require("../../models/store/VerificationToken.model"));
const CustomerSession_1 = __importDefault(require("../../utils/customer/CustomerSession"));
const generateOtp_1 = __importDefault(require("../../utils/generateOtp"));
const verificationcode_model_1 = __importDefault(require("../../models/verificationcode.model"));
const crypto_1 = __importDefault(require("crypto"));
const mail_1 = require("../../lib/mail");
const checkRequestPermission = (id, req, res, next) => {
    var _a;
    if (id !== ((_a = req.customer) === null || _a === void 0 ? void 0 : _a._id)) {
        return next(new ErrorHandler_1.default("Unauthorized", 403));
    }
};
/**
 * Creates a new customer.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function.
 * @returns A JSON response indicating the success or failure of the customer creation.
 * @throws {ErrorHandler} If there is an error during customer creation.
 */
exports.createCustomer = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName, email, password } = req.body;
    try {
        // Check if admin already exists
        const customerExists = yield Customer_model_1.default.findOne({ email });
        if (customerExists && customerExists.verified)
            return next(new ErrorHandler_1.default("Customer already exists", 400));
        if (customerExists && !customerExists.verified)
            return (0, exports.resendVerificationLink)(req, res, next);
        // Create new customer
        const newCustomer = yield Customer_model_1.default.create({
            firstName,
            lastName,
            email,
            hashed_password: password,
        });
        if (!newCustomer)
            return next(new ErrorHandler_1.default("Customer registration failed", 400));
        // Generate verification token
        const token = new VerificationToken_model_1.default().createVerificationToken(newCustomer._id);
        const verificationToken = yield VerificationToken_model_1.default.create({
            userId: newCustomer._id,
            expireAt: new Date(Date.now() + 3600000),
            token: token,
        });
        if (!verificationToken) {
            return next(new ErrorHandler_1.default("Customer registration failed", 400));
        }
        // Send verification email
        const Host = process.env.STOREFRONT || "http://localhost:3000";
        const verificationLink = `${Host}/verifyaccount?token=${verificationToken.token}&customerId=${newCustomer._id}&tokenID=${verificationToken._id}`;
        const mailOptions = {
            from: "Elegasilk <elegasilk@gmail.com>",
            to: email,
            subject: "Verify Your Account",
            text: `Hey ${firstName}, Thank you for signing up. Please verify your email to activate your account. Click the link below to verify your account. ${verificationLink} If you did not sign up for this account, you can ignore this email and the account will remain inactive. Best, Elegasilk`,
        };
        (0, mail_1.sendMail)(mailOptions);
        res.status(201).json({
            success: true,
            message: "Please Check Your Email to Verify Your Account!",
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default("Customer registration failed", error.statusCode || 500));
    }
}));
/**
 * Resends the verification link to the customer's email.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function.
 * @returns A JSON response indicating the success status, verification link, and message.
 */
exports.resendVerificationLink = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!validator_1.default.isEmail(email)) {
        return next(new ErrorHandler_1.default("Invalid email", 400));
    }
    const customer = yield Customer_model_1.default.findOne({ email });
    if (!customer) {
        return next(new ErrorHandler_1.default("Account not found", 400));
    }
    if (customer.verified) {
        return next(new ErrorHandler_1.default("Account already verified", 400));
    }
    yield VerificationToken_model_1.default.findOneAndDelete({ userId: customer._id });
    const token = new VerificationToken_model_1.default().createVerificationToken(customer._id);
    const _verificationToken = new VerificationToken_model_1.default({
        userId: customer._id,
        expireAt: new Date(Date.now() + 3600000),
        token: token,
    });
    const saveToken = yield _verificationToken.save();
    if (!saveToken) {
        return next(new ErrorHandler_1.default("Failed to resend verification link", 400));
    }
    // Send verification email
    const Host = process.env.STOREFRONT || "http://localhost:3000";
    const verificationLink = `${Host}/verifyaccount?token=${token}&customerId=${customer._id}&tokenID=${saveToken._id}`;
    const mailOptions = {
        from: "Elegasilk <elegasilk@gmail.com>",
        to: email,
        subject: "Verify Your Account",
        text: `Hey ${customer.firstName}, Thank you for signing up. Please verify your email to activate your account. Click the link below to verify your account. ${verificationLink} If you did not sign up for this account, you can ignore this email and the account will remain inactive. Best, Elegasilk`,
    };
    (0, mail_1.sendMail)(mailOptions);
    res.status(201).json({
        success: true,
        link: verificationLink,
        message: "Verification link sent successfully",
    });
}));
/**
 * Verifies a customer account using a token and userId.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function.
 * @returns A JSON response indicating the success or failure of the account verification.
 */
exports.verifyCustomerAccount = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, userId, tokenId } = req.query;
    if (!userId || !token || !tokenId) {
        return next(new ErrorHandler_1.default("Invalid token", 400));
    }
    try {
        const verificationToken = yield VerificationToken_model_1.default.findById(tokenId);
        if (!verificationToken) {
            return next(new ErrorHandler_1.default("Invalid token", 400));
        }
        if (verificationToken.userId.toString() !== userId) {
            return next(new ErrorHandler_1.default("Invalid token", 400));
        }
        if (!verificationToken.verifyToken(token)) {
            return next(new ErrorHandler_1.default("Invalid token", 400));
        }
        const customer = yield Customer_model_1.default.findById(userId);
        if (!customer) {
            return next(new ErrorHandler_1.default("Account not found", 400));
        }
        customer.verified = true;
        const saveCustomer = yield customer.save();
        if (!saveCustomer) {
            return next(new ErrorHandler_1.default("Account verification failed", 400));
        }
        yield verificationToken.deleteOne();
        res.status(200).json({
            success: true,
            message: "Account verified successfully",
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
/**
 * Logs in a customer.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function.
 * @returns The login session of the customer.
 */
exports.loginCustomer = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new ErrorHandler_1.default("Please provide email and password", 400));
    }
    const customer = yield Customer_model_1.default.findOne({ email }).select("+hashed_password");
    if (!customer) {
        return next(new ErrorHandler_1.default("Account doesn't exist!", 404));
    }
    const comparePassword = yield customer.comparePassword(password);
    if (!comparePassword) {
        return next(new ErrorHandler_1.default("Invalid email or password!", 400));
    }
    if (!customer.verified) {
        return next(new ErrorHandler_1.default("Please verify your account!", 400));
    }
    if (!customer.status) {
        return next(new ErrorHandler_1.default("Account is disabled!", 400));
    }
    const session = CustomerSession_1.default.from(customer).loginSession;
    res.status(200).json(session);
}));
/**
 * Refreshes the customer session.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function.
 * @returns The refreshed customer session.
 */
exports.refreshCustomerSession = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Get customer id from request
    const customerId = (_a = req.customer) === null || _a === void 0 ? void 0 : _a._id;
    if (!customerId) {
        return next(new ErrorHandler_1.default("Please login to access this resource", 401));
    }
    // Find customer by id
    const customer = yield Customer_model_1.default.findById(customerId);
    if (!customer) {
        return next(new ErrorHandler_1.default("Customer not found", 404));
    }
    // Generate new session
    const session = CustomerSession_1.default.from(customer).refreshTokenSession;
    res.status(200).json(session);
}));
/**
 * Updates the profile of a customer.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A JSON response indicating the success of the profile update.
 * @throws {ErrorHandler} If the required fields are not provided or if the customer is not found.
 */
exports.updateCustomerProfile = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // checkRequestPermission(req.params.id, req, res, next);
    var _b;
    const { firstName, lastName, password, newPassword } = req.body;
    if (!firstName || !lastName) {
        return next(new ErrorHandler_1.default("Please provide all fields", 400));
    }
    const customer = yield Customer_model_1.default.findById((_b = req.customer) === null || _b === void 0 ? void 0 : _b._id).select("+hashed_password");
    if (!customer) {
        return next(new ErrorHandler_1.default("Customer not found", 404));
    }
    if (password) {
        const comparePassword = yield customer.comparePassword(password);
        if (!comparePassword) {
            return next(new ErrorHandler_1.default("Invalid password", 400));
        }
        if (!newPassword) {
            return next(new ErrorHandler_1.default("Please provide new password", 400));
        }
        customer.hashed_password = newPassword;
    }
    customer.firstName = firstName;
    customer.lastName = lastName;
    const saveCustomer = yield customer.save();
    if (!saveCustomer) {
        return next(new ErrorHandler_1.default("Failed to update profile", 400));
    }
    const user = saveCustomer.getCustomerProfile();
    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user,
    });
}));
/**
 * Updates the password of a customer.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A JSON response indicating the success of the password update.
 * @throws {ErrorHandler} If the required fields are not provided, customer is not found, or the current password is invalid.
 */
exports.updateCustomerPassword = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    checkRequestPermission(req.params.id, req, res, next);
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return next(new ErrorHandler_1.default("Please provide all fields", 400));
    }
    const customer = yield Customer_model_1.default.findById((_c = req.customer) === null || _c === void 0 ? void 0 : _c._id).select("+hashed_password");
    if (!customer) {
        return next(new ErrorHandler_1.default("Customer not found", 404));
    }
    const comparePassword = yield customer.comparePassword(currentPassword);
    if (!comparePassword) {
        return next(new ErrorHandler_1.default("Invalid password", 400));
    }
    customer.hashed_password = newPassword;
    yield customer.save();
    res.status(200).json({
        success: true,
        message: "Password updated successfully",
    });
}));
/**
 * Deletes a customer account.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next function.
 * @returns {Promise<void>} - A promise that resolves when the account is deleted.
 */
exports.deleteCustomerAccount = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    checkRequestPermission(req.params.id, req, res, next);
    const customer = yield Customer_model_1.default.findById((_d = req.customer) === null || _d === void 0 ? void 0 : _d._id);
    if (!customer) {
        return next(new ErrorHandler_1.default("Customer not found", 404));
    }
    yield customer.deleteOne();
    res.status(200).json({
        success: true,
        message: "Account deleted successfully",
    });
}));
/**
 * Retrieves the profile of a customer.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next function.
 * @returns {Promise<void>} - A promise that resolves with the customer profile.
 * @throws {ErrorHandler} - If the customer is not found.
 */
exports.getCustomerProfile = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    checkRequestPermission(req.params.id, req, res, next);
    const customer = yield Customer_model_1.default.findById((_e = req.customer) === null || _e === void 0 ? void 0 : _e._id);
    if (!customer) {
        return next(new ErrorHandler_1.default("Customer not found", 404));
    }
    const customerProfile = customer.getCustomerProfile();
    res.status(200).json({
        success: true,
        user: customerProfile,
    });
}));
/**
 * Updates the email of a customer.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A JSON response indicating the success of the operation, the updated email, and the verification ID.
 */
exports.updateCustomerEmail = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    checkRequestPermission(req.params.id, req, res, next);
    const { email } = req.body;
    if (!validator_1.default.isEmail(email)) {
        return next(new ErrorHandler_1.default("Invalid email", 400));
    }
    const emailExists = yield Customer_model_1.default.findOne({ email });
    if (emailExists) {
        return next(new ErrorHandler_1.default("Email already exists", 400));
    }
    const otp = (0, generateOtp_1.default)(4);
    const verificationCode = yield verificationcode_model_1.default.create({
        code: otp,
    });
    if (!verificationCode) {
        return next(new ErrorHandler_1.default("Something went wrong!", 400));
    }
    const mailOptions = {
        from: "Elegasilk <elegasilk@gmail.com>",
        to: email,
        subject: "Verification Code",
        text: "Your verification code is " + otp + ". Please use this code to verify your email address.",
    };
    (0, mail_1.sendMail)(mailOptions);
    const verificationId = verificationCode._id;
    res.status(200).json({
        success: true,
        message: "Check Inbox for OTP!",
        email,
        verificationId,
    });
}));
/**
 * Verifies the customer's email using the provided verification code and OTP.
 * @param req - The request object containing the verificationId, otp, and email.
 * @param res - The response object used to send the verification result.
 * @param next - The next function to call in the middleware chain.
 */
exports.verifyCustomerEmail = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _f;
    checkRequestPermission(req.params.id, req, res, next);
    const { verificationId, otp, email } = req.body;
    if (!verificationId || !otp) {
        return next(new ErrorHandler_1.default("Invalid verification code", 400));
    }
    const verificationCode = yield verificationcode_model_1.default.findById(verificationId);
    if (!verificationCode)
        return next(new ErrorHandler_1.default("Invalid Code", 400));
    const isMatching = verificationCode.verifyCode(otp);
    if (!isMatching)
        return next(new ErrorHandler_1.default("Invalid Code", 400));
    const customer = yield Customer_model_1.default.findByIdAndUpdate((_f = req.customer) === null || _f === void 0 ? void 0 : _f._id, {
        email,
    }, { new: true });
    if (!customer) {
        return next(new ErrorHandler_1.default("Failed to Update Email Address", 404));
    }
    verificationCode.deleteOne();
    const user = customer.getCustomerProfile();
    res.status(200).json({
        success: true,
        message: "Email verified successfully",
        user,
    });
}));
/**
 * Handles the forget password functionality.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A JSON response indicating the success and a message to check the inbox for password reset.
 */
exports.forgetPassword = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!validator_1.default.isEmail(email)) {
        return next(new ErrorHandler_1.default("Invalid email", 400));
    }
    const customer = yield Customer_model_1.default.findOne({ email });
    if (!customer) {
        return next(new ErrorHandler_1.default("Account not found", 400));
    }
    const token = crypto_1.default.randomBytes(16).toString("hex");
    const verificationCode = yield verificationcode_model_1.default.create({
        code: token,
    });
    if (!verificationCode) {
        return next(new ErrorHandler_1.default("Something went wrong!", 400));
    }
    const Host = process.env.STOREFRONT || "http://localhost:3000";
    const resetLink = `${Host}/reset-password/reset?customerId=${customer._id}&id=${verificationCode._id}&token=${verificationCode.code}`;
    const mailOptions = {
        from: "Elegasilk <elegasilk@gmail.com>",
        to: email,
        subject: "Reset Your Password",
        text: `Click the link below to reset your password. ${resetLink} If you did not request a password reset, you can ignore this email and your password will remain unchanged. Best, Elegasilk`,
    };
    (0, mail_1.sendMail)(mailOptions);
    res.status(200).json({
        success: true,
        message: "Check your inbox to reset your password",
    });
}));
/**
 * Reset the password for a customer.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A JSON response indicating the success of the password reset.
 */
exports.resetPassword = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { customerId, id, token, password } = req.body;
    if (!customerId || !id || !token || !password) {
        return next(new ErrorHandler_1.default("Invalid request", 400));
    }
    const verificationCode = yield verificationcode_model_1.default.findById(id);
    if (!verificationCode)
        return next(new ErrorHandler_1.default("Invalid Code", 400));
    const isMatching = verificationCode.verifyCode(token);
    if (!isMatching)
        return next(new ErrorHandler_1.default("Invalid Code", 400));
    const customer = yield Customer_model_1.default.findById(customerId);
    if (!customer) {
        return next(new ErrorHandler_1.default("Account not found", 400));
    }
    customer.hashed_password = password;
    const saveCustomer = yield customer.save();
    if (!saveCustomer) {
        return next(new ErrorHandler_1.default("Password reset failed", 400));
    }
    verificationCode.deleteOne();
    res.status(200).json({
        success: true,
        message: "Password reset successfully",
    });
}));
