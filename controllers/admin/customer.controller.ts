import { NextFunction } from "express";
import Customer, { ICustomer } from "../../models/store/Customer.model";
import ErrorHandler from "../../utils/ErrorHandler";
import expressAsyncHandler from "express-async-handler";

// Private APIS - For Admins Only
export const createCustomerByAdmin = expressAsyncHandler(async (req, res, next) => {
    const { firstName, lastName, email, password, phone } = req.body as ICustomer & {
        password: string;
    };

    // Check if admin already exists
    const customerExists = await Customer.exists({ email });

    if (customerExists && customerExists._id) {
        return next(new ErrorHandler("Customer already exists", 400));
    }

    // Create new customer
    const newCustomer = await Customer.create({
        firstName,
        lastName,
        email,
        hashed_password: password,
        phone,
        verified: true,
    });

    if (!newCustomer) {
        return next(new ErrorHandler("Customer registration failed", 400));
    }

    res.status(201).json({
        success: true,
        message: "Customer created successfully",
    });
});

export const updateCustomerProfileByAdmin = expressAsyncHandler(async (req, res, next) => {});

export const deleteCustomerAccountByAdmin = expressAsyncHandler(async (req, res, next) => {});

export const getCustomerProfileByAdmin = expressAsyncHandler(async (req, res, next) => {});

export const getCustomersListByAdmin = expressAsyncHandler(async (req, res, next) => {});
