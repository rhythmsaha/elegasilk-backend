import { NextFunction } from "express";
import Customer, { ICustomer } from "../../models/store/Customer.model";
import ErrorHandler from "../../utils/ErrorHandler";
import expressAsyncHandler from "express-async-handler";

// Private APIS - For Admins Only
export const createCustomerByAdmin = expressAsyncHandler(async (req, res, next) => {
    const { firstName, lastName, email, password } = req.body as ICustomer & {
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

export const updateCustomerProfileByAdmin = expressAsyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { firstName, lastName, email } = req.body as ICustomer;

    const customer = await Customer.findById(id);

    if (!customer) {
        return next(new ErrorHandler("Customer not found", 404));
    }

    customer.firstName = firstName;
    customer.lastName = lastName;
    customer.email = email;

    const savedCustomer = await customer.save();

    if (!savedCustomer) {
        return next(new ErrorHandler("Customer update failed", 400));
    }

    res.status(200).json({
        success: true,
        message: "Customer updated successfully",
        customer: savedCustomer,
    });
});

export const deleteCustomerAccountByAdmin = expressAsyncHandler(async (req, res, next) => {});

export const getCustomerProfileByAdmin = expressAsyncHandler(async (req, res, next) => {});

export const getCustomersListByAdmin = expressAsyncHandler(async (req, res, next) => {});
