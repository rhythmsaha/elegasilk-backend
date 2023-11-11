import mongoose, { Document, Schema } from "mongoose";
import validator from "validator";
import slug from "mongoose-slug-generator";
mongoose.plugin(slug);

export interface IColor extends Document {
    name: string;
    slug: string;
    hex?: string;
    status: boolean;
}

const ModelSchema = new Schema<IColor>({
    name: {
        type: String,
        required: [true, "Please provide a name"],
        minlength: [2, "Name must be at least 2 characters long"],
        maxlength: [50, "Name must be at most 50 characters long"],
        validate: [validator.isAlpha, "Please provide a valid name"],
        trim: true,
    },

    slug: {
        type: String,
        slug: "name",
        unique: true,
        index: true,
    },

    hex: {
        type: String,
        trim: true,
    },

    status: {
        type: Boolean,
        default: true,
    },
});

const Color = mongoose.model<IColor>("Color", ModelSchema);
export default Color;