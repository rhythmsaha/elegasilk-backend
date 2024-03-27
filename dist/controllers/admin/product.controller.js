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
exports.insertProduct = exports.getProductFilters = exports.getProduct = exports.getAllProducts = exports.deleteProduct = exports.updateProduct = exports.createProduct = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Product_model_1 = __importDefault(require("../../models/Product.model"));
const ErrorHandler_1 = __importDefault(require("../../utils/ErrorHandler"));
const splitQuery_1 = __importDefault(require("../../utils/splitQuery"));
const SAMPLE_PRODUCTS_1 = __importDefault(require("../../lib/SAMPLE_PRODUCTS"));
const checkBoolean = (value) => {
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
exports.createProduct = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, slug, description, images, MRP, discount, published, colors, collections, attributes, stock, specs, sku, } = req.body;
    // status validation
    if (published && !checkBoolean(published)) {
        return next(new ErrorHandler_1.default("Status must be a boolean value", 400));
    }
    let createFields = {};
    if (name)
        createFields["name"] = name;
    if (slug)
        createFields["slug"] = slug;
    if (description)
        createFields["description"] = description;
    if ((images === null || images === void 0 ? void 0 : images.length) > 0)
        createFields["images"] = images;
    if (MRP)
        createFields["MRP"] = MRP;
    if (discount)
        createFields["discount"] = discount;
    if (typeof published === "boolean")
        createFields["published"] = published;
    if (sku)
        createFields["sku"] = sku;
    if ((colors === null || colors === void 0 ? void 0 : colors.length) > 0)
        createFields["colors"] = colors;
    if (collections && collections.length > 0)
        createFields["collections"] = collections;
    if (stock)
        createFields["stock"] = stock;
    if ((attributes === null || attributes === void 0 ? void 0 : attributes.length) > 0) {
        const _attrs = attributes.map((attribute) => {
            return {
                category: attribute._id,
                subcategory: attribute.subcategory,
            };
        });
        createFields["attributes"] = _attrs;
    }
    if (specs && specs.length > 0)
        createFields["specs"] = specs;
    // Create new product
    const newProduct = yield Product_model_1.default.create(createFields);
    if (!newProduct) {
        return next(new ErrorHandler_1.default("Failed to create new product", 500));
    }
    // Send response
    res.status(201).json({
        success: true,
        data: newProduct,
    });
}));
/**
 * Updates a product by ID.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns The updated product.
 */
exports.updateProduct = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, images, MRP, discount, published, colors, collections, attributes, stock, specs, sku } = req.body;
    // status validation
    if (!checkBoolean(published)) {
        return next(new ErrorHandler_1.default("Status must be a boolean value", 400));
    }
    const updateFields = {};
    if (name)
        updateFields["name"] = name;
    if (sku)
        updateFields["sku"] = sku;
    if (description)
        updateFields["description"] = description;
    if ((images === null || images === void 0 ? void 0 : images.length) > 0)
        updateFields["images"] = images;
    if (MRP)
        updateFields["MRP"] = MRP;
    if (discount)
        updateFields["discount"] = discount;
    if (typeof published === "boolean")
        updateFields["published"] = published;
    if ((colors === null || colors === void 0 ? void 0 : colors.length) > 0)
        updateFields["colors"] = colors;
    if (collections && (collections === null || collections === void 0 ? void 0 : collections.length) > 0)
        updateFields["collections"] = collections;
    if (stock)
        updateFields["stock"] = stock;
    if (specs && specs.length > 0)
        updateFields["specs"] = specs;
    if ((attributes === null || attributes === void 0 ? void 0 : attributes.length) > 0) {
        const _attrs = attributes.map((attribute) => {
            return {
                category: attribute._id,
                subcategory: attribute.subcategory,
            };
        });
        updateFields["attributes"] = _attrs;
    }
    // Find product by ID and update
    const updatedProduct = yield Product_model_1.default.findByIdAndUpdate(req.params.id, updateFields, {
        new: true,
        runValidators: true,
    });
    if (!updatedProduct) {
        return next(new ErrorHandler_1.default("Failed to update product", 500));
    }
    // Send response
    res.status(200).json({
        success: true,
        data: updatedProduct,
    });
}));
/**
 * Deletes a product by ID.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns The deleted product.
 */
exports.deleteProduct = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Find product by ID and delete
    const productId = req.params.id;
    const deletedProduct = yield Product_model_1.default.findByIdAndDelete(productId);
    if (!deletedProduct) {
        return next(new ErrorHandler_1.default("Failed to delete product", 500));
    }
    // Send response
    res.status(200).json({
        success: true,
        data: deletedProduct,
    });
}));
/**
 * Retrieves all products based on the provided search, pagination, sort, and category queries.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns The products.
 */
exports.getAllProducts = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const sortBy = req.query.sortby || "name"; //Get  sort by propery
    const sortOrder = req.query.sortorder || "asc"; // Get sort order Query
    // check if sortby query exists and its value is valid
    if (sortBy && !["name", "updatedAt", "published", "stock", "MRP"].includes(sortBy)) {
        return next(new ErrorHandler_1.default("Invalid sort by property", 400));
    }
    // check if sortorder query exists and its value is valid
    if (sortOrder && !["asc", "desc"].includes(sortOrder)) {
        return next(new ErrorHandler_1.default("Invalid sort order value", 400));
    }
    const search = req.query.search; // Get search query - {search products by name}
    const status = req.query.status; // Get status query - {filter products by status}
    const stock = req.query.stock; // Get stock query - {filter products by stock}
    const page = parseInt(req.query.page, 10) || 1; // Get page query
    const pageSize = parseInt(req.query.pageSize, 10) || 5; // Get page size query
    // Define query object
    let filters = {};
    let pipeline = [];
    let sortCondition = {};
    // update sortQuery object based on sort query
    if (sortBy)
        sortCondition[sortBy] = sortOrder === "asc" ? 1 : -1;
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
        }
        else if (stock === "OUT_OF_STOCK") {
            filters["stock"] = {
                $lt: 1,
            };
        }
        else if (stock === "LOW_STOCK") {
            filters["stock"] = {
                $lt: 10,
            };
        }
    }
    // if status query exists - update filters object
    if (status) {
        if (status === "true")
            filters["published"] = true;
        else if (status === "false")
            filters["published"] = false;
        else
            return next(new ErrorHandler_1.default("Invalid status value", 400));
    }
    if (filters) {
        pipeline.push({ $match: filters });
    }
    const stopPagination = req.query.stopPagination;
    let startFrom = 0; // Calculate skip value
    let endAt = 5; // Calculate limit value
    if (stopPagination === "true") {
        pipeline.push({
            $facet: {
                products: [{ $sort: sortCondition }],
                totalCount: [{ $count: "total" }],
            },
        });
    }
    else {
        // if page query exists - update skip value+
        if (page)
            startFrom = (page - 1) * pageSize;
        if (pageSize)
            endAt = pageSize;
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
                            discount: 1,
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
/**
 * Gets single product by ID.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns The product.
 */
exports.getProduct = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    // Find product by ID
    const product = yield Product_model_1.default.findById(req.params.id)
        .populate("attributes.category", "name")
        .populate("attributes.subcategory", "name")
        .populate("collections", "name")
        .populate("colors", "name");
    if (!product) {
        return next(new ErrorHandler_1.default("Product not found", 404));
    }
    const formatProductAttrs = product.attributes.map(({ _id, category, subcategory }) => {
        return {
            _id: category._id,
            category: category._id,
            subcategory: subcategory.map((sub) => sub._id),
        };
    });
    const formatCollections = (_b = product.collections) === null || _b === void 0 ? void 0 : _b.map((collection) => collection._id);
    const formatColors = (_c = product.colors) === null || _c === void 0 ? void 0 : _c.map((color) => color._id);
    product.attributes = formatProductAttrs;
    product.collections = formatCollections;
    product.colors = formatColors;
    // Send response
    res.status(200).json({
        success: true,
        data: product,
    });
}));
// For public users
exports.getProductFilters = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { attributes, colors, collections, price } = req.query;
    const query = {};
    if (attributes) {
        const _attrs = (0, splitQuery_1.default)(attributes);
        query["attributes.subcategory"] = {
            $in: _attrs,
        };
    }
    if (collections) {
        const _collections = (0, splitQuery_1.default)(collections);
        query["collections"] = {
            $in: _collections,
        };
    }
    if (colors) {
        const _colors = (0, splitQuery_1.default)(colors);
        query["colors"] = {
            $in: _colors,
        };
    }
    try {
        const [colors, attributes] = yield Promise.all([
            Product_model_1.default.aggregate([
                { $match: query },
                { $unwind: "$colors" },
                {
                    $lookup: {
                        from: "colors",
                        localField: "colors",
                        foreignField: "_id",
                        as: "color",
                    },
                },
                { $unwind: "$color" },
                {
                    $group: {
                        _id: "$color._id",
                        name: { $first: "$color.name" },
                        hex: { $first: "$color.hex" },
                    },
                },
            ]),
            Product_model_1.default.aggregate([
                { $match: query },
                { $unwind: "$attributes" },
                { $unwind: "$attributes.subcategory" },
                {
                    $lookup: {
                        from: "categories",
                        localField: "attributes.category",
                        foreignField: "_id",
                        as: "attributes.category",
                    },
                },
                {
                    $lookup: {
                        from: "subcategories",
                        localField: "attributes.subcategory",
                        foreignField: "_id",
                        as: "attributes.subcategory",
                    },
                },
                { $unwind: "$attributes.category" },
                { $unwind: "$attributes.subcategory" },
                {
                    $group: {
                        _id: "$attributes.category._id",
                        name: { $first: "$attributes.category.name" },
                        subcategories: {
                            $addToSet: {
                                _id: "$attributes.subcategory._id",
                                name: "$attributes.subcategory.name",
                            },
                        },
                    },
                },
            ]),
        ]);
        const sortedAttributes = attributes.sort((a, b) => a.name.localeCompare(b.name));
        const sortedColors = colors.sort((a, b) => a.name.localeCompare(b.name));
        res.json({
            success: true,
            filterOptions: {
                attributes: sortedAttributes,
                colors: sortedColors,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
exports.insertProduct = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const mprods = SAMPLE_PRODUCTS_1.default.map((product) => __awaiter(void 0, void 0, void 0, function* () {
        const { name, sku, description, price, discount, images, specs, attributes, collections, colors } = product;
        let createFields = {};
        if (name)
            createFields["name"] = name;
        if (sku)
            createFields["sku"] = sku;
        if (description)
            createFields["description"] = description;
        if (price)
            createFields["MRP"] = price;
        if (discount)
            createFields["discount"] = discount;
        if ((images === null || images === void 0 ? void 0 : images.length) > 0)
            createFields["images"] = images;
        if (collections && collections.length > 0)
            createFields["collections"] = collections;
        if ((colors === null || colors === void 0 ? void 0 : colors.length) > 0)
            createFields["colors"] = colors;
        if ((attributes === null || attributes === void 0 ? void 0 : attributes.length) > 0) {
            const _attrs = attributes.map(({ category, subcategory }) => {
                return {
                    category: category,
                    subcategory: subcategory,
                };
            });
            createFields["attributes"] = _attrs;
        }
        createFields["stock"] = Math.floor(Math.random() * 200) + 1;
        createFields["published"] = true;
        if (specs && specs.length > 0) {
            const _specs = specs.map(({ property, value }) => {
                return {
                    name: property,
                    value: value,
                };
            });
            createFields["specs"] = _specs;
        }
        // console.log(createFields["images"]);
        Product_model_1.default.create(createFields);
        // const newProduct = new Product(createFields);
        // newProduct.save();
        return createFields;
    }));
    // Create new product
    // const newProduct = await Product.create(createFields);
    // create multple products
    // const newProduct = await Product.insertMany(products);
    // if (!newProduct) {
    //     return next(new ErrorHandler("Failed to create new product", 500));
    // }
    // Send response
    res.status(201).json({
        success: true,
        data: mprods.length,
    });
}));
