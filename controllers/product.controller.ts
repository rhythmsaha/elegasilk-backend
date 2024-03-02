import expressAsyncHandler from "express-async-handler";
import Product, { IProduct } from "../models/Product.model";
import ErrorHandler from "../utils/ErrorHandler";
import { ISortOrder } from "../types/typings";
import mongoose, { FilterQuery, PipelineStage } from "mongoose";

const checkBoolean = (value: any) => {
    return typeof value === "boolean";
};

// For admin users Only

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
 * Retrieves all products based on the provided search, pagination, sort, and category queries.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns The products.
 */
export const getAllProducts = expressAsyncHandler(async (req, res, next) => {
    const sortBy = (req.query.sortby as "name" | "updatedAt" | "published" | "stock" | "price") || "name"; //Get  sort by propery
    const sortOrder: ISortOrder = (req.query.sortorder as ISortOrder) || "asc"; // Get sort order Query

    // check if sortby query exists and its value is valid
    if (sortBy && !["name", "updatedAt", "published", "stock", "MRP"].includes(sortBy)) {
        return next(new ErrorHandler("Invalid sort by property", 400));
    }

    // check if sortorder query exists and its value is valid
    if (sortOrder && !["asc", "desc"].includes(sortOrder)) {
        return next(new ErrorHandler("Invalid sort order value", 400));
    }

    const search = req.query.search as string; // Get search query - {search products by name}
    const status = req.query.status as string; // Get status query - {filter products by status}
    const stock = req.query.stock as string; // Get stock query - {filter products by stock}

    const page = parseInt(req.query.page as string, 10) || 1; // Get page query
    const pageSize = parseInt(req.query.pageSize as string, 10) || 5; // Get page size query

    // Define query object
    let filters = {} as FilterQuery<IProduct>;
    let pipeline: PipelineStage[] = [];

    let sortCondition: Record<string, 1 | -1 | mongoose.Expression.Meta> = {};

    // update sortQuery object based on sort query
    if (sortBy) sortCondition[sortBy] = sortOrder === "asc" ? 1 : -1;

    // if search query exists update filters object
    if (search) {
        filters["name"] = { $regex: new RegExp(search, "i") };
    }

    // if stock query exists - update filters object
    if (stock) {
        if (stock === "IN_STOCK") {
            filters["stock"] = {
                $gte: 10,
            };
        } else if (stock === "OUT_OF_STOCK") {
            filters["stock"] = {
                $lt: 1,
            };
        } else if (stock === "LOW_STOCK") {
            filters["stock"] = {
                $lt: 10,
            };
        }
    }

    // if status query exists - update filters object
    if (status) {
        if (status === "true") filters["published"] = true;
        else if (status === "false") filters["published"] = false;
        else return next(new ErrorHandler("Invalid status value", 400));
    }

    if (filters) {
        pipeline.push({ $match: filters });
    }

    const stopPagination = req.query.stopPagination as string;

    let startFrom = 0; // Calculate skip value
    let endAt = 5; // Calculate limit value

    if (stopPagination === "true") {
        pipeline.push({
            $facet: {
                products: [{ $sort: sortCondition }],
                totalCount: [{ $count: "total" }],
            },
        });
    } else {
        // if page query exists - update skip value+
        if (page) startFrom = (page - 1) * pageSize;
        if (pageSize) endAt = pageSize;

        pipeline.push({
            $facet: {
                products: [
                    { $sort: sortCondition },
                    { $skip: startFrom },
                    { $limit: endAt },
                    {
                        $project: {
                            name: 1,
                            slug: 1,
                            images: 1,
                            MRP: 1,
                            published: 1,
                            stock: 1,
                            updatedAt: 1,
                        },
                    },
                ],
                totalCount: [{ $count: "total" }],
            },
        });
    }

    const products = await Product.aggregate(pipeline);

    if (!products) {
        return next(new ErrorHandler("Failed to fetch products", 500));
    }

    // Format response
    const total = products[0].totalCount[0]?.total || 0;
    const _products = products[0].products;
    const maxPage = Math.ceil(total / pageSize);
    let currentPage = page;

    if (currentPage > maxPage) {
        currentPage = maxPage;
    }

    // Send response
    res.status(200).json({
        success: true,
        data: _products,
        total,
        currentPage,
        maxPage,
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
