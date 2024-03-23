import mongoose, { Document, ObjectId } from "mongoose";

interface IRatingSchema extends Document {
    productId: ObjectId;
    customerId?: ObjectId;
    rating: number;
    title?: string;
    review?: string;
}

const RatingSchema = new mongoose.Schema<IRatingSchema>({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },

    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
    },

    title: {
        type: String,
    },

    review: {
        type: String,
    },

    rating: {
        type: Number,
        required: true,
    },
});

const Rating = mongoose.model<IRatingSchema>("Rating", RatingSchema);
export default Rating;
