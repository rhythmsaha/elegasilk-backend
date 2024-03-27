"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProduct = exports.getProductsPaths = exports.getProductsForStoreFront = void 0;
/**
 * Retrieves products for the store front based on the provided filters and sorting options.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns products list
 */
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const ErrorHandler_1 = __importDefault(require("../../utils/ErrorHandler"));
const Product_model_1 = __importDefault(require("../../models/Product.model"));
const splitQuery_1 = __importDefault(require("../../utils/splitQuery"));
exports.getProductsForStoreFront = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const sortQuery = req.query.sortby || "relevant";
    const search = req.query.search; // Get search query - {search products by name}
    const attributesQuery = req.query.attributes; // Get attributes query - {filter products by attributes}
    const colorsQuery = req.query.colors; // Get colors query - {filter products by colors}
    const collectionsQuery = req.query.collections; // Get collections query - {filter products by collections}
    const page = parseInt(req.query.page, 10) || 1; // Get page query
    const pageSize = parseInt(req.query.pageSize, 10) || 30; // Get page size query
    if (sortQuery && !["newest-first", "price-high-to-low", "price-low-to-high", "relevant"].includes(sortQuery)) {
        return next(new ErrorHandler_1.default("Invalid sort by property", 400));
    }
    let sortBy;
    let sortOrder = "asc";
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
    };
    let pipeline = [];
    let sortCondition = {};
    // update sortQuery object based on sort query
    if (sortBy)
        sortCondition[sortBy] = sortOrder === "asc" ? 1 : -1;
    // if search query exists update filters object
    if (search) {
        console.log("Search:", search); // Debug line
        filters["name"] = { $regex: new RegExp(search, "i") };
        console.log("Filters:", filters); // Debug line
    }
    if (attributesQuery) {
        const _attrs = (0, splitQuery_1.default)(attributesQuery);
        filters["attributes.subcategory"] = {
            $in: _attrs,
        };
    }
    if (collectionsQuery) {
        const _collections = (0, splitQuery_1.default)(collectionsQuery);
        filters["collections"] = {
            $in: _collections,
        };
    }
    if (colorsQuery) {
        const _colors = (0, splitQuery_1.default)(colorsQuery);
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
    const products = yield Product_model_1.default.aggregate(pipeline);
    if (!products) {
        return next(new ErrorHandler_1.default("Failed to fetch products", 500));
    }
    // Format response
    const total = ((_a = products[0].totalCount[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
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
}));
exports.getProductsPaths = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const products = yield Product_model_1.default.find({ published: true });
    if (!products) {
        return next(new ErrorHandler_1.default("Failed to fetch products", 500));
    }
    const paths = products.map((product) => {
        if (product.published === false)
            return;
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
}));
exports.getProduct = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const slug = req.params.slug;
    try {
        const product = yield Product_model_1.default.findOne({ slug }).populate("colors").populate("collections");
        if (!product) {
            return next(new ErrorHandler_1.default("Product not found", 404));
        }
        res.status(200).json({
            success: true,
            data: product,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
}));
