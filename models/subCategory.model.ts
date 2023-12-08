import mongoose, { Document, Schema } from "mongoose";
import validator from "validator";
import slug from "mongoose-slug-generator";
mongoose.plugin(slug);

export interface ISubCategory extends Document {
    name: string;
    slug: string;
    description?: string;
    image?: string;
    status: boolean;
    category?: string;
}

const ModelSchema = new Schema<ISubCategory>(
    {
        name: {
            type: String,
            required: [true, "Please provide a name"],
            minlength: [2, "Name must be at least 2 characters long"],
            maxlength: [50, "Name must be at most 50 characters long"],

            index: true,
            trim: true,
        },

        slug: {
            type: String,
            slug: "name",
            index: true,
        },

        description: {
            type: String,
            trim: true,
            minlength: [2, "Name must be at least 2 characters long"],
            maxlength: [500, "Name must be at most 50 characters long"],
        },

        image: {
            type: String,
            trim: true,
            validate: [validator.isURL, "Please provide a valid image URL"],
        },

        status: {
            type: Boolean,
            default: true,
        },

        category: {
            type: Schema.Types.ObjectId,
            ref: "Category",
        },
    },
    { timestamps: true }
);

const SubCategory = mongoose.model<ISubCategory>("SubCategory", ModelSchema);
export default SubCategory;
