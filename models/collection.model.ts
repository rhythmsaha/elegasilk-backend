import mongoose, { Document, Schema } from "mongoose";
import validator from "validator";
import slug from "mongoose-slug-generator";
mongoose.plugin(slug);

export interface ICollection extends Document {
    name: string;
    slug: string;
    description?: string;
    image?: string;
    status: boolean;
    subcategory?: string;
}

const ModelSchema = new Schema<ICollection>(
    {
        name: {
            type: String,
            required: [true, "Please provide a name"],
            minlength: [2, "Name must be at least 2 characters long"],
            maxlength: [50, "Name must be at most 50 characters long"],
            trim: true,
            index: "text",
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
        },

        status: {
            type: Boolean,
            default: true,
        },

        subcategory: {
            type: Schema.Types.ObjectId,
            ref: "SubCategory",
        },
    },
    { timestamps: true }
);

const Collection = mongoose.model<ICollection>("Collection", ModelSchema);
export default Collection;
