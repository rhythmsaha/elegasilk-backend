import { Document, ObjectId, Schema, model } from "mongoose";
import { IProduct } from "../Product.model";

export interface IPopulatedCartItem {
    productId: {
        _id: string;
        name: string;
        images: string[];
        MRP: number;
        discount?: number;
        stock?: number;
        slug: string;
    };
    quantity: number;
    totalPrice?: number;
}

export interface IPopulatedCart extends Document {
    _id: string;
    userId: string;
    products: IPopulatedCartItem[];
    totalQuantity?: number;
    totalPrice?: number;

    calculateTotal: () => IPopulatedCart;
}

interface CartItem {
    productId: ObjectId;
    quantity: number;
    totalPrice?: number;
}

export interface ICartSchema extends Document {
    userId: ObjectId;
    products: CartItem[];
    totalQuantity?: number;
    totalPrice?: number;

    calculateTotal: () => IPopulatedCart;
}

const cartSchema = new Schema<ICartSchema>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true,
        },

        products: [
            {
                productId: {
                    type: Schema.Types.ObjectId,
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
    },

    {
        timestamps: true,
    }
);

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
    this.products = this.products.filter(
        (item: IPopulatedCartItem) => item.productId.stock && item.productId.stock > 0
    );

    this.products.forEach((item: IPopulatedCartItem) => {
        const discountPercent = item.productId.discount || 0;
        let discountAmount = Math.round(item.productId.MRP * (discountPercent / 100));

        item.productId.MRP -= discountAmount;
        item.totalPrice = item.productId.MRP * item.quantity;
        item.totalPrice = Math.round(item.totalPrice);

        delete item.productId.discount;
        delete item.productId.stock;
    });

    totalQuantity = this.products.reduce((acc: number, item: IPopulatedCartItem) => acc + item.quantity, 0);
    totalPrice = this.products.reduce(
        (acc: number, item: IPopulatedCartItem) => acc + item.quantity * item.productId.MRP,
        0
    );

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

const Cart = model<ICartSchema>("Cart", cartSchema);
export default Cart;

// inside products = [{productId:{name, images, MRP, discount, stock, slug}, quantity:number}]
