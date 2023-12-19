import { Document, Schema, model } from "mongoose";
import validator from "validator";

export interface IProduct extends Document {
    name: string;
    slug: string;
    description: string;
    images: string[];
    MRP: number;
    price: number;
    published: boolean;
    colors: string[];
    collections: string[];
    attributes: [
        {
            category: string;
            subcategory: string;
        }
    ];

    rating: {
        average: number;
        count: number;
    };
}

const ProductSchema = new Schema<IProduct>(
    {
        name: {
            type: String,
            required: [true, "Please provide a name"],
            minlength: [5, "Name must be at least 5 characters long"],
            trim: true,
            index: true,
            lowercase: true,
        },

        slug: {
            type: String,
            index: true,
        },

        description: {
            type: String,
            trim: true,
            required: [true, "Please provide a description"],
            minlength: [20, "Description must be at least 20 characters long"],
        },

        images: [
            {
                type: String,
                trim: true,
                validate: [validator.isURL, "Please provide a valid image URL"],
            },
        ],

        MRP: {
            type: Number,
            required: [true, "Please provide a MRP"],
            min: [0, "MRP cannot be negative"],
        },

        price: {
            type: Number,
            required: [true, "Please provide a price"],
            min: [0, "Price cannot be negative"],
        },

        published: {
            type: Boolean,
            default: false,
        },

        colors: [
            {
                type: Schema.Types.ObjectId,
                ref: "Color",
            },
        ],

        collections: [
            {
                type: Schema.Types.ObjectId,
                ref: "Collection",
            },
        ],

        attributes: [
            {
                category: {
                    type: Schema.Types.ObjectId,
                    ref: "Category",
                    required: [true, "Please provide a category"],
                },

                subcategory: {
                    type: Schema.Types.ObjectId,
                    ref: "SubCategory",
                    required: [true, "Please provide a subcategory"],
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

const Product = model<IProduct>("Product", ProductSchema);
export default Product;
