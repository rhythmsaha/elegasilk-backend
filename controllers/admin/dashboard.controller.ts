import { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import Order from "../../models/store/Order.model";

export const salesReport = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [todaySales, yesterdaySales, monthSales, totalSales] = await Promise.all([
        Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: today,
                    },
                    status: {
                        $nin: ["CANCELLED", "REFUNDED", "RETURNED"],
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    sales: { $sum: "$total" },
                    items: { $push: "$items" },
                },
            },
            {
                $unwind: "$items",
            },
            {
                $unwind: "$items",
            },
            {
                $group: {
                    _id: null,
                    sales: { $first: "$sales" },
                    quantity: { $sum: "$items.quantity" },
                },
            },
        ]),
        Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: yesterday,
                        $lt: today,
                    },
                    status: {
                        $nin: ["CANCELLED", "REFUNDED"],
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    sales: { $sum: "$total" },
                    items: { $push: "$items" },
                },
            },
            {
                $unwind: "$items",
            },
            {
                $unwind: "$items",
            },
            {
                $group: {
                    _id: null,
                    sales: { $first: "$sales" },
                    quantity: { $sum: "$items.quantity" },
                },
            },
        ]),
        Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: firstDayOfMonth,
                    },
                    status: {
                        $nin: ["CANCELLED", "REFUNDED"],
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    sales: { $sum: "$total" },
                    items: { $push: "$items" },
                },
            },
            {
                $unwind: "$items",
            },
            {
                $unwind: "$items",
            },
            {
                $group: {
                    _id: null,
                    sales: { $first: "$sales" },
                    quantity: { $sum: "$items.quantity" },
                },
            },
        ]),
        Order.aggregate([
            {
                $match: {
                    status: {
                        $nin: ["CANCELLED", "REFUNDED"],
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    sales: { $sum: "$total" },
                    items: { $push: "$items" },
                },
            },
            {
                $unwind: "$items",
            },
            {
                $unwind: "$items",
            },
            {
                $group: {
                    _id: null,
                    sales: { $first: "$sales" },
                    quantity: { $sum: "$items.quantity" },
                },
            },
        ]),
    ]);

    const [placedOrdersCount, shippedOrdersCount, deliveredOrdersCount, totalOrdersCount] = await Promise.all([
        Order.countDocuments({ status: "PLACED" }),
        Order.countDocuments({ status: "SHIPPED" }),
        Order.countDocuments({ status: "DELIVERED" }),
        Order.countDocuments({}),
    ]);

    res.status(200).json({
        success: true,
        report: {
            salesData: {
                today: {
                    sales: todaySales[0]?.sales || 0,
                    quantity: todaySales[0]?.quantity || 0,
                },
                yesterday: {
                    sales: yesterdaySales[0]?.sales || 0,
                    quantity: yesterdaySales[0]?.quantity || 0,
                },
                thisMonth: {
                    sales: monthSales[0]?.sales || 0,
                    quantity: monthSales[0]?.quantity || 0,
                },
                total: {
                    sales: totalSales[0]?.sales || 0,
                    quantity: totalSales[0]?.quantity || 0,
                },
            },

            ordersData: {
                placed: placedOrdersCount,
                shipped: shippedOrdersCount,
                delivered: deliveredOrdersCount,
                total: totalOrdersCount,
            },
        },
    });
});

export const graphReport = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const today = new Date();
    const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [thisMonthSales, thisMonthReturns] = await Promise.all([
        Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: firstDayOfMonth,
                    },
                    status: {
                        $nin: ["CANCELLED", "REFUNDED", "RETURNED"],
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    sales: { $sum: "$total" },
                    items: { $push: "$items" },
                },
            },
            {
                $unwind: "$items",
            },
            {
                $unwind: "$items",
            },
            {
                $group: {
                    _id: null,
                    sales: { $first: "$sales" },
                    quantity: { $sum: "$items.quantity" },
                },
            },
        ]),
        Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: firstDayOfMonth,
                    },
                    status: {
                        $in: ["REFUNDED", "RETURNED"],
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    returns: { $sum: "$returns" }, // Replace "returns" with the field that represents the total returns in your Order model
                    items: { $push: "$items" },
                },
            },
            {
                $unwind: "$items",
            },
            {
                $unwind: "$items",
            },
            {
                $group: {
                    _id: null,
                    returns: { $first: "$returns" },
                    quantity: { $sum: "$items.quantity" },
                },
            },
        ]),
    ]);

    // Fetch all orders between today and last week
    const orders = await Order.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: lastWeek,
                    $lt: today,
                },
                status: {
                    $nin: ["CANCELLED", "REFUNDED", "RETURNED"],
                },
            },
        },

        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                sales: { $sum: "$total" }, // Replace "total" with the field that represents the order total
            },
        },
    ]);

    // Create an array of the last 7 days
    const days = Array.from({ length: 7 }, (v, i) => {
        const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
        return d.toISOString().split("T")[0];
    }).reverse();

    const salesReport = days.map((day) => {
        const order = orders.find((o) => o._id === day);
        return {
            date: day,
            sales: order ? order.sales : 0,
        };
    });

    res.status(200).json({
        success: true,
        data: {
            area: salesReport,
            radial: {
                sales: thisMonthSales[0]?.sales || 0,
                salesQuantity: thisMonthSales[0]?.quantity || 0,
                returns: thisMonthReturns[0]?.returns || 0,
                returnsQuantity: thisMonthReturns[0]?.quantity || 0,
            },
        },
    });
});
