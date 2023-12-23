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
    const { name, slug, description, images, MRP, price, published, colors, collections, attributes, stock } = req.body as IProduct;

    // status validation
    if (published) {
        if (typeof published !== "boolean") {
            return next(new ErrorHandler("Status must be a boolean value", 400));
        }
    }

    let createFields: any = {};

    if (name) createFields["name"] = name;
    if (slug) createFields["slug"] = slug;
    if (description) createFields["description"] = description;
    if (images?.length > 0) createFields["images"] = images;
    if (MRP) createFields["MRP"] = MRP;
    if (price) createFields["price"] = price;
    if (typeof published === "boolean") createFields["published"] = published;
    if (colors?.length > 0) createFields["colors"] = colors;
    if (collections?.length > 0) createFields["collections"] = collections;
    if (attributes?.length > 0) createFields["attributes"] = attributes;
    if (stock) createFields["stock"] = stock;

    // Create new product
    const newProduct = await Product.create(createFields);

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

/**
 * Deletes a product by ID.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns The deleted product.
 */

export const deleteProduct = expressAsyncHandler(async (req, res, next) => {
    // Find product by ID and delete
    const productId = req.params.id;

    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
        return next(new ErrorHandler("Failed to delete product", 500));
    }

    // Send response
    res.status(200).json({
        success: true,
        data: deletedProduct,
    });
});
