/**
 * Retrieves products for the store front based on the provided filters and sorting options.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns products list
 */
import expressAsyncHandler from "express-async-handler";
import { ISortOrder } from "../../types/typings";
import ErrorHandler from "../../utils/ErrorHandler";
import mongoose, { FilterQuery, PipelineStage } from "mongoose";
import Product, { IProduct } from "../../models/Product.model";
import splitQuery from "../../utils/splitQuery";

type IProductSortOption = "newest-first" | "price-high-to-low" | "price-low-to-high" | "relevant";

export const getProductsForStoreFront = expressAsyncHandler(async (req, res, next) => {
    const sortQuery = (req.query.sortby as IProductSortOption) || "relevant";
    const search = req.query.search as string; // Get search query - {search products by name}
    const attributesQuery = req.query.attributes as string; // Get attributes query - {filter products by attributes}
    const colorsQuery = req.query.colors as string; // Get colors query - {filter products by colors}
    const collectionsQuery = req.query.collections as string; // Get collections query - {filter products by collections}

    const page = parseInt(req.query.page as string, 10) || 1; // Get page query
    const pageSize = parseInt(req.query.pageSize as string, 10) || 30; // Get page size query

    if (sortQuery && !["newest-first", "price-high-to-low", "price-low-to-high", "relevant"].includes(sortQuery)) {
        return next(new ErrorHandler("Invalid sort by property", 400));
    }

    let sortBy: "name" | "updatedAt" | "published" | "stock" | "MRP" | "createdAt";

    let sortOrder: ISortOrder = "asc";

    switch (sortQuery) {
        case "newest-first":
            // Get products sorted by newest first
            sortBy = "createdAt";
            sortOrder = "desc";
            break;
        case "price-high-to-low":
            // Get products sorted by price high to low
            sortBy = "MRP";
            sortOrder = "desc";
            break;
        case "price-low-to-high":
            // Get products sorted by price low to high
            sortBy = "MRP";
            sortOrder = "asc";
            break;
        case "relevant":
            // Get products sorted by relevance
            sortBy = "stock";
            sortOrder = "desc";

            break;
        default:
            // Get products sorted by relevance
            sortBy = "stock";
            sortOrder = "desc";
            break;
    }

    // Define query object
    let filters = {
        published: true,
        stock: { $gt: 0 },
    } as FilterQuery<IProduct>;
    let pipeline: PipelineStage[] = [];

    let sortCondition: Record<string, 1 | -1 | mongoose.Expression.Meta> = {};

    // update sortQuery object based on sort query
    if (sortBy) sortCondition[sortBy] = sortOrder === "asc" ? 1 : -1;

    // if search query exists update filters object
    if (search) {
        filters["name"] = { $regex: new RegExp(search, "i") };
    }

    if (attributesQuery) {
        const _attrs = splitQuery(attributesQuery);
        filters["attributes.subcategory"] = {
            $in: _attrs,
        };
    }

    if (collectionsQuery) {
        const _collections = splitQuery(collectionsQuery);
        filters["collections"] = {
            $in: _collections,
        };
    }

    if (colorsQuery) {
        const _colors = splitQuery(colorsQuery);
        filters["colors"] = {
            $in: _colors,
        };
    }

    if (filters) {
        pipeline.push({ $match: filters });
    }

    let startFrom = 0; // Calculate skip value
    let endAt = 30; // Calculate limit value

    if (page && pageSize) {
        startFrom = (page - 1) * pageSize;
        endAt = pageSize;
    }

    pipeline.push({
        $facet: {
            products: [
                { $match: filters },
                { $sort: sortCondition },
                { $skip: startFrom },
                { $limit: endAt },
                {
                    $project: {
                        name: 1,
                        slug: 1,
                        images: 1,
                        MRP: 1,
                        discount: 1,
                        published: 1,
                        stock: 1,
                        createdAt: 1,
                        ratings: 1,
                    },
                },
            ],
            totalCount: [{ $count: "total" }],
        },
    });

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

export const getProductsPaths = expressAsyncHandler(async (req, res, next) => {
    const products = await Product.find({ published: true });

    if (!products) {
        return next(new ErrorHandler("Failed to fetch products", 500));
    }

    const paths = products.map((product) => {
        if (product.published === false) return;
        return {
            params: {
                slug: product.slug,
            },
        };
    });

    res.status(200).json({
        success: true,
        paths: paths,
    });
});

export const getProduct = expressAsyncHandler(async (req, res, next) => {
    const slug = req.params.slug;

    try {
        const product = await Product.findOne({ slug }).populate("colors").populate("collections");

        if (!product) {
            return next(new ErrorHandler("Product not found", 404));
        }

        res.status(200).json({
            success: true,
            data: product,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});
