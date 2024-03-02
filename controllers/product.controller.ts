import expressAsyncHandler from "express-async-handler";
import Product, { IProduct } from "../models/Product.model";
import ErrorHandler from "../utils/ErrorHandler";
import { formattedProducts } from "../types/typings";

const checkBoolean = (value: any) => {
    return typeof value === "boolean";
};

/**
 * Creates a new product.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns The created product.
 */

export const createProduct = expressAsyncHandler(async (req, res, next) => {
    const { name, slug, description, images, MRP, discount, published, colors, collections, attributes, stock, specs, sku } = req.body as IProduct;

    // status validation
    if (published && !checkBoolean(published)) {
        return next(new ErrorHandler("Status must be a boolean value", 400));
    }

    let createFields: any = {};

    if (name) createFields["name"] = name;
    if (slug) createFields["slug"] = slug;
    if (description) createFields["description"] = description;
    if (images?.length > 0) createFields["images"] = images;
    if (MRP) createFields["MRP"] = MRP;
    if (discount) createFields["discount"] = discount;
    if (typeof published === "boolean") createFields["published"] = published;
    if (sku) createFields["sku"] = sku;
    if (colors?.length > 0) createFields["colors"] = colors;
    if (collections && collections.length > 0) createFields["collections"] = collections;
    if (stock) createFields["stock"] = stock;
    if (attributes?.length > 0) {
        const _attrs = attributes.map((attribute) => {
            return {
                category: attribute._id,
                subcategory: attribute.subcategory,
            };
        });

        createFields["attributes"] = _attrs;
    }

    if (specs && specs.length > 0) createFields["specs"] = specs;

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
    const { name, description, images, MRP, discount, published, colors, collections, attributes, stock, specs, sku } = req.body as IProduct;

    // status validation
    if (!checkBoolean(published)) {
        return next(new ErrorHandler("Status must be a boolean value", 400));
    }

    const updateFields: any = {};

    if (name) updateFields["name"] = name;
    if (sku) updateFields["sku"] = sku;
    if (description) updateFields["description"] = description;
    if (images?.length > 0) updateFields["images"] = images;
    if (MRP) updateFields["MRP"] = MRP;
    if (discount) updateFields["discount"] = discount;
    if (typeof published === "boolean") updateFields["published"] = published;
    if (colors?.length > 0) updateFields["colors"] = colors;
    if (collections && collections?.length > 0) updateFields["collections"] = collections;
    if (stock) updateFields["stock"] = stock;
    if (specs && specs.length > 0) updateFields["specs"] = specs;
    if (attributes?.length > 0) {
        const _attrs = attributes.map((attribute) => {
            return {
                category: attribute._id,
                subcategory: attribute.subcategory,
            };
        });
        updateFields["attributes"] = _attrs;
    }

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

/**
 * Gets single product by ID.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns The product.
 */
export const getProduct = expressAsyncHandler(async (req, res, next) => {
    // Find product by ID
    const product = await Product.findById(req.params.id).populate("attributes.category", "name").populate("attributes.subcategory", "name").populate("collections", "name").populate("colors", "name");

    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

    const formatProductAttrs: any = product.attributes.map(({ _id, category, subcategory }) => {
        return {
            _id: category._id,
            category: category._id,
            subcategory: subcategory.map((sub) => sub._id),
        };
    });

    const formatCollections = product.collections?.map((collection: any) => collection._id);
    const formatColors = product.colors?.map((color: any) => color._id);

    product.attributes = formatProductAttrs;
    product.collections = formatCollections;
    product.colors = formatColors;

    // Send response
    res.status(200).json({
        success: true,
        data: product,
    });
});
