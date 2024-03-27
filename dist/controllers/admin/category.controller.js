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
exports.getCategory = exports.getAllCategories = exports.deleteCategory = exports.updateCategory = exports.createCategory = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const category_model_1 = __importDefault(require("../../models/category.model"));
const ErrorHandler_1 = __importDefault(require("../../utils/ErrorHandler"));
const validator_1 = __importDefault(require("validator"));
const subCategory_model_1 = __importDefault(require("../../models/subCategory.model"));
/**
 * Creates a new category.
 * @function
 * @async
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next function.
 * @returns {Promise<void>} - Promise that resolves with no value.
 * @throws {ErrorHandler} - If there is an error creating the category.
 */
exports.createCategory = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, image, status } = req.body;
    // Name validation handled by mongoose
    // Description validation
    if (description) {
        if (!validator_1.default.isLength(description, { min: 2, max: 500 })) {
            return next(new ErrorHandler_1.default("Description must be between 2 and 500 characters long", 400));
        }
    }
    // Image validation handled by mongoose
    // Status validation
    if (status) {
        if (typeof status !== "boolean") {
            return next(new ErrorHandler_1.default("Status must be a boolean value", 400));
        }
    }
    // Create new category
    const newCategory = yield category_model_1.default.create({
        name,
        description,
        image,
        status,
    });
    if (!newCategory) {
        return next(new ErrorHandler_1.default("Failed to create new category", 500));
    }
    // Send response
    res.status(201).json({
        success: true,
        data: newCategory,
    });
}));
/**
 * Updates a category by ID.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A JSON response indicating success or failure and the updated category data.
 */
exports.updateCategory = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, description, image, status } = req.body;
    // Name validation handled by mongoose
    // Description validation
    if (description) {
        if (!validator_1.default.isLength(description, { min: 2, max: 500 })) {
            return next(new ErrorHandler_1.default("Description must be between 2 and 500 characters long", 400));
        }
    }
    // Image validation handled by mongoose
    // Status validation
    if (status) {
        if (typeof status !== "boolean") {
            return next(new ErrorHandler_1.default("Status must be a boolean value", 400));
        }
    }
    // Find category
    const category = yield category_model_1.default.findById(id);
    if (!category) {
        return next(new ErrorHandler_1.default("Category not found", 404));
    }
    // Update category
    category.name = name || category.name;
    category.description = description || category.description;
    category.image = image || category.image;
    category.status = typeof status === "boolean" ? status : category.status;
    const updatedCategory = yield category.save();
    if (!updatedCategory) {
        return next(new ErrorHandler_1.default("Failed to update category", 500));
    }
    // Send response
    res.status(200).json({
        success: true,
        data: updatedCategory,
    });
}));
/**
 * Deletes a category by ID.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A JSON response indicating success or failure.
 */
exports.deleteCategory = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // Find category
    const category = yield category_model_1.default.findById(id);
    if (!category) {
        return next(new ErrorHandler_1.default("Category not found", 404));
    }
    // Delete category
    const deletedCategory = yield category.deleteOne({ _id: id });
    if (!deletedCategory) {
        return next(new ErrorHandler_1.default("Failed to delete category", 500));
    }
    // Send response
    res.status(200).json({
        success: true,
        data: deletedCategory,
    });
}));
/**
 * Get all categories with optional search, pagination, and sorting.
 * @function
 * @async
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next function.
 * @returns {Promise<void>} - Promise that resolves with the response object.
 * @throws {ErrorHandler} - Throws an error if there is a query error or if the categories cannot be retrieved.
 */
exports.getAllCategories = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // check if search query exists
    const search = req.query.search;
    // check if populate query exists
    const shouldPopulate = req.query.populate === "true";
    // check if pagination query exists
    const page = req.query.page;
    const limit = req.query.limit;
    // check if sort query exists
    const sort = req.query.sort;
    // if search query exists
    let filters = {};
    let sortBy;
    if (search) {
        filters["$text"] = { $search: search };
    }
    if (page && limit) {
        filters["$and"] = [{ status: true }];
        sortBy = { createdAt: -1 };
    }
    if (sort) {
        if (sort === "name" || sort === "status") {
            sortBy = { [sort]: "ascending" };
        }
        else {
            sortBy = { [sort]: "descending" };
        }
    }
    // Get all categories
    let categories;
    if (shouldPopulate) {
        categories = yield category_model_1.default.find(filters)
            .sort(sortBy)
            .skip(Number(page) * Number(limit))
            .limit(Number(limit));
        const populatedData = categories.map((category) => __awaiter(void 0, void 0, void 0, function* () {
            const subcategories = yield subCategory_model_1.default.find({ category: category._id });
            return Object.assign(Object.assign({}, category.toObject()), { subcategories });
        }));
        categories = yield Promise.all(populatedData);
    }
    else {
        categories = yield category_model_1.default.find(filters)
            .sort(sortBy)
            .skip(Number(page) * Number(limit))
            .limit(Number(limit));
    }
    if (!categories) {
        return next(new ErrorHandler_1.default("Failed to get all categories", 500));
    }
    // Send response
    res.status(200).json({
        success: true,
        data: categories,
    });
}));
/**
 * Retrieves a category by its slug.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A JSON object containing the category data.
 * @throws {ErrorHandler} If the category is not found.
 */
exports.getCategory = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { slug } = req.params;
    const shouldPopulate = req.query.subcategories === "true";
    // Get category
    const category = yield category_model_1.default.findOne({ slug });
    if (!category) {
        return next(new ErrorHandler_1.default("Category not found", 404));
    }
    if (shouldPopulate) {
        yield category.populate("subcategories");
    }
    // Send response
    res.status(200).json({
        success: true,
        data: category,
    });
}));
