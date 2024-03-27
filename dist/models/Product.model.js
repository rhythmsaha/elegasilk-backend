"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ProductSchema = new mongoose_1.Schema({
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
        unique: true,
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
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Color",
        },
    ],
    collections: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Collection",
        },
    ],
    attributes: [
        {
            category: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: "Category",
                required: [true, "Please provide a category"],
            },
            subcategory: [
                {
                    type: mongoose_1.Schema.Types.ObjectId,
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
    // Reviews
    ratings: [
        {
            user: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: "User",
            },
            rating: {
                type: Number,
                min: [1, "Rating must be at least 1"],
                max: [5, "Rating cannot be more than 5"],
            },
        },
    ],
}, {
    timestamps: true,
});
ProductSchema.pre("save", function (next) {
    const name = this.name;
    const slug = name.replace(/ /g, "_").toLowerCase();
    this.slug = slug + "_" + this.sku;
    next();
});
const Product = (0, mongoose_1.model)("Product", ProductSchema);
exports.default = Product;
