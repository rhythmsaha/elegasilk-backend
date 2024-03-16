import { Document, ObjectId, Schema } from "mongoose";

interface CartItem {
    productId: ObjectId;
    price: number;
    quantity: number;
    totalPrice: number;
}

export interface ICartSchema extends Document {
    userId: ObjectId;
    products: CartItem[];
    totalPrice: number;
    totalQuantity: number;
}

const cartSchema = new Schema<ICartSchema>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        products: [
            {
                productId: {
                    type: Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                price: {
                    type: Number,
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                },
                totalPrice: {
                    type: Number,
                    required: true,
                },
            },
        ],

        totalPrice: {
            type: Number,
            required: true,
        },

        totalQuantity: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export default cartSchema;
