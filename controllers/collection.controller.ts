import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import validator from "validator";
import ErrorHandler from "../utils/ErrorHandler";
import Collection, { ICollection } from "../models/collection.model";
import mongoose, { FilterQuery, PipelineStage, SortOrder } from "mongoose";
import { ISortOrder } from "../types/typings";

/**
 * Create a new collection
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction object
 * @returns Promise<void>
 */
export const createCollection = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { name, description, image, status } = req.body;

    // Name validation handled by mongoose
    // Description validation handled by mongoose
    // Image validation handled by mongoose

    // check if status passed in body and if it is a boolean value
    if (status) {
        if (typeof status !== "boolean") {
            return next(new ErrorHandler("Status must be a boolean value", 400));
        }
    }

    // Create new collection
    const newCollection = await Collection.create({
        name,
        description,
        image,
        status,
    });

    if (!newCollection) {
        return next(new ErrorHandler("Failed to create new collection", 500));
    }

    // Send response
    res.status(201).json({
        success: true,
        data: newCollection,
    });
});

/**
 * Updates a collection by ID.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A JSON response indicating success and the updated collection data.
 */
export const updateCollection = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { name, description, image, status, subCategory } = req.body;

    // Name validation handled by mongoose

    // Description validation handled by mongoose

    // Image validation handled by mongoose

    // check if status passed in body and if it is a boolean value
    if (status) {
        if (typeof status !== "boolean") {
            return next(new ErrorHandler("Status must be a boolean value", 400));
        }
    }

    // check if subCategory passed in body and if it is a valid mongo id
    if (subCategory) {
        if (!validator.isMongoId(subCategory)) {
            return next(new ErrorHandler("Please provide a valid sub category id", 400));
        }
    }

    // Find collection by id and update
    const updatedCollection = await Collection.findByIdAndUpdate(
        id,
        {
            name,
            description,
            image,
            status,
            subCategory,
        },
        {
            new: true,
            runValidators: true,
        }
    );

    if (!updatedCollection) {
        return next(new ErrorHandler("Failed to update collection", 500));
    }

    // Send response
    res.status(200).json({
        success: true,
        data: updatedCollection,
    });
});

/**
 * Deletes a collection by ID.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A JSON response indicating success and the deleted collection data.
 * @throws {ErrorHandler} If the collection fails to delete.
 */
export const deleteCollection = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Find collection by id and delete
    const deletedCollection = await Collection.findByIdAndDelete(id);

    if (!deletedCollection) {
        return next(new ErrorHandler("Failed to delete collection", 500));
    }

    // Send response
    res.status(200).json({
        success: true,
        data: deletedCollection,
    });
});

/**
 * Retrieves all collections based on the provided search, pagination, sort, and subcategory queries.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A JSON response containing the collections data.
 */
export const getAllCollections = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // check if populate query exists
    const populateSubCategory = req.query.populateSubCategory as string;
    const subCategory = req.query.subcategory as string; // Get sub category query - {filter collections by sub category}

    const sortBy = (req.query.sortby as "name" | "createdAt" | "updatedAt" | "status" | undefined) || "name"; //Get  sort by propery
    const sortOrder: ISortOrder = (req.query.sortorder as ISortOrder) || "asc"; // Get sort order Query

    // check if sortby query exists and its value is valid
    if (sortBy && sortBy !== "name" && sortBy !== "createdAt" && sortBy !== "updatedAt" && sortBy !== "status") return next(new ErrorHandler("Invalid sort by property", 400));

    const search = req.query.search as string; // Get search query - {search collections by name}

    const status = req.query.status as string; // Get status query - {filter collections by status}

    const page = (req.query.page as string) || 1; // Get page query - {page number}
    const pageSize = (req.query.pageSize as string) || 5; // Get page size query - {number of results per page}

    let startFrom = 0; // Calculate skip value
    let endAt = 5; // Calculate limit value

    // Define query objects
    let filters = {} as FilterQuery<ICollection>;
    let pipeline: PipelineStage[] = [];

    let sortCondition: Record<string, 1 | -1 | mongoose.Expression.Meta> = {};

    // update sortQuery object based on sort query
    if (sortBy) sortCondition[sortBy] = sortOrder === "asc" ? 1 : -1;

    // if search query exists update filters object
    if (search) {
        filters["name"] = { $regex: new RegExp(search, "i") };
    }

    // if status query exists - update filters object
    if (status) {
        if (status === "true") filters["status"] = true;
        else if (status === "false") filters["status"] = false;
        else return next(new ErrorHandler("Invalid status value", 400));
    }

    // if page query exists - update skip value
    if (page) startFrom = (Number(page) - 1) * Number(pageSize);
    if (pageSize) endAt = Number(pageSize);

    if (filters) {
        pipeline.push({ $match: filters });
    }

    const stopPagination = req.query.stopPagination as string;

    if (stopPagination === "true") {
        pipeline.push({
            $facet: {
                collections: [{ $sort: sortCondition }],
                totalCount: [{ $count: "total" }],
            },
        });
    } else {
        pipeline.push({
            $facet: {
                collections: [{ $sort: sortCondition }, { $skip: startFrom }, { $limit: endAt }],
                totalCount: [{ $count: "total" }],
            },
        });
    }

    const collections = await Collection.aggregate(pipeline);

    if (!collections) {
        return next(new ErrorHandler("Failed to get all collections", 500));
    }

    const total = collections[0].totalCount.length > 0 ? collections[0].totalCount[0].total : 0;
    const _collections = collections[0].collections;
    const maxPage = Math.ceil(total / Number(pageSize));
    let currentPage = Number(page);

    if (maxPage < currentPage) currentPage = 1;

    // Send response
    res.status(200).json({
        success: true,
        total: total,
        currentPage: currentPage,
        maxPage: maxPage,
        data: _collections,
    });
});

/**
 * Retrieves a collection by its ID and populates its subCategory field with name and slug.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A JSON response with the collection data.
 * @throws {ErrorHandler} If the collection cannot be found.
 */
export const getCollection = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Find collection by id
    const collection = await Collection.findById(id);

    if (!collection) {
        return next(new ErrorHandler("Failed to get collection", 500));
    }

    // Send response
    res.status(200).json({
        success: true,
        data: collection,
    });
});
