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
exports.getColor = exports.getColors = exports.deleteColor = exports.updateColor = exports.createColor = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const validator_1 = __importDefault(require("validator"));
const ErrorHandler_1 = __importDefault(require("../../utils/ErrorHandler"));
const color_model_1 = __importDefault(require("../../models/color.model"));
/**
 * Create a new color.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function.
 * @returns A JSON response indicating the success of creating a new color.
 */
exports.createColor = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, hex, status } = req.body;
    // Name validation handled by mongoose
    // check if hex passed in body and if it is a valid hex color
    if (hex) {
        if (!validator_1.default.isHexColor(hex)) {
            return next(new ErrorHandler_1.default("Please provide a valid hex color", 400));
        }
    }
    // check if status passed in body and if it is a boolean value
    if (status) {
        if (typeof status !== "boolean") {
            return next(new ErrorHandler_1.default("Status must be a boolean value", 400));
        }
    }
    // Create new color
    const newColor = yield color_model_1.default.create({
        name,
        hex,
        status,
    });
    if (!newColor) {
        return next(new ErrorHandler_1.default("Failed to create new color", 500));
    }
    // Send response
    res.status(201).json({
        success: true,
        data: newColor,
    });
}));
/**
 * Update a color by ID.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns The updated color object.
 */
exports.updateColor = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, hex, status } = req.body;
    // check if id passed in params and if it is a valid mongo id
    if (!validator_1.default.isMongoId(id)) {
        return next(new ErrorHandler_1.default("Please provide a valid color id", 400));
    }
    // check if name passed in body and if it is a valid name
    if (name) {
        if (!validator_1.default.isAlpha(name)) {
            return next(new ErrorHandler_1.default("Please provide a valid name", 400));
        }
    }
    // check if hex passed in body and if it is a valid hex color
    if (hex) {
        if (!validator_1.default.isHexColor(hex)) {
            return next(new ErrorHandler_1.default("Please provide a valid hex color", 400));
        }
    }
    // check if status passed in body and if it is a boolean value
    if (status) {
        if (typeof status !== "boolean") {
            return next(new ErrorHandler_1.default("Status must be a boolean value", 400));
        }
    }
    // Find color by id and update
    const color = yield color_model_1.default.findByIdAndUpdate(id, {
        name,
        hex,
        status,
    }, {
        new: true,
        runValidators: true,
    });
    if (!color) {
        return next(new ErrorHandler_1.default("Color not found", 404));
    }
    // Send response
    res.status(200).json({
        success: true,
        data: color,
    });
}));
/**
 * Deletes a color by its ID.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A JSON response indicating the success of the operation.
 */
exports.deleteColor = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // check if id passed in params and if it is a valid mongo id
    if (!validator_1.default.isMongoId(id)) {
        return next(new ErrorHandler_1.default("Please provide a valid color id", 400));
    }
    // Find color by id and delete
    const color = yield color_model_1.default.findByIdAndDelete(id);
    if (!color) {
        return next(new ErrorHandler_1.default("Color not found", 404));
    }
    // Send response
    res.status(200).json({
        success: true,
        data: {},
    });
}));
/**
 * Retrieves colors based on search, pagination, and sorting criteria.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function.
 * @returns A JSON response with the retrieved colors.
 */
exports.getColors = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // check if search query passed in query string
    const search = req.query.search;
    // check if pagination query passed in query string
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    // check if sort query passed in query string
    const sort = req.query.sort;
    // Define query objects
    let filters = {};
    let sortBy;
    // if search query exists
    if (search) {
        filters["$text"] = { $search: search };
    }
    // if pagination query exists
    if (page && limit) {
        filters["$and"] = [{ status: true }];
    }
    // if sort query exists
    if (sort) {
        if (sort === "name" || sort === "status") {
            sortBy = { [sort]: "ascending" };
        }
        else {
            sortBy = { [sort]: "descending" };
        }
    }
    else {
        sortBy = { createdAt: "descending" };
    }
    // Find all colors
    const colors = yield color_model_1.default.find();
    if (!colors) {
        return next(new ErrorHandler_1.default("Colors not found", 404));
    }
    // Send response
    res.status(200).json({
        success: true,
        data: colors,
    });
}));
/**
 * Get color by ID.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns The color object if found, or an error if not found.
 */
exports.getColor = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // check if id passed in params and if it is a valid mongo id
    if (!validator_1.default.isMongoId(id)) {
        return next(new ErrorHandler_1.default("Please provide a valid color id", 400));
    }
    // Find color by id
    const color = yield color_model_1.default.findById(id);
    if (!color) {
        return next(new ErrorHandler_1.default("Color not found", 404));
    }
    // Send response
    res.status(200).json({
        success: true,
        data: color,
    });
}));
