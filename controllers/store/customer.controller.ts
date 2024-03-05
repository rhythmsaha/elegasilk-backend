import asyncHandler from "express-async-handler";
import Customer, { ICustomer } from "../../models/store/Customer.model";
import ErrorHandler from "../../utils/ErrorHandler";
import { Request, Response, NextFunction } from "express";
import { default as validator } from "validator";
import VerificationToken, { IVerificationToken } from "../../models/store/VerificationToken.model";
import CustomerSession from "../../utils/customer/CustomerSession";

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
    const { firstName, lastName, email, password, phone } = req.body as ICustomer & { password: string };

    try {
        // Check if admin already exists
        const customerExists = await Customer.findOne({ email });

        if (customerExists && customerExists.verified) return next(new ErrorHandler("Customer already exists", 400));

        if (customerExists && !customerExists.verified) return resendVerificationLink(req, res, next);

        // Create new customer
        const newCustomer = await Customer.create({ firstName, lastName, email, hashed_password: password, phone });

        if (!newCustomer) return next(new ErrorHandler("Customer registration failed", 400));

        // Generate verification token
        const token = new VerificationToken().createVerificationToken(newCustomer._id);
        const verificationToken = await VerificationToken.create({ userId: newCustomer._id, expireAt: new Date(Date.now() + 3600000), token: token });

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
    const _verificationToken = new VerificationToken({ userId: customer._id, expireAt: new Date(Date.now() + 3600000), token: token });

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

export const updateCustomerProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {});

export const updateCustomerPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {});

export const deleteCustomerAccount = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {});

export const getCustomerProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {});

// Private APIS - For Admins Only
export const createCustomerByAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { firstName, lastName, email, password, phone } = req.body as ICustomer & { password: string };

    // Check if admin already exists
    const customerExists = await Customer.exists({ email });

    if (customerExists && customerExists._id) {
        return next(new ErrorHandler("Customer already exists", 400));
    }

    // Create new customer
    const newCustomer = await Customer.create({ firstName, lastName, email, hashed_password: password, phone, verified: true });

    if (!newCustomer) {
        return next(new ErrorHandler("Customer registration failed", 400));
    }

    res.status(201).json({
        success: true,
        message: "Customer created successfully",
    });
});

export const updateCustomerProfileByAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {});

export const deleteCustomerAccountByAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {});

export const getCustomerProfileByAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {});

export const getCustomersListByAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {});
