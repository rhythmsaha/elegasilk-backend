import { Document, Schema, model, plugin } from "mongoose";
import validator from "validator";
import urlSlug from "mongoose-slug-generator";
plugin(urlSlug);

export interface IProduct extends Document {
    name: string;
    slug?: string;
    description: string;
    content?: string;
    images: string[];
    sku: string;
    MRP: number;
    discount: number;
    published: boolean;
    colors: string[];
    collections?: {
        _id: string;
        name: string;
    }[];
    stock: number;

    attributes: {
        _id: any;
        category: {
            _id: string;
            name: string;
        };
        subcategory: {
            _id: string;
            name: string;
        }[];
    }[];

    specs: [
        {
            name: string;
            value: string;
        }
    ];

    rating?: {
        average: number;
        count: number;
    };

    // Reviews
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
            slug: "name",
        },

        description: {
            type: String,
            trim: true,
            minlength: [20, "Description must be at least 20 characters long"],
        },

        images: [
            {
                type: String,
                trim: true,
                required: [true, "Please provide an image URL"],
                validate: [validator.isURL, "Please provide a valid image URL"],
            },
        ],

        MRP: {
            type: Number,
            required: [true, "Please provide a MRP"],
            min: [0, "MRP cannot be negative"],
        },

        discount: {
            type: Number,
            min: [0, "discount cannot be negative"],
        },
        stock: {
            type: Number,
            default: 1,
            min: [0, "Stock cannot be negative"],
        },

        published: {
            type: Boolean,
            default: false,
        },

        sku: {
            type: String,
            required: [true, "Please provide a SKU"],
            trim: true,
            unique: true,
            index: true,
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

                subcategory: [
                    {
                        type: Schema.Types.ObjectId,
                        ref: "SubCategory",
                        required: [true, "Please provide a subcategory"],
                    },
                ],
            },
        ],

        specs: [
            {
                name: {
                    type: String,
                    required: [true, "Please provide a specification name"],
                },

                value: {
                    type: String,
                    required: [true, "Please provide a specification value"],
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
