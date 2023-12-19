import expressAsyncHandler from "express-async-handler";
import Product, { IProduct } from "../models/Product.model";
import ErrorHandler from "../utils/ErrorHandler";

/**
 * Creates a new product.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns The created product.
 */

export const createProduct = expressAsyncHandler(async (req, res, next) => {
    const { name, slug, description, images, MRP, price, published, colors, collections, attributes } = req.body as IProduct;

    // status validation
    if (published) {
        if (typeof published !== "boolean") {
            return next(new ErrorHandler("Status must be a boolean value", 400));
        }
    }

    // Create new product
    const newProduct = await Product.create({
        name,
        slug,
        description,
        images,
        MRP,
        price,
        published,
        colors,
        collections,
        attributes,
    });

    if (!newProduct) {
        return next(new ErrorHandler("Failed to create new product", 500));
    }

    // Send response
    res.status(201).json({
        success: true,
        data: newProduct,
    });
});

/**
 * Updates a product by ID.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns The updated product.
 */

export const updateProduct = expressAsyncHandler(async (req, res, next) => {
    const { name, slug, description, images, MRP, price, published, colors, collections, attributes } = req.body as IProduct;

    // status validation
    if (published) {
        if (typeof published !== "boolean") {
            return next(new ErrorHandler("Status must be a boolean value", 400));
        }
    }

    const updateFields: any = {};

    if (name) updateFields["name"] = name;
    if (slug) updateFields["slug"] = slug;
    if (description) updateFields["description"] = description;
    if (images?.length > 0) updateFields["images"] = images;
    if (MRP) updateFields["MRP"] = MRP;
    if (price) updateFields["price"] = price;
    if (typeof published === "boolean") updateFields["published"] = published;
    if (colors?.length > 0) updateFields["colors"] = colors;
    if (collections?.length > 0) updateFields["collections"] = collections;
    if (attributes?.length > 0) updateFields["attributes"] = attributes;

    // Find product by ID and update
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateFields, {
        new: true,
        runValidators: true,
    });

    if (!updatedProduct) {
        return next(new ErrorHandler("Failed to update product", 500));
    }

    // Send response
    res.status(200).json({
        success: true,
        data: updatedProduct,
    });
});
