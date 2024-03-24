import { NextFunction } from "express";
import Customer, { ICustomer } from "../../models/store/Customer.model";
import ErrorHandler from "../../utils/ErrorHandler";
import expressAsyncHandler from "express-async-handler";
import { ISortOrder } from "../../types/typings";
import mongoose, { FilterQuery, PipelineStage } from "mongoose";
import { ICollection } from "../../models/collection.model";

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

export const getCustomersListByAdmin = expressAsyncHandler(async (req, res, next) => {
    // pageSize=5&page=1&status=true&search=something

    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 5;
    const status = req.query.status as "true" | "false" | undefined;
    const search = req.query.search as string | undefined;

    const sortBy =
        (req.query.sortby as "firstName" | "email" | "verified" | "createdAt" | "status" | undefined) || "name"; //Get  sort by propery

    const sortOrder: ISortOrder = (req.query.sortorder as ISortOrder) || "asc"; // Get sort order Query

    let startFrom = 0; // Calculate skip value
    let endAt = 5; // Calculate limit value

    // Define query objects
    let filters = {} as FilterQuery<ICollection>;
    let pipeline: PipelineStage[] = [];

    let sortCondition: Record<string, 1 | -1 | mongoose.Expression.Meta> = {};

    if (sortBy) sortCondition[sortBy] = sortOrder === "asc" ? 1 : -1;

    // if search query exists update filters object
    if (search) {
        filters["firstName"] = { $regex: new RegExp(search, "i") };
    }

    // if status query exists - update filters object
    if (status) {
        if (status === "true") filters["status"] = true;
        else if (status === "false") filters["status"] = false;
        else return next(new ErrorHandler("Invalid status value", 400));
    }

    // if page query exists - update skip value
    if (page) startFrom = (Number(page) - 1) * Number(pageSize);
    if (pageSize) endAt = Number(pageSize);

    if (filters) {
        pipeline.push({ $match: filters });
    }

    pipeline.push({
        $facet: {
            customers: [{ $sort: sortCondition }, { $skip: startFrom }, { $limit: endAt }],
            totalCount: [{ $count: "total" }],
        },
    });

    const customers = await Customer.aggregate(pipeline);

    if (!customers) return next(new ErrorHandler("No customers found", 404));

    const total = customers[0].totalCount.length > 0 ? customers[0].totalCount[0].total : 0;
    const totalPages = Math.ceil(total / pageSize);
    const maxPage = Math.ceil(total / Number(pageSize));
    const _customers = customers[0].customers;
    let currentPage = Number(page);

    if (maxPage < currentPage) currentPage = 1;

    res.status(200).json({
        success: true,
        data: {
            customers: _customers,
            total,
            totalPages,
            currentPage,
        },
    } as any);
});

export const toggleCustomerStatus = expressAsyncHandler(async (req, res, next) => {});
