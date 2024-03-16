import { Document, ObjectId, Schema, model } from "mongoose";
import { IProduct } from "../Product.model";

interface CartItem {
    productId: ObjectId;
    quantity: number;
}

export interface ICartSchema extends Document {
    userId: ObjectId;
    products: CartItem[];
    totalQuantity?: number;
    totalPrice?: number;
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

                quantity: {
                    type: Number,
                    required: true,
                },
            },
        ],
    },

    {
        timestamps: true,
    }
);

const Cart = model<ICartSchema>("Cart", cartSchema);
export default Cart;
