"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const cartSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
        index: true,
    },
    products: [
        {
            productId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
            totalPrice: {
                type: Number,
            },
        },
    ],
    totalQuantity: {
        type: Number,
        default: 0,
    },
    totalPrice: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});
cartSchema.methods.calculateTotal = function () {
    let totalQuantity = 0;
    let totalPrice = 0;
    // check if cart is Empty
    if (!this.products.length) {
        this.totalPrice = totalPrice;
        this.totalQuantity = totalQuantity;
        const cart = {
            _id: this._id,
            products: this.products,
            totalQuantity,
            totalPrice,
        };
        this.save();
        return cart;
    }
    // Remove products that are not in stock
    this.products = this.products.filter((item) => item.productId.stock && item.productId.stock > 0);
    this.products.forEach((item) => {
        const discountPercent = item.productId.discount || 0;
        let discountAmount = Math.round(item.productId.MRP * (discountPercent / 100));
        item.productId.MRP -= discountAmount;
        item.totalPrice = item.productId.MRP * item.quantity;
        item.totalPrice = Math.round(item.totalPrice);
        delete item.productId.discount;
        delete item.productId.stock;
    });
    totalQuantity = this.products.reduce((acc, item) => acc + item.quantity, 0);
    totalPrice = this.products.reduce((acc, item) => acc + item.quantity * item.productId.MRP, 0);
    this.totalPrice = totalPrice;
    this.totalQuantity = totalQuantity;
    const cart = {
        _id: this._id,
        products: this.products,
        totalQuantity,
        totalPrice,
    };
    this.save();
    return cart;
};
const Cart = (0, mongoose_1.model)("Cart", cartSchema);
exports.default = Cart;
// inside products = [{productId:{name, images, MRP, discount, stock, slug}, quantity:number}]
