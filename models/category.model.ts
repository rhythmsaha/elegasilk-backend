import mongoose, { Document, Schema } from "mongoose";
import validator from "validator";
import slug from "mongoose-slug-generator";
mongoose.plugin(slug);

export interface ICategory extends Document {
    name: string;
    slug: string;
    description?: string;
    image?: string;
    status: boolean;
    subcategories?: string[];
}

const ModelSchema = new Schema<ICategory>({
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
});

const Category = mongoose.model<ICategory>("Category", ModelSchema);
export default Category;
