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
exports.graphReport = exports.salesReport = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Order_model_1 = __importDefault(require("../../models/store/Order.model"));
exports.salesReport = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const [todaySales, yesterdaySales, monthSales, totalSales] = yield Promise.all([
        Order_model_1.default.aggregate([
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
        Order_model_1.default.aggregate([
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
        Order_model_1.default.aggregate([
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
        Order_model_1.default.aggregate([
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
    const [placedOrdersCount, shippedOrdersCount, deliveredOrdersCount, totalOrdersCount] = yield Promise.all([
        Order_model_1.default.countDocuments({ status: "PLACED" }),
        Order_model_1.default.countDocuments({ status: "SHIPPED" }),
        Order_model_1.default.countDocuments({ status: "DELIVERED" }),
        Order_model_1.default.countDocuments({}),
    ]);
    res.status(200).json({
        success: true,
        report: {
            salesData: {
                today: {
                    sales: ((_a = todaySales[0]) === null || _a === void 0 ? void 0 : _a.sales) || 0,
                    quantity: ((_b = todaySales[0]) === null || _b === void 0 ? void 0 : _b.quantity) || 0,
                },
                yesterday: {
                    sales: ((_c = yesterdaySales[0]) === null || _c === void 0 ? void 0 : _c.sales) || 0,
                    quantity: ((_d = yesterdaySales[0]) === null || _d === void 0 ? void 0 : _d.quantity) || 0,
                },
                thisMonth: {
                    sales: ((_e = monthSales[0]) === null || _e === void 0 ? void 0 : _e.sales) || 0,
                    quantity: ((_f = monthSales[0]) === null || _f === void 0 ? void 0 : _f.quantity) || 0,
                },
                total: {
                    sales: ((_g = totalSales[0]) === null || _g === void 0 ? void 0 : _g.sales) || 0,
                    quantity: ((_h = totalSales[0]) === null || _h === void 0 ? void 0 : _h.quantity) || 0,
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
}));
exports.graphReport = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _j, _k, _l, _m;
    const today = new Date();
    const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const [thisMonthSales, thisMonthReturns] = yield Promise.all([
        Order_model_1.default.aggregate([
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
        Order_model_1.default.aggregate([
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
                    returns: { $sum: "$returns" },
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
    const orders = yield Order_model_1.default.aggregate([
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
                sales: ((_j = thisMonthSales[0]) === null || _j === void 0 ? void 0 : _j.sales) || 0,
                salesQuantity: ((_k = thisMonthSales[0]) === null || _k === void 0 ? void 0 : _k.quantity) || 0,
                returns: ((_l = thisMonthReturns[0]) === null || _l === void 0 ? void 0 : _l.returns) || 0,
                returnsQuantity: ((_m = thisMonthReturns[0]) === null || _m === void 0 ? void 0 : _m.quantity) || 0,
            },
        },
    });
}));
