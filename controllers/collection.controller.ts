import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import validator from "validator";
import ErrorHandler from "../utils/ErrorHandler";
import Collection, { ICollection } from "../models/collection.model";
import { FilterQuery, SortOrder } from "mongoose";

//  Create a new collection
export const createCollection = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
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

    // Create new collection
    const newCollection = await Collection.create({
        name,
        description,
        image,
        status,
        subCategory,
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

// Update a collection
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

// Delete a collection
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

// Get all collections
export const getAllCollections = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // check if search query exists
    const search = req.query.search as string;

    // check if pagination query exists
    const page = req.query.page as string;
    const limit = req.query.limit as string;

    // check if sort query exists
    const sort = req.query.sort as ("name" | "createdAt" | "updatedAt" | "status") | undefined;

    //  Check if sub category query exists
    const subCategory = req.query.subCategory as string;

    // Define query objects
    let filters = {} as FilterQuery<ICollection>;
    let sortBy: string | { [key: string]: SortOrder | { $meta: any } } | [string, SortOrder][] | null | undefined;
    let populate: any = {};

    // if search query exists
    if (search) {
        filters["$text"] = { $search: search };
    }

    // if sub category query exists
    if (subCategory) {
        if (!validator.isMongoId(subCategory)) {
            return next(new ErrorHandler("Please provide a valid sub category id", 400));
        }

        filters["subCategory"] = subCategory;
    }

    // if pagination query exists
    if (page && limit) {
        filters["$and"] = [{ status: true }];
    }

    // if sort query exists
    if (sort) {
        if (sort === "name" || sort === "status") {
            sortBy = { [sort]: "ascending" };
        } else {
            sortBy = { [sort]: "descending" };
        }
    } else {
        sortBy = { createdAt: "descending" };
    }

    // if populate query exists
    if (page && limit) {
        populate = {
            path: "subCategory",
            select: "name slug",
        };
    }

    // Find all collections
    const collections = await Collection.find(filters, null, {
        sort: sortBy,
        populate: populate,
        skip: Number(page) * Number(limit),
        limit: Number(limit),
    });

    if (!collections) {
        return next(new ErrorHandler("Failed to get all collections", 500));
    }

    // Send response
    res.status(200).json({
        success: true,
        data: collections,
    });
});

// Get a single collection
export const getCollection = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Find collection by id
    const collection = await Collection.findById(id).populate({
        path: "subCategory",
        select: "name slug",
    });

    if (!collection) {
        return next(new ErrorHandler("Failed to get collection", 500));
    }

    // Send response
    res.status(200).json({
        success: true,
        data: collection,
    });
});
