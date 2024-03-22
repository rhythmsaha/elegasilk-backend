import expressAsyncHandler from "express-async-handler";
import ErrorHandler from "../../utils/ErrorHandler";
import mongoose, { FilterQuery, PipelineStage } from "mongoose";
import { IAddress } from "../../models/store/Address.model";
import { IPopulatedCartItem } from "../../models/store/Cart.model";
import Order from "../../models/store/Order.model";

type OrderStatusType = undefined | "PLACED" | "CANCELLED" | "DELIVERED" | "REFUNDED";
type sortByOrderType = "date" | "status" | "price";
type SortOrderType = "asc" | "desc";

interface IOrder {
    userId: string;
    sessionId: string;
    orderId: string;
    address: IAddress;
    items: IPopulatedCartItem[];
    total: number;
    paymentMethod: "CASH_ON_DELIVERY" | "STRIPE";
    status:
        | "PENDING"
        | "PLACED"
        | "FAILED"
        | "CANCELLED"
        | "SHIPPED"
        | "DELIVERED"
        | "RETURN_REQUESTED"
        | "RETURNED"
        | "REFUNDED"
        | "EXCHANGE_REQUESTED"
        | "EXCHANGED";
}

export const getOrders = expressAsyncHandler(async (req, res, next) => {
    const status: OrderStatusType = req.query.status as OrderStatusType;
    const sortOrder: SortOrderType = (req.query.sortOrder as SortOrderType) || "desc";
    const sortBy: sortByOrderType = (req.query.sortBy as sortByOrderType) || "date";
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 5;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const search = req.query.search as string;

    if (
        status !== "PLACED" &&
        status !== "CANCELLED" &&
        status !== "DELIVERED" &&
        status !== "REFUNDED" &&
        status !== undefined
    ) {
        return next(new ErrorHandler("Invalid Status", 400));
    }

    if (!["date", "status", "price"].includes(sortBy)) {
        return next(new ErrorHandler("Invalid Sort By", 400));
    }

    if (sortOrder !== "asc" && sortOrder !== "desc") {
        return next(new ErrorHandler("Invalid Sort Order", 400));
    }

    if (isNaN(page) || isNaN(pageSize)) {
        return next(new ErrorHandler("Invalid Page Number or Page Size", 400));
    }

    if (startDate && !Date.parse(startDate)) {
        return next(new ErrorHandler("Invalid Start Date", 400));
    }

    if (endDate && !Date.parse(endDate)) {
        return next(new ErrorHandler("Invalid End Date", 400));
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        return next(new ErrorHandler("Invalid Date Range", 400));
    }

    let filters = {} as FilterQuery<IOrder>;
    let pipeline: PipelineStage[] = [];

    let sortCondition: Record<string, 1 | -1 | mongoose.Expression.Meta> = {};

    if (status) filters.status = status;

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

    if (page) startFrom = (page - 1) * pageSize;
    if (pageSize) endAt = pageSize;

    pipeline.push({
        $facet: {
            orders: [
                { $sort: sortCondition },
                { $skip: startFrom },
                { $limit: endAt },

                {
                    $lookup: {
                        from: "customers", // name of the customers collection
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

    const orders = await Order.aggregate(pipeline);

    if (!orders) return next(new ErrorHandler("No Orders Found", 404));

    // Format Response
    const totalCount = orders[0].totalCount[0]?.count || 0;
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
});

export const getSingleOrder = expressAsyncHandler(async (req, res, next) => {
    const orderId = req.params.id;
    if (!orderId) return next(new ErrorHandler(`Order Id is required`, 400));

    try {
        const order = await Order.findById(orderId).populate({
            path: "userId",
            select: "firstName lastName email mobile",
        });

        if (!order) return next(new ErrorHandler(`Order not found`, 404));

        const _order = structureSingleOrder(order);

        res.status(200).json({
            success: true,
            order: _order,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

export const updateStatus = expressAsyncHandler(async (req, res, next) => {
    const orderId = req.params.id;
    const _status = req.body.status as IOrder["status"];

    if (!orderId) return next(new ErrorHandler(`Order Id is required`, 400));
    if (!_status) return next(new ErrorHandler(`Status is required`, 400));

    if (
        ![
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
        ].includes(_status)
    ) {
        return next(new ErrorHandler(`Invalid Status`, 400));
    }

    try {
        const order = await Order.findByIdAndUpdate(orderId, { status: _status }, { new: true });
        // if (!order) return next(new ErrorHandler(`Order not found`, 404));

        console.log(order);

        const _order = structureSingleOrder(order);

        res.status(200).json({
            success: true,
            order: _order,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

function structureOrders(orders: any) {
    return orders.map((order: any) => {
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

            totalQuantity: order.items.reduce((acc: number, item: any) => acc + item.quantity, 0),
        };
    });
}

function structureSingleOrder(order: any) {
    return {
        _id: order._id,
        orderId: order.orderId,
        sessionId: order.sessionId,
        customer: {
            _id: (order.userId as any)._id,
            firstName: (order.userId as any).firstName,
            lastName: (order.userId as any).lastName,
            email: (order.userId as any).email,
            mobile: (order.userId as any).mobile,
        },

        address: order.address,
        items: order.items.map((item: any) => {
            return {
                _id: item.productId._id,
                name: item.productId.name,
                images: item.productId.images[0] || "",
                MRP: item.productId.MRP,
                slug: item.productId.slug,
                quantity: item.quantity,
            };
        }),
        totalQuantity: order.items.reduce((acc: number, item: any) => acc + item.quantity, 0),

        total: order.total,
        paymentMethod: order.paymentMethod,
        status: order.status,
        createdAt: order.get("createdAt"),
        updatedAt: order.get("updatedAt"),
    };
}

// | "PENDING"
//         | "PLACED"
//         | "FAILED"
//         | "CANCELLED"
//         | "SHIPPED"
//         | "DELIVERED"
//         | "RETURN_REQUESTED"
//         | "RETURNED"
//         | "REFUNDED"
//         | "EXCHANGE_REQUESTED"
//         | "EXCHANGED";
