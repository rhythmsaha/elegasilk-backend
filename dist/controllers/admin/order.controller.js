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
exports.updateStatus = exports.getSingleOrder = exports.getOrders = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const ErrorHandler_1 = __importDefault(require("../../utils/ErrorHandler"));
const Order_model_1 = __importDefault(require("../../models/store/Order.model"));
exports.getOrders = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const status = req.query.status;
    const sortOrder = req.query.sortOrder || "desc";
    const sortBy = req.query.sortBy || "date";
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 5;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const search = req.query.search;
    if (status !== "PLACED" &&
        status !== "CANCELLED" &&
        status !== "DELIVERED" &&
        status !== "REFUNDED" &&
        status !== undefined) {
        return next(new ErrorHandler_1.default("Invalid Status", 400));
    }
    if (!["date", "status", "price"].includes(sortBy)) {
        return next(new ErrorHandler_1.default("Invalid Sort By", 400));
    }
    if (sortOrder !== "asc" && sortOrder !== "desc") {
        return next(new ErrorHandler_1.default("Invalid Sort Order", 400));
    }
    if (isNaN(page) || isNaN(pageSize)) {
        return next(new ErrorHandler_1.default("Invalid Page Number or Page Size", 400));
    }
    if (startDate && !Date.parse(startDate)) {
        return next(new ErrorHandler_1.default("Invalid Start Date", 400));
    }
    if (endDate && !Date.parse(endDate)) {
        return next(new ErrorHandler_1.default("Invalid End Date", 400));
    }
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        return next(new ErrorHandler_1.default("Invalid Date Range", 400));
    }
    let filters = {};
    let pipeline = [];
    let sortCondition = {};
    if (status)
        filters.status = status;
    switch (sortBy) {
        case "date":
            sortCondition["createdAt"] = sortOrder === "asc" ? 1 : -1;
            break;
        case "status":
            sortCondition["status"] = sortOrder === "asc" ? 1 : -1;
            break;
        case "price":
            sortCondition["total"] = sortOrder === "asc" ? 1 : -1;
            break;
        default:
            sortCondition["createdAt"] = sortOrder === "asc" ? 1 : -1;
            break;
    }
    if (search) {
        filters["orderId"] = { $regex: new RegExp(search, "i") };
    }
    if (filters) {
        pipeline.push({ $match: filters });
    }
    let startFrom = 0; // Calculate skip value
    let endAt = 5; // Calculate limit value
    if (page)
        startFrom = (page - 1) * pageSize;
    if (pageSize)
        endAt = pageSize;
    pipeline.push({
        $facet: {
            orders: [
                { $sort: sortCondition },
                { $skip: startFrom },
                { $limit: endAt },
                {
                    $lookup: {
                        from: "customers",
                        localField: "userId",
                        foreignField: "_id",
                        as: "customer",
                    },
                },
                {
                    $unwind: {
                        path: "$customer",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $project: {
                        orderId: 1,
                        userId: 1,
                        customer: {
                            _id: 1,
                            firstName: 1,
                            lastName: 1,
                            email: 1,
                            mobile: 1,
                        },
                        createdAt: 1,
                        items: 1,
                        status: 1,
                        total: 1,
                    },
                },
            ],
            totalCount: [{ $count: "count" }],
        },
    });
    if (startDate && endDate) {
        // Parse the start and end dates
        const sDate = new Date(startDate);
        const eDate = new Date(endDate);
        eDate.setHours(23, 59, 59, 999);
        // Add the date range condition to the pipeline
        pipeline.unshift({
            $match: {
                createdAt: {
                    $gte: sDate,
                    $lte: eDate,
                },
            },
        });
    }
    const orders = yield Order_model_1.default.aggregate(pipeline);
    if (!orders)
        return next(new ErrorHandler_1.default("No Orders Found", 404));
    // Format Response
    const totalCount = ((_a = orders[0].totalCount[0]) === null || _a === void 0 ? void 0 : _a.count) || 0;
    const _Orders = orders[0].orders;
    const maxPage = Math.ceil(totalCount / pageSize);
    let currentPage = page;
    if (currentPage > maxPage) {
        currentPage = maxPage;
    }
    // Send Response
    res.status(200).json({
        orders: structureOrders(_Orders),
        page: currentPage,
        maxPage,
        totalCount,
    });
}));
exports.getSingleOrder = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const orderId = req.params.id;
    if (!orderId)
        return next(new ErrorHandler_1.default(`Order Id is required`, 400));
    try {
        const order = yield Order_model_1.default.findById(orderId).populate({
            path: "userId",
            select: "firstName lastName email mobile",
        });
        if (!order)
            return next(new ErrorHandler_1.default(`Order not found`, 404));
        const _order = structureSingleOrder(order);
        res.status(200).json({
            success: true,
            order: _order,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
}));
exports.updateStatus = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const orderId = req.params.id;
    const _status = req.body.status;
    if (!orderId)
        return next(new ErrorHandler_1.default(`Order Id is required`, 400));
    if (!_status)
        return next(new ErrorHandler_1.default(`Status is required`, 400));
    if (![
        "PENDING",
        "PLACED",
        "FAILED",
        "CANCELLED",
        "SHIPPED",
        "DELIVERED",
        "RETURN_REQUESTED",
        "RETURNED",
        "REFUNDED",
        "EXCHANGE_REQUESTED",
        "EXCHANGED",
    ].includes(_status)) {
        return next(new ErrorHandler_1.default(`Invalid Status`, 400));
    }
    try {
        const order = yield Order_model_1.default.findByIdAndUpdate(orderId, { status: _status }, { new: true });
        // if (!order) return next(new ErrorHandler(`Order not found`, 404));
        console.log(order);
        const _order = structureSingleOrder(order);
        res.status(200).json({
            success: true,
            order: _order,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
}));
function structureOrders(orders) {
    return orders.map((order) => {
        return {
            _id: order._id,
            orderId: order.orderId,
            total: order.total,
            status: order.status,
            paymentMethod: order.paymentMethod,
            customer: order.customer,
            createdAt: new Date(order.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            }),
            orderTime: new Date(order.createdAt).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "numeric",
                hourCycle: "h12",
            }),
            // items: order.items.map((item: any) => {
            //     return {
            //         _id: item.productId._id,
            //         name: item.productId.name,
            //         images: item.productId.images,
            //         MRP: item.productId.MRP,
            //         slug: item.productId.slug,
            //         quantity: item.quantity,
            //     };
            // }),
            totalQuantity: order.items.reduce((acc, item) => acc + item.quantity, 0),
        };
    });
}
function structureSingleOrder(order) {
    return {
        _id: order._id,
        orderId: order.orderId,
        sessionId: order.sessionId,
        customer: {
            _id: order.userId._id,
            firstName: order.userId.firstName,
            lastName: order.userId.lastName,
            email: order.userId.email,
            mobile: order.userId.mobile,
        },
        address: order.address,
        items: order.items.map((item) => {
            return {
                _id: item.productId._id,
                name: item.productId.name,
                images: item.productId.images[0] || "",
                MRP: item.productId.MRP,
                slug: item.productId.slug,
                quantity: item.quantity,
            };
        }),
        totalQuantity: order.items.reduce((acc, item) => acc + item.quantity, 0),
        total: order.total,
        paymentMethod: order.paymentMethod,
        status: order.status,
        createdAt: order.get("createdAt"),
        updatedAt: order.get("updatedAt"),
    };
}
