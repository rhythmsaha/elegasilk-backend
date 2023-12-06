import mongoose, { Document, Schema } from "mongoose";
import validator from "validator";
import urlSlug from "mongoose-slug-generator";
mongoose.plugin(urlSlug);

export interface ICategory extends Document {
    name: string;
    slug: string;
    description?: string;
    image?: string;
    status: boolean;
    subcategories?: string[];
}

const ModelSchema = new Schema<ICategory>(
    {
        name: {
            type: String,
            required: [true, "Please provide a name"],
            minlength: [2, "Name must be at least 2 characters long"],
            maxlength: [50, "Name must be at most 50 characters long"],
            trim: true,
            index: true,
        },

        slug: {
            type: String,
            slug: "name",
            index: true,
        },

        description: {
            type: String,
            trim: true,
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

        subcategories: [
            {
                type: Schema.Types.ObjectId,
                ref: "SubCategory",
            },
        ],
    },
    { timestamps: true }
);

const Category = mongoose.model<ICategory>("Category", ModelSchema);
export default Category;
