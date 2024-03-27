"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const OrderSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
        index: true,
    },
    sessionId: {
        type: String,
        index: true,
    },
    orderId: { type: String, index: true, unique: true },
    address: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        mobile: { type: String, required: true },
        alternativeMobile: { type: String },
        houseNo: { type: String, required: true },
        street: { type: String, required: true },
        landmark: { type: String },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
    },
    items: [
        {
            productId: {
                _id: { type: mongoose_1.Schema.Types.ObjectId, ref: "Product", required: true },
                name: { type: String, required: true },
                images: [{ type: String, required: true }],
                MRP: { type: Number, required: true },
                discount: { type: Number },
                stock: { type: Number },
                slug: { type: String, required: true },
            },
            quantity: { type: Number, required: true },
            totalPrice: { type: Number, required: true },
        },
    ],
    total: { type: Number, required: true },
    paymentMethod: { type: String, required: true, enum: ["CASH_ON_DELIVERY", "STRIPE"] },
    status: {
        type: String,
        required: true,
        enum: [
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
        ],
    },
}, {
    timestamps: true,
});
OrderSchema.methods.createOrderId = function () {
    const prefix = "EL-";
    const orderId = `${prefix}${Date.now()}`;
    return orderId;
};
OrderSchema.pre("save", function (next) {
    if (!this.orderId) {
        this.orderId = this.createOrderId();
    }
    next();
});
const Order = (0, mongoose_1.model)("Order", OrderSchema);
exports.default = Order;
