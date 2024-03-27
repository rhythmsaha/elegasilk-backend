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
exports.getCollection = exports.getAllCollections = exports.deleteCollection = exports.updateCollection = exports.createCollection = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const validator_1 = __importDefault(require("validator"));
const ErrorHandler_1 = __importDefault(require("../../utils/ErrorHandler"));
const collection_model_1 = __importDefault(require("../../models/collection.model"));
/**
 * Create a new collection
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction object
 * @returns Promise<void>
 */
exports.createCollection = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, image, status } = req.body;
    // Name validation handled by mongoose
    // Description validation handled by mongoose
    // Image validation handled by mongoose
    // check if status passed in body and if it is a boolean value
    if (status) {
        if (typeof status !== "boolean") {
            return next(new ErrorHandler_1.default("Status must be a boolean value", 400));
        }
    }
    // Create new collection
    const newCollection = yield collection_model_1.default.create({
        name,
        description,
        image,
        status,
    });
    if (!newCollection) {
        return next(new ErrorHandler_1.default("Failed to create new collection", 500));
    }
    // Send response
    res.status(201).json({
        success: true,
        data: newCollection,
    });
}));
/**
 * Updates a collection by ID.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A JSON response indicating success and the updated collection data.
 */
exports.updateCollection = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, description, image, status, subCategory } = req.body;
    // Name validation handled by mongoose
    // Description validation handled by mongoose
    // Image validation handled by mongoose
    // check if status passed in body and if it is a boolean value
    if (status) {
        if (typeof status !== "boolean") {
            return next(new ErrorHandler_1.default("Status must be a boolean value", 400));
        }
    }
    // check if subCategory passed in body and if it is a valid mongo id
    if (subCategory) {
        if (!validator_1.default.isMongoId(subCategory)) {
            return next(new ErrorHandler_1.default("Please provide a valid sub category id", 400));
        }
    }
    // Find collection by id and update
    const updatedCollection = yield collection_model_1.default.findByIdAndUpdate(id, {
        name,
        description,
        image,
        status,
        subCategory,
    }, {
        new: true,
        runValidators: true,
    });
    if (!updatedCollection) {
        return next(new ErrorHandler_1.default("Failed to update collection", 500));
    }
    // Send response
    res.status(200).json({
        success: true,
        data: updatedCollection,
    });
}));
/**
 * Deletes a collection by ID.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A JSON response indicating success and the deleted collection data.
 * @throws {ErrorHandler} If the collection fails to delete.
 */
exports.deleteCollection = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // Find collection by id and delete
    const deletedCollection = yield collection_model_1.default.findByIdAndDelete(id);
    if (!deletedCollection) {
        return next(new ErrorHandler_1.default("Failed to delete collection", 500));
    }
    // Send response
    res.status(200).json({
        success: true,
        data: deletedCollection,
    });
}));
/**
 * Retrieves all collections based on the provided search, pagination, sort, and subcategory queries.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A JSON response containing the collections data.
 */
exports.getAllCollections = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const sortBy = req.query.sortby || "name"; //Get  sort by propery
    const sortOrder = req.query.sortorder || "asc"; // Get sort order Query
    // check if sortby query exists and its value is valid
    if (sortBy && sortBy !== "name" && sortBy !== "createdAt" && sortBy !== "updatedAt" && sortBy !== "status")
        return next(new ErrorHandler_1.default("Invalid sort by property", 400));
    const search = req.query.search; // Get search query - {search collections by name}
    const status = req.query.status; // Get status query - {filter collections by status}
    const page = req.query.page || 1; // Get page query - {page number}
    const pageSize = req.query.pageSize || 5; // Get page size query - {number of results per page}
    let startFrom = 0; // Calculate skip value
    let endAt = 5; // Calculate limit value
    // Define query objects
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
    // if status query exists - update filters object
    if (status) {
        if (status === "true")
            filters["status"] = true;
        else if (status === "false")
            filters["status"] = false;
        else
            return next(new ErrorHandler_1.default("Invalid status value", 400));
    }
    // if page query exists - update skip value
    if (page)
        startFrom = (Number(page) - 1) * Number(pageSize);
    if (pageSize)
        endAt = Number(pageSize);
    if (filters) {
        pipeline.push({ $match: filters });
    }
    const stopPagination = req.query.stopPagination;
    if (stopPagination === "true") {
        pipeline.push({
            $facet: {
                collections: [{ $sort: sortCondition }],
                totalCount: [{ $count: "total" }],
            },
        });
    }
    else {
        pipeline.push({
            $facet: {
                collections: [{ $sort: sortCondition }, { $skip: startFrom }, { $limit: endAt }],
                totalCount: [{ $count: "total" }],
            },
        });
    }
    const collections = yield collection_model_1.default.aggregate(pipeline);
    if (!collections) {
        return next(new ErrorHandler_1.default("Failed to get all collections", 500));
    }
    const total = collections[0].totalCount.length > 0 ? collections[0].totalCount[0].total : 0;
    const _collections = collections[0].collections;
    const maxPage = Math.ceil(total / Number(pageSize));
    let currentPage = Number(page);
    if (maxPage < currentPage)
        currentPage = 1;
    // Send response
    res.status(200).json({
        success: true,
        total: total,
        currentPage: currentPage,
        maxPage: maxPage,
        data: _collections,
    });
}));
/**
 * Retrieves a collection by its ID and populates its subCategory field with name and slug.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A JSON response with the collection data.
 * @throws {ErrorHandler} If the collection cannot be found.
 */
exports.getCollection = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // Find collection by id
    const collection = yield collection_model_1.default.findById(id);
    if (!collection) {
        return next(new ErrorHandler_1.default("Failed to get collection", 500));
    }
    // Send response
    res.status(200).json({
        success: true,
        data: collection,
    });
}));
