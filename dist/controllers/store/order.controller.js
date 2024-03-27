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
exports.structureOrders = exports.cancelOrder = exports.getSingleOrder = exports.getOrders = exports.webhook = exports.checkSession = exports.createOrder = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const stripe_1 = __importDefault(require("stripe"));
const dotenv_1 = __importDefault(require("dotenv"));
const Cart_model_1 = __importDefault(require("../../models/store/Cart.model"));
const ErrorHandler_1 = __importDefault(require("../../utils/ErrorHandler"));
const Order_model_1 = __importDefault(require("../../models/store/Order.model"));
const mongoose_1 = __importDefault(require("mongoose"));
dotenv_1.default.config();
const Stripe_APIKEY = process.env.STRIPE_API_KEY || "";
const webhookSecret = process.env.WEBHOOK_SECRET || "";
const Stripe_SECRET = process.env.STRIPE_SECRET_KEY || "";
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["COD"] = "CASH_ON_DELIVERY";
    PaymentMethod["STRIPE"] = "STRIPE";
})(PaymentMethod || (PaymentMethod = {}));
const stripe = new stripe_1.default(Stripe_SECRET);
const YOUR_DOMAIN = "http://localhost:3000";
exports.createOrder = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!((_a = req.customer) === null || _a === void 0 ? void 0 : _a._id)) {
        return next(new ErrorHandler_1.default("User not found", 404));
    }
    const { paymentMethod, email, cartId, address } = req.body;
    if (!cartId)
        return next(new ErrorHandler_1.default("Cart Id is required", 400));
    try {
        const cart = yield Cart_model_1.default.findById(cartId).populate({
            path: "products.productId",
            select: "name price discount stock MRP slug images",
        });
        if (!cart)
            return next(new ErrorHandler_1.default("Cart not found", 404));
        const _cart = cart.calculateTotal();
        if (!_cart.totalQuantity || _cart.totalQuantity === 0)
            return next(new ErrorHandler_1.default("No products in stock", 400));
        if (paymentMethod === PaymentMethod.COD) {
            const order = yield Order_model_1.default.create({
                userId: req.customer._id,
                items: _cart.products,
                total: _cart.totalPrice,
                address: address,
                paymentMethod: PaymentMethod.COD,
                status: "PLACED",
            });
            if (!order) {
                return next(new ErrorHandler_1.default("Something went wrong!", 500));
            }
            const returnUrl = `${YOUR_DOMAIN}/checkout/placed?orderId=${order.orderId}`;
            res.status(200).json({ message: "Order placed successfully", url: returnUrl });
        }
        else if (paymentMethod === PaymentMethod.STRIPE) {
            const lineItems = _cart.products.map((item) => {
                return {
                    price_data: {
                        currency: "inr",
                        product_data: {
                            name: item.productId.name,
                            images: item.productId.images,
                        },
                        unit_amount: item.productId.MRP * 100,
                    },
                    quantity: item.quantity,
                };
            });
            const session = yield stripe.checkout.sessions.create({
                customer_email: email,
                line_items: lineItems,
                mode: "payment",
                success_url: `${YOUR_DOMAIN}/checkout/status?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${YOUR_DOMAIN}/checkout/status?session_id={CHECKOUT_SESSION_ID}`,
            });
            if (!session) {
                return next(new ErrorHandler_1.default("Something went wrong!", 500));
            }
            const order = Order_model_1.default.create({
                userId: req.customer._id,
                sessionId: session.id,
                items: _cart.products,
                total: _cart.totalPrice,
                address: address,
                paymentMethod: PaymentMethod.STRIPE,
                status: "PENDING",
            });
            if (!order) {
                return next(new ErrorHandler_1.default("Something went wrong!", 500));
            }
            res.status(200).json({ url: session.url });
        }
        else {
            return next(new ErrorHandler_1.default("Invalid payment method", 400));
        }
        cart.products = [];
        cart.calculateTotal();
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
}));
exports.checkSession = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const userId = (_b = req.customer) === null || _b === void 0 ? void 0 : _b._id;
    if (!userId) {
        return next(new ErrorHandler_1.default("User not found", 404));
    }
    const sessionId = req.query.sessionId;
    if (!sessionId) {
        return next(new ErrorHandler_1.default("Session Id is required", 400));
    }
    try {
        const session = yield stripe.checkout.sessions.retrieve(sessionId);
        if (!session) {
            return next(new ErrorHandler_1.default("Session not found", 404));
        }
        if (session.payment_status === "paid") {
            const order = yield Order_model_1.default.findOne({ sessionId }).select("-address -createdAt -updatedAt -__v -sessionId -userId");
            if (!order) {
                return next(new ErrorHandler_1.default("Order not found", 404));
            }
            if (order.status !== "PLACED") {
                order.status = "PLACED";
                yield order.save();
            }
            res.status(200).json({
                status: true,
                order,
            });
        }
        else {
            const order = yield Order_model_1.default.findOneAndUpdate({ sessionId }, {
                $set: {
                    status: "FAILED",
                },
            }).select("-address -createdAt -updatedAt -__v -items");
            res.status(200).json({
                status: false,
                message: "Payment not completed",
                order: order,
            });
        }
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
}));
exports.webhook = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = req.body;
    if (!webhookSecret) {
        return next(new ErrorHandler_1.default("Webhook Error: Secret not provided", 400));
    }
    const payloadString = JSON.stringify(payload, null, 2);
    const header = stripe.webhooks.generateTestHeaderString({
        payload: payloadString,
        secret: webhookSecret,
    });
    try {
        let event = stripe.webhooks.constructEvent(payloadString, header, webhookSecret);
        console.log("🔔  Webhook received!", event.type);
        // Handle the checkout.session.completed event
        if (event.type === "checkout.session.completed") {
            Order_model_1.default.findOneAndUpdate({ sessionId: event.data.object.id }, { status: "PLACED" });
        }
        else if (event.type === "checkout.session.expired") {
            Order_model_1.default.findOneAndUpdate({ sessionId: event.data.object.id }, { status: "FAILED" });
        }
        else {
            res.status(200).end();
        }
    }
    catch (err) {
        return next(new ErrorHandler_1.default(`Webhook Error: ${err.message}`, 400));
    }
    res.status(200).end();
}));
exports.getOrders = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    const cutomerId = (_c = req.customer) === null || _c === void 0 ? void 0 : _c._id;
    const pageSize = Number(req.query.pageSize) || 5;
    const page = Number(req.query.page) || 1;
    let startFrom = 0; // Calculate skip value
    let endAt = 1; // Calculate limit value
    let pipeline = [];
    if (page)
        startFrom = (page - 1) * pageSize;
    if (pageSize)
        endAt = pageSize;
    pipeline.push({
        $facet: {
            orders: [
                {
                    $match: {
                        userId: new mongoose_1.default.Types.ObjectId(cutomerId),
                    },
                },
                { $sort: { createdAt: -1 } },
                { $skip: startFrom },
                { $limit: endAt },
                {
                    $project: {
                        sessionId: 0,
                        address: 0,
                        items: { productId: { discount: 0, stock: 0, totalPrice: 0 } },
                        __v: 0,
                    },
                },
            ],
            totalCount: [{ $count: "count" }],
        },
    });
    try {
        // const orders = await Order.find({ userId: cutomerId })
        //     .sort({ createdAt: -1 })
        //     .skip(startFrom)
        //     .limit(endAt)
        //     .select("-sessionId -address -items.productId.discount -items.productId.stock -items.totalPrice -__v");
        const orders = yield Order_model_1.default.aggregate(pipeline);
        if (!orders)
            return next(new ErrorHandler_1.default("No Orders Found", 404));
        // Format Response
        const totalCount = ((_d = orders[0].totalCount[0]) === null || _d === void 0 ? void 0 : _d.count) || 0;
        const _Orders = orders[0].orders;
        const maxPage = Math.ceil(totalCount / pageSize);
        let currentPage = page;
        if (currentPage > maxPage) {
            currentPage = maxPage;
        }
        const structuredOrders = structureOrders(_Orders);
        res.status(200).json({
            success: true,
            orders: structuredOrders,
            page: currentPage,
            maxPage,
            totalCount,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
}));
exports.getSingleOrder = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    const orderId = req.params.id;
    if (!orderId)
        return next(new ErrorHandler_1.default(`Order Id is required`, 400));
    try {
        const order = yield Order_model_1.default.findById(orderId);
        if (!order)
            return next(new ErrorHandler_1.default(`Order not found`, 404));
        if (order.userId.toString() !== ((_e = req.customer) === null || _e === void 0 ? void 0 : _e._id)) {
            return next(new ErrorHandler_1.default(`Unauthorized`, 401));
        }
        res.status(200).json({
            status: true,
            order: structureSingleOrder(order),
        });
        // res.status(200).json({
        //     status: true,
        //     order,
        // });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
}));
exports.cancelOrder = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _f;
    const orderId = req.params.id;
    if (!orderId)
        return next(new ErrorHandler_1.default(`Order Id is required`, 400));
    const customerId = (_f = req.customer) === null || _f === void 0 ? void 0 : _f._id;
    try {
        const order = yield Order_model_1.default.findById(orderId);
        if (!order)
            return next(new ErrorHandler_1.default(`Order not found`, 404));
        if (order.userId.toString() !== customerId)
            return next(new ErrorHandler_1.default(`Unauthorized`, 401));
        if (order.status === "CANCELLED")
            return next(new ErrorHandler_1.default(`Order already cancelled`, 400));
        if (order.status === "PLACED" || order.status === "PENDING") {
            order.status = "CANCELLED";
        }
        else {
            return next(new ErrorHandler_1.default(`Order can't be cancelled after it has been shipped`, 400));
        }
        yield order.save();
        res.status(200).json({
            success: true,
            message: "Order cancelled successfully",
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
            userId: order.userId,
            total: order.total,
            status: order.status,
            paymentMethod: order.paymentMethod,
            orderId: order.orderId,
            createdAt: new Date(order.createdAt).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
            }),
            updatedAt: new Date(order.updatedAt).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
            }),
            items: order.items.map((item) => {
                return {
                    _id: item.productId._id,
                    name: item.productId.name,
                    images: item.productId.images,
                    MRP: item.productId.MRP,
                    slug: item.productId.slug,
                    quantity: item.quantity,
                };
            }),
        };
    });
}
exports.structureOrders = structureOrders;
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
