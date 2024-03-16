import mongoose, { Document, ObjectId } from "mongoose";

interface IWishlistModel extends Document {
    userId: string;
    products: ObjectId[];
    total: number;
}

const WishlistSchema = new mongoose.Schema<IWishlistModel>(
    {
        userId: { type: String, required: true, unique: true, index: true },
        products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
        total: { type: Number, default: 0 },
    },
    { timestamps: true }
);

const Wishlist = mongoose.model<IWishlistModel>("Wishlist", WishlistSchema);
export default Wishlist;
