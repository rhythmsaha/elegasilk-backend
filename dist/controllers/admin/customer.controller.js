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
exports.toggleCustomerStatus = exports.getCustomersListByAdmin = exports.getCustomerProfileByAdmin = exports.deleteCustomerAccountByAdmin = exports.updateCustomerProfileByAdmin = exports.createCustomerByAdmin = void 0;
const Customer_model_1 = __importDefault(require("../../models/store/Customer.model"));
const ErrorHandler_1 = __importDefault(require("../../utils/ErrorHandler"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
// Private APIS - For Admins Only
exports.createCustomerByAdmin = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName, email, password } = req.body;
    // Check if admin already exists
    const customerExists = yield Customer_model_1.default.exists({ email });
    if (customerExists && customerExists._id) {
        return next(new ErrorHandler_1.default("Customer already exists", 400));
    }
    // Create new customer
    const newCustomer = yield Customer_model_1.default.create({
        firstName,
        lastName,
        email,
        hashed_password: password,
        verified: true,
    });
    if (!newCustomer) {
        return next(new ErrorHandler_1.default("Customer registration failed", 400));
    }
    res.status(201).json({
        success: true,
        message: "Customer created successfully",
    });
}));
exports.updateCustomerProfileByAdmin = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { firstName, lastName, email } = req.body;
    const customer = yield Customer_model_1.default.findById(id);
    if (!customer) {
        return next(new ErrorHandler_1.default("Customer not found", 404));
    }
    customer.firstName = firstName;
    customer.lastName = lastName;
    customer.email = email;
    const savedCustomer = yield customer.save();
    if (!savedCustomer) {
        return next(new ErrorHandler_1.default("Customer update failed", 400));
    }
    res.status(200).json({
        success: true,
        message: "Customer updated successfully",
        customer: savedCustomer,
    });
}));
exports.deleteCustomerAccountByAdmin = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () { }));
exports.getCustomerProfileByAdmin = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () { }));
exports.getCustomersListByAdmin = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // pageSize=5&page=1&status=true&search=something
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 5;
    const status = req.query.status;
    const search = req.query.search;
    const sortBy = req.query.sortby || "name"; //Get  sort by propery
    const sortOrder = req.query.sortorder || "asc"; // Get sort order Query
    let startFrom = 0; // Calculate skip value
    let endAt = 5; // Calculate limit value
    // Define query objects
    let filters = {};
    let pipeline = [];
    let sortCondition = {};
    if (sortBy)
        sortCondition[sortBy] = sortOrder === "asc" ? 1 : -1;
    // if search query exists update filters object
    if (search) {
        filters["firstName"] = { $regex: new RegExp(search, "i") };
    }
    // if status query exists - update filters object
    if (status) {
        if (status === "true")
            filters["status"] = true;
        else if (status === "false")
            filters["status"] = false;
        else
            return next(new ErrorHandler_1.default("Invalid status value", 400));
    }
    // if page query exists - update skip value
    if (page)
        startFrom = (Number(page) - 1) * Number(pageSize);
    if (pageSize)
        endAt = Number(pageSize);
    if (filters) {
        pipeline.push({ $match: filters });
    }
    pipeline.push({
        $facet: {
            customers: [{ $sort: sortCondition }, { $skip: startFrom }, { $limit: endAt }],
            totalCount: [{ $count: "total" }],
        },
    });
    const customers = yield Customer_model_1.default.aggregate(pipeline);
    if (!customers)
        return next(new ErrorHandler_1.default("No customers found", 404));
    const total = customers[0].totalCount.length > 0 ? customers[0].totalCount[0].total : 0;
    const totalPages = Math.ceil(total / pageSize);
    const maxPage = Math.ceil(total / Number(pageSize));
    const _customers = customers[0].customers;
    let currentPage = Number(page);
    if (maxPage < currentPage)
        currentPage = 1;
    res.status(200).json({
        success: true,
        data: {
            customers: _customers,
            total,
            totalPages,
            currentPage,
        },
    });
}));
exports.toggleCustomerStatus = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Toggle Customer Status");
    const customerId = req.body.id;
    const status = req.body.status;
    const customer = yield Customer_model_1.default.findById(customerId);
    if (!customer)
        return next(new ErrorHandler_1.default("Customer not found", 404));
    if (status === undefined)
        return next(new ErrorHandler_1.default("Invalid status value", 400));
    if (status === customer.status)
        return next(new ErrorHandler_1.default("Customer status is already set to this value", 400));
    if (typeof status !== "boolean")
        return next(new ErrorHandler_1.default("Invalid status value", 400));
    customer.status = status;
    const updatedCustomer = yield customer.save();
    if (!updatedCustomer)
        return next(new ErrorHandler_1.default("Failed to update customer status", 400));
    res.status(200).json({
        success: true,
        message: "Customer status updated successfully",
        customer: updatedCustomer,
    });
}));
