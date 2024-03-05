import asyncHandler from "express-async-handler";
import Customer, { ICustomer } from "../../models/store/Customer.model";
import ErrorHandler from "../../utils/ErrorHandler";
import { Request, Response, NextFunction } from "express";
import { default as validator } from "validator";
import VerificationToken, { IVerificationToken } from "../../models/store/VerificationToken.model";
import CustomerSession from "../../utils/customer/CustomerSession";

export const createCustomer = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { firstName, lastName, email, password, phone } = req.body as ICustomer & { password: string };

    try {
        let user: ICustomer | undefined = undefined;
        // Check if admin already exists
        const customerExists = await Customer.findOne({ email });

        if (customerExists && customerExists.verified) return next(new ErrorHandler("Customer already exists", 400));

        if (customerExists && !customerExists.verified) {
            await VerificationToken.findOneAndDelete({ userId: customerExists._id });
            user = customerExists;
        } else if (!customerExists) {
            // Create new customer
            const newCustomer = await Customer.create({ firstName, lastName, email, hashed_password: password, phone });

            if (!newCustomer) {
                return next(new ErrorHandler("Customer registration failed", 400));
            }

            user = newCustomer;
        }

        if (!user) {
            return next(new ErrorHandler("Customer registration failed", 400));
        }

        // Generate verification token
        const token = new VerificationToken().createVerificationToken(user._id);
        const verificationToken = await VerificationToken.create({ userId: user._id, expireAt: new Date(Date.now() + 3600000), token: token });

        if (!verificationToken) {
            return next(new ErrorHandler("Customer registration failed", 400));
        }

        // Send verification email
        const verificationLink = `http://localhost:3000/verifyaccount?token=${verificationToken.token}&customerId=${user._id}&tokenID=${verificationToken._id}`;

        console.log(verificationLink);

        res.status(201).json({
            success: true,
            message: "Please Check Your Email to Verify Your Account!",
        });
    } catch (error: any) {
        return next(new ErrorHandler("Customer registration failed", error.statusCode || 500));
    }
});

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
    const verificationLink = `http://localhost:3000/verifyaccount?token=${saveToken.token}&customerId=${customer._id}&tokenID=${saveToken._id}`;

    console.log(verificationLink);

    res.status(200).json({
        success: true,
        message: "Verification link sent successfully",
    });
});

export const verifyCustomerAccount = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { token, userId, tokenId } = req.query as {
        token: string;
        userId: string;
        tokenId: string;
    };

    if (!userId || !token || !tokenId) {
        return next(new ErrorHandler("Invalid token", 400));
    }

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
});

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

export const loginCustomer = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body as ICustomer & { password: string };

    if (!email || !password) {
        return next(new ErrorHandler("Please provide email and password", 400));
    }

    const customer = await Customer.findOne({ email }).select("+hashed_password");

    if (!customer) {
        return next(new ErrorHandler("Account doesn't exist!", 404));
    }

    if (!customer.comparePassword(password)) {
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

export const getCustomerSession = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {});

export const updateCustomerProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {});

export const updateCustomerProfileByAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {});

export const updateCustomerPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {});

export const deleteCustomerAccount = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {});

export const deleteCustomerAccountByAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {});

export const getCustomerProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {});

export const getCustomerProfileByAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {});

export const getCustomersListByAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {});
