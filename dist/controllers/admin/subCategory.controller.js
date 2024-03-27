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
exports.getSubCategory = exports.getAllSubCategories = exports.deleteSubCategory = exports.updateSubCategory = exports.createSubCategory = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const ErrorHandler_1 = __importDefault(require("../../utils/ErrorHandler"));
const validator_1 = __importDefault(require("validator"));
const subCategory_model_1 = __importDefault(require("../../models/subCategory.model"));
const category_model_1 = __importDefault(require("../../models/category.model"));
/**
 * Creates a new subcategory.
 * @function
 * @async
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next function.
 * @returns {Promise<void>} - Promise that resolves with no value.
 * @throws {ErrorHandler} - Throws an error if there is a validation error or if the subcategory creation fails.
 */
exports.createSubCategory = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, image, status, category } = req.body;
    if (!category) {
        return next(new ErrorHandler_1.default("Please provide a category id", 400));
    }
    // Name validation handled by mongoose
    // Description validation handled by mongoose
    // Image validation handled by mongoose
    // Status validation
    if (status) {
        if (typeof status !== "boolean") {
            return next(new ErrorHandler_1.default("Status must be a boolean value", 400));
        }
    }
    // Category validation
    if (category) {
        if (!validator_1.default.isMongoId(category)) {
            return next(new ErrorHandler_1.default("Please provide a valid category id", 400));
        }
    }
    // Create new sub category
    const newSubCategory = yield subCategory_model_1.default.create({
        name,
        description,
        image,
        status,
        category,
    });
    if (!newSubCategory) {
        return next(new ErrorHandler_1.default("Failed to create new sub category", 500));
    }
    // Send response
    res.status(201).json({
        success: true,
        data: newSubCategory,
    });
}));
/**
 * Update a subcategory by ID
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction object
 * @returns Promise<void>
 */
exports.updateSubCategory = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, description, image, status, category } = req.body;
    const data = {
        name,
        description,
        image,
        status,
    };
    // Name validation handled by mongoose
    // Description validation handled by mongoose
    // Image validation handled by mongoose
    // Status validation
    if (status) {
        if (typeof status !== "boolean") {
            return next(new ErrorHandler_1.default("Status must be a boolean value", 400));
        }
    }
    // Category validation
    if (category) {
        if (!validator_1.default.isMongoId(category)) {
            return next(new ErrorHandler_1.default("Please provide a valid category id", 400));
        }
        data.category = category;
    }
    // Update sub category
    const updatedSubCategory = yield subCategory_model_1.default.findByIdAndUpdate(id, Object.assign({}, data), { new: true });
    if (!updatedSubCategory) {
        return next(new ErrorHandler_1.default("Failed to update sub category", 500));
    }
    // Send response
    res.status(200).json({
        success: true,
        data: updatedSubCategory,
    });
}));
/**
 * Deletes a sub category by ID.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A JSON response indicating success and the deleted sub category data.
 */
exports.deleteSubCategory = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // Delete sub category
    const deletedSubCategory = yield subCategory_model_1.default.findByIdAndDelete(id);
    if (!deletedSubCategory) {
        return next(new ErrorHandler_1.default("Failed to delete sub category", 500));
    }
    // Send response
    res.status(200).json({
        success: true,
        data: deletedSubCategory,
    });
}));
/**
 * Get all sub categories
 * @route GET /api/v1/sub-categories
 * @param req - The request object
 * @param res - The response object
 * @param next - The next middleware function
 * @returns Returns a JSON response containing an array of sub categories
 * @throws {ErrorHandler} Will throw an error if failed to get all sub categories
 */
exports.getAllSubCategories = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // check if category query exists
    const category = req.query.category;
    const findCategory = yield category_model_1.default.findOne({ slug: category });
    if (!findCategory) {
        return next(new ErrorHandler_1.default("Please provide a valid category", 400));
    }
    // if search query exists
    let filters = {};
    let populate = {};
    if (category) {
        filters["category"] = findCategory._id;
        populate = { path: "category", select: "name slug" };
    }
    // Get all sub categories
    const subCategories = yield subCategory_model_1.default.find(filters).populate(Object.assign({}, populate));
    if (!subCategories) {
        return next(new ErrorHandler_1.default("Failed to get all sub categories", 500));
    }
    // Send response
    res.status(200).json({
        success: true,
        category: {
            name: findCategory.name,
            slug: findCategory.slug,
        },
        data: subCategories,
    });
}));
/**
 * Retrieves a subcategory by ID and populates its category field with name and slug.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A JSON response with the subcategory data.
 * @throws {ErrorHandler} If the subcategory cannot be found.
 */
exports.getSubCategory = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // Get sub category
    const subCategory = yield subCategory_model_1.default.findById(id).populate("category", "name slug");
    if (!subCategory) {
        return next(new ErrorHandler_1.default("Failed to get sub category", 500));
    }
    // Send response
    res.status(200).json({
        success: true,
        data: subCategory,
    });
}));
