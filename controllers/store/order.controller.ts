import expressAsyncHandler from "express-async-handler";
import Stripe from "stripe";
import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import Cart from "../../models/store/Cart.model";
import ErrorHandler from "../../utils/ErrorHandler";
import Order from "../../models/store/Order.model";
dotenv.config();

const Stripe_APIKEY = process.env.STRIPE_API_KEY || "";
const webhookSecret = process.env.WEBHOOK_SECRET || "";
const Stripe_SECRET = process.env.STRIPE_SECRET_KEY || "";

enum PaymentMethod {
    COD = "CASH_ON_DELIVERY",
    STRIPE = "STRIPE",
}

const stripe = new Stripe(Stripe_SECRET);

const YOUR_DOMAIN = "http://localhost:3000";

export const createOrder = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.customer?._id) {
        return next(new ErrorHandler("User not found", 404));
    }

    const { paymentMethod, email, cartId, address } = req.body;

    if (!cartId) return next(new ErrorHandler("Cart Id is required", 400));

    try {
        const cart = await Cart.findById(cartId).populate({
            path: "products.productId",
            select: "name price discount stock MRP slug images",
        });

        if (!cart) return next(new ErrorHandler("Cart not found", 404));

        const _cart = cart.calculateTotal();

        if (!_cart.totalQuantity || _cart.totalQuantity === 0)
            return next(new ErrorHandler("No products in stock", 400));

        if (paymentMethod === PaymentMethod.COD) {
            const order = await Order.create({
                userId: req.customer._id,
                items: _cart.products,
                total: _cart.totalPrice,
                address: address,
                paymentMethod: PaymentMethod.COD,
                status: "PLACED",
            });

            if (!order) {
                return next(new ErrorHandler("Something went wrong!", 500));
            }

            const returnUrl = `${YOUR_DOMAIN}/checkout/placed?orderId=${order.orderId}`;
            res.status(200).json({ message: "Order placed successfully", url: returnUrl });
            return;
        } else if (paymentMethod === PaymentMethod.STRIPE) {
            const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] | undefined = _cart.products.map((item) => {
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

            const session = await stripe.checkout.sessions.create({
                customer_email: email,
                line_items: lineItems,
                mode: "payment",
                success_url: `${YOUR_DOMAIN}/checkout/status?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${YOUR_DOMAIN}/checkout/status?session_id={CHECKOUT_SESSION_ID}`,
            });

            if (!session) {
                return next(new ErrorHandler("Something went wrong!", 500));
            }

            const order = Order.create({
                userId: req.customer._id,
                sessionId: session.id,
                items: _cart.products,
                total: _cart.totalPrice,
                address: address,
                paymentMethod: PaymentMethod.STRIPE,
                status: "PENDING",
            });

            if (!order) {
                return next(new ErrorHandler("Something went wrong!", 500));
            }

            res.status(200).json({ url: session.url });
        } else {
            return next(new ErrorHandler("Invalid payment method", 400));
        }

        // cart.products = [];
        // cart.calculateTotal();
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

export const checkSession = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.customer?._id;

    if (!userId) {
        return next(new ErrorHandler("User not found", 404));
    }

    const sessionId = req.query.sessionId as string;

    if (!sessionId) {
        return next(new ErrorHandler("Session Id is required", 400));
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (!session) {
            return next(new ErrorHandler("Session not found", 404));
        }

        if (session.payment_status === "paid") {
            const order = await Order.findOne({ sessionId }).select(
                "-address -createdAt -updatedAt -__v -sessionId -userId"
            );

            if (!order) {
                return next(new ErrorHandler("Order not found", 404));
            }

            if (order.status !== "PLACED") {
                order.status = "PLACED";
                await order.save();
            }

            res.status(200).json({
                status: true,
                order,
            });
        } else {
            const order = await Order.findOneAndUpdate(
                { sessionId },
                {
                    $set: {
                        status: "FAILED",
                    },
                }
            ).select("-address -createdAt -updatedAt -__v -items");

            res.status(200).json({
                status: false,
                message: "Payment not completed",
                order: order,
            });
        }
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

export const webhook = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;

    if (!webhookSecret) {
        return next(new ErrorHandler("Webhook Error: Secret not provided", 400));
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
            Order.findOneAndUpdate({ sessionId: event.data.object.id }, { status: "PLACED" });
        } else if (event.type === "checkout.session.expired") {
            Order.findOneAndUpdate({ sessionId: event.data.object.id }, { status: "FAILED" });
        } else {
            res.status(200).end();
        }
    } catch (err: any) {
        return next(new ErrorHandler(`Webhook Error: ${err.message}`, 400));
    }

    res.status(200).end();
});

export const getOrders = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const cutomerId = req.customer?._id;

    try {
        const orders = await Order.find({ userId: cutomerId }).select(
            "-sessionId -address -items.productId.discount -items.productId.stock -items.totalPrice -__v"
        );

        const structuredOrders = structureOrders(orders);

        res.status(200).json({
            success: true,
            orders: structuredOrders,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

export const getSingleOrder = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const orderId = req.params.orderId;
    if (!orderId) return next(new ErrorHandler(`Order Id is required`, 400));

    try {
        const order = await Order.findOne({ orderId });

        if (!order) return next(new ErrorHandler(`Order not found`, 404));

        res.status(200).json({
            status: true,
            order,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

export const updateOrder = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {});

export function structureOrders(orders: any) {
    return orders.map((order: any) => {
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

            items: order.items.map((item: any) => {
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
