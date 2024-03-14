import asyncHandler from "express-async-handler";
import Customer, { ICustomer } from "../../models/store/Customer.model";
import ErrorHandler from "../../utils/ErrorHandler";
import { Request, Response, NextFunction } from "express";
import { default as validator } from "validator";
import VerificationToken, { IVerificationToken } from "../../models/store/VerificationToken.model";
import CustomerSession from "../../utils/customer/CustomerSession";
import generateOTP from "../../utils/generateOtp";
import VerificationCode from "../../models/verificationcode.model";
import crypto from "crypto";

const checkRequestPermission = (id: string, req: Request, res: Response, next: NextFunction) => {
    if (id !== req.customer?._id) {
        return next(new ErrorHandler("Unauthorized", 403));
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
export const createCustomer = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { firstName, lastName, email, password } = req.body as ICustomer & {
        password: string;
    };

    try {
        // Check if admin already exists
        const customerExists = await Customer.findOne({ email });

        if (customerExists && customerExists.verified) return next(new ErrorHandler("Customer already exists", 400));

        if (customerExists && !customerExists.verified) return resendVerificationLink(req, res, next);

        // Create new customer
        const newCustomer = await Customer.create({
            firstName,
            lastName,
            email,
            hashed_password: password,
        });

        if (!newCustomer) return next(new ErrorHandler("Customer registration failed", 400));

        // Generate verification token
        const token = new VerificationToken().createVerificationToken(newCustomer._id);
        const verificationToken = await VerificationToken.create({
            userId: newCustomer._id,
            expireAt: new Date(Date.now() + 3600000),
            token: token,
        });

        if (!verificationToken) {
            return next(new ErrorHandler("Customer registration failed", 400));
        }

        // Send verification email
        const verificationLink = `http://localhost:3000/verifyaccount?token=${verificationToken.token}&customerId=${newCustomer._id}&tokenID=${verificationToken._id}`;

        console.log(verificationLink);

        res.status(201).json({
            success: true,
            message: "Please Check Your Email to Verify Your Account!",
        });
    } catch (error: any) {
        return next(new ErrorHandler("Customer registration failed", error.statusCode || 500));
    }
});

/**
 * Resends the verification link to the customer's email.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function.
 * @returns A JSON response indicating the success status, verification link, and message.
 */
export const resendVerificationLink = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body as ICustomer;

    if (!validator.isEmail(email)) {
        return next(new ErrorHandler("Invalid email", 400));
    }

    const customer = await Customer.findOne({ email });

    if (!customer) {
        return next(new ErrorHandler("Account not found", 400));
    }

    if (customer.verified) {
        return next(new ErrorHandler("Account already verified", 400));
    }

    await VerificationToken.findOneAndDelete({ userId: customer._id });

    const token = new VerificationToken().createVerificationToken(customer._id);
    const _verificationToken = new VerificationToken({
        userId: customer._id,
        expireAt: new Date(Date.now() + 3600000),
        token: token,
    });

    const saveToken = await _verificationToken.save();

    if (!saveToken) {
        return next(new ErrorHandler("Failed to resend verification link", 400));
    }

    // Send verification email
    const verificationLink = `http://localhost:3000/verifyaccount?token=${token}&customerId=${customer._id}&tokenID=${saveToken._id}`;

    console.log(verificationLink);

    res.status(201).json({
        success: true,
        link: verificationLink,
        message: "Verification link sent successfully",
    });
});

/**
 * Verifies a customer account using a token and userId.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function.
 * @returns A JSON response indicating the success or failure of the account verification.
 */
export const verifyCustomerAccount = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { token, userId, tokenId } = req.query as {
        token: string;
        userId: string;
        tokenId: string;
    };

    if (!userId || !token || !tokenId) {
        return next(new ErrorHandler("Invalid token", 400));
    }

    try {
        const verificationToken = await VerificationToken.findById(tokenId);

        if (!verificationToken) {
            return next(new ErrorHandler("Invalid token", 400));
        }

        if (verificationToken.userId.toString() !== userId) {
            return next(new ErrorHandler("Invalid token", 400));
        }

        if (!verificationToken.verifyToken(token)) {
            return next(new ErrorHandler("Invalid token", 400));
        }

        const customer = await Customer.findById(userId);

        if (!customer) {
            return next(new ErrorHandler("Account not found", 400));
        }

        customer.verified = true;

        const saveCustomer = await customer.save();

        if (!saveCustomer) {
            return next(new ErrorHandler("Account verification failed", 400));
        }

        await verificationToken.deleteOne();

        res.status(200).json({
            success: true,
            message: "Account verified successfully",
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

/**
 * Logs in a customer.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function.
 * @returns The login session of the customer.
 */
export const loginCustomer = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body as ICustomer & { password: string };

    if (!email || !password) {
        return next(new ErrorHandler("Please provide email and password", 400));
    }

    const customer = await Customer.findOne({ email }).select("+hashed_password");

    if (!customer) {
        return next(new ErrorHandler("Account doesn't exist!", 404));
    }

    const comparePassword = await customer.comparePassword(password);

    if (!comparePassword) {
        return next(new ErrorHandler("Invalid email or password!", 400));
    }

    if (!customer.verified) {
        return next(new ErrorHandler("Please verify your account!", 400));
    }

    if (!customer.status) {
        return next(new ErrorHandler("Account is disabled!", 400));
    }

    const session = CustomerSession.from(customer).loginSession;
    res.status(200).json(session);
});

/**
 * Refreshes the customer session.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function.
 * @returns The refreshed customer session.
 */
export const refreshCustomerSession = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Get customer id from request
    const customerId = req.customer?._id;

    if (!customerId) {
        return next(new ErrorHandler("Please login to access this resource", 401));
    }
    // Find customer by id
    const customer = await Customer.findById(customerId);

    if (!customer) {
        return next(new ErrorHandler("Customer not found", 404));
    }

    // Generate new session
    const session = CustomerSession.from(customer).refreshTokenSession;
    res.status(200).json(session);
});

/**
 * Updates the profile of a customer.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A JSON response indicating the success of the profile update.
 * @throws {ErrorHandler} If the required fields are not provided or if the customer is not found.
 */
export const updateCustomerProfile = asyncHandler(async (req, res, next) => {
    checkRequestPermission(req.params.id, req, res, next);

    const { firstName, lastName } = req.body as ICustomer;

    if (!firstName || !lastName) {
        return next(new ErrorHandler("Please provide all fields", 400));
    }

    const customer = await Customer.findByIdAndUpdate(
        req.customer?._id,
        {
            firstName,
            lastName,
        },
        { new: true }
    );

    if (!customer) {
        return next(new ErrorHandler("Customer not found", 404));
    }

    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
    });
});

/**
 * Updates the password of a customer.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A JSON response indicating the success of the password update.
 * @throws {ErrorHandler} If the required fields are not provided, customer is not found, or the current password is invalid.
 */
export const updateCustomerPassword = asyncHandler(async (req, res, next) => {
    checkRequestPermission(req.params.id, req, res, next);
    const { currentPassword, newPassword } = req.body as {
        currentPassword: string;
        newPassword: string;
    };

    if (!currentPassword || !newPassword) {
        return next(new ErrorHandler("Please provide all fields", 400));
    }

    const customer = await Customer.findById(req.customer?._id).select("+hashed_password");

    if (!customer) {
        return next(new ErrorHandler("Customer not found", 404));
    }

    const comparePassword = await customer.comparePassword(currentPassword);

    if (!comparePassword) {
        return next(new ErrorHandler("Invalid password", 400));
    }

    customer.hashed_password = newPassword;
    await customer.save();

    res.status(200).json({
        success: true,
        message: "Password updated successfully",
    });
});

/**
 * Deletes a customer account.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next function.
 * @returns {Promise<void>} - A promise that resolves when the account is deleted.
 */
export const deleteCustomerAccount = asyncHandler(async (req, res, next) => {
    checkRequestPermission(req.params.id, req, res, next);
    const customer = await Customer.findById(req.customer?._id);

    if (!customer) {
        return next(new ErrorHandler("Customer not found", 404));
    }

    await customer.deleteOne();

    res.status(200).json({
        success: true,
        message: "Account deleted successfully",
    });
});

/**
 * Retrieves the profile of a customer.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next function.
 * @returns {Promise<void>} - A promise that resolves with the customer profile.
 * @throws {ErrorHandler} - If the customer is not found.
 */
export const getCustomerProfile = asyncHandler(async (req, res, next) => {
    checkRequestPermission(req.params.id, req, res, next);
    const customer = await Customer.findById(req.customer?._id);

    if (!customer) {
        return next(new ErrorHandler("Customer not found", 404));
    }

    const customerProfile = customer.getCustomerProfile();

    res.status(200).json({
        success: true,
        user: customerProfile,
    });
});

/**
 * Updates the email of a customer.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A JSON response indicating the success of the operation, the updated email, and the verification ID.
 */
export const updateCustomerEmail = asyncHandler(async (req, res, next) => {
    checkRequestPermission(req.params.id, req, res, next);
    const { email } = req.body as ICustomer;

    if (!validator.isEmail(email)) {
        return next(new ErrorHandler("Invalid email", 400));
    }

    const emailExists = await Customer.findOne({ email });

    if (emailExists) {
        return next(new ErrorHandler("Email already exists", 400));
    }

    const otp = generateOTP(4);
    const verificationCode = await VerificationCode.create({
        code: otp,
    });

    if (!verificationCode) {
        return next(new ErrorHandler("Something went wrong!", 400));
    }

    const verificationId = verificationCode._id;

    res.status(200).json({
        success: true,
        message: "Check Inbox for OTP!",
        email,
        verificationId,
    });
});

/**
 * Verifies the customer's email using the provided verification code and OTP.
 * @param req - The request object containing the verificationId, otp, and email.
 * @param res - The response object used to send the verification result.
 * @param next - The next function to call in the middleware chain.
 */
export const verifyCustomerEmail = asyncHandler(async (req, res, next) => {
    checkRequestPermission(req.params.id, req, res, next);
    const { verificationId, otp, email } = req.body as {
        verificationId: string;
        otp: string;
        email: string;
    };

    if (!verificationId || !otp) {
        return next(new ErrorHandler("Invalid verification code", 400));
    }

    const verificationCode = await VerificationCode.findById(verificationId);

    if (!verificationCode) return next(new ErrorHandler("Invalid Code", 400));

    const isMatching = verificationCode.verifyCode(otp);

    if (!isMatching) return next(new ErrorHandler("Invalid Code", 400));

    const customer = await Customer.findByIdAndUpdate(
        req.customer?._id,
        {
            email,
        },
        { new: true }
    );

    if (!customer) {
        return next(new ErrorHandler("Failed to Update Email Address", 404));
    }

    res.status(200).json({
        success: true,
        message: "Email verified successfully",
    });
});

export const forgetPassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body as ICustomer;

    if (!validator.isEmail(email)) {
        return next(new ErrorHandler("Invalid email", 400));
    }

    const customer = await Customer.findOne({ email });

    if (!customer) {
        return next(new ErrorHandler("Account not found", 400));
    }

    const token = crypto.randomBytes(16).toString("hex");

    const verificationCode = await VerificationCode.create({
        code: token,
    });

    if (!verificationCode) {
        return next(new ErrorHandler("Something went wrong!", 400));
    }

    const resetLink = `http://localhost:3000/resetpassword?customerId=${customer._id}&id=${verificationCode._id}&token=${verificationCode.code}`;

    console.log(resetLink);

    res.status(200).json({
        success: true,
        message: "Check your inbox to reset your password",
    });
});

export const resetPassword = asyncHandler(async (req, res, next) => {});
