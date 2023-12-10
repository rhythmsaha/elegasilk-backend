import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import validator from "validator";
import SubCategory, { ISubCategory } from "../models/subCategory.model";
import { FilterQuery, SortOrder } from "mongoose";
import Category from "../models/category.model";

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
export const createSubCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { name, description, image, status, category } = req.body;

    if (!category) {
        return next(new ErrorHandler("Please provide a category id", 400));
    }

    // Name validation handled by mongoose
    // Description validation handled by mongoose
    // Image validation handled by mongoose

    // Status validation
    if (status) {
        if (typeof status !== "boolean") {
            return next(new ErrorHandler("Status must be a boolean value", 400));
        }
    }

    // Category validation
    if (category) {
        if (!validator.isMongoId(category)) {
            return next(new ErrorHandler("Please provide a valid category id", 400));
        }
    }

    // Create new sub category
    const newSubCategory = await SubCategory.create({
        name,
        description,
        image,
        status,
        category,
    });

    if (!newSubCategory) {
        return next(new ErrorHandler("Failed to create new sub category", 500));
    }

    // add relation to category

    await Category.findByIdAndUpdate(category, {
        $push: { subcategories: newSubCategory._id },
    });

    // Send response
    res.status(201).json({
        success: true,
        data: newSubCategory,
    });
});

/**
 * Update a subcategory by ID
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction object
 * @returns Promise<void>
 */
export const updateSubCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { name, description, image, status, category } = req.body;

    const data = {
        name,
        description,
        image,
        status,
    } as any;

    // Name validation handled by mongoose

    // Description validation handled by mongoose

    // Image validation handled by mongoose

    // Status validation
    if (status) {
        if (typeof status !== "boolean") {
            return next(new ErrorHandler("Status must be a boolean value", 400));
        }
    }

    // Category validation
    if (category) {
        if (!validator.isMongoId(category)) {
            return next(new ErrorHandler("Please provide a valid category id", 400));
        }

        data.category = category;
    }

    // Update sub category
    const updatedSubCategory = await SubCategory.findByIdAndUpdate(id, { ...data }, { new: true });

    if (!updatedSubCategory) {
        return next(new ErrorHandler("Failed to update sub category", 500));
    }

    // Send response
    res.status(200).json({
        success: true,
        data: updatedSubCategory,
    });
});

/**
 * Deletes a sub category by ID.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A JSON response indicating success and the deleted sub category data.
 */
export const deleteSubCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Delete sub category
    const deletedSubCategory = await SubCategory.findByIdAndDelete(id);

    if (!deletedSubCategory) {
        return next(new ErrorHandler("Failed to delete sub category", 500));
    }

    // Send response
    res.status(200).json({
        success: true,
        data: deletedSubCategory,
    });
});

/**
 * Get all sub categories
 * @route GET /api/v1/sub-categories
 * @param req - The request object
 * @param res - The response object
 * @param next - The next middleware function
 * @returns Returns a JSON response containing an array of sub categories
 * @throws {ErrorHandler} Will throw an error if failed to get all sub categories
 */
export const getAllSubCategories = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // check if search query exists
    const search = req.query.search as string;

    // check if pagination query exists
    const page = req.query.page as string;
    const limit = req.query.limit as string;

    // check if sort query exists
    const sort = req.query.sort as ("name" | "createdAt" | "updatedAt" | "status") | undefined;

    // check if category query exists
    const category = req.query.category as string;

    // if search query exists
    let filters = {} as FilterQuery<ISubCategory>;
    let sortBy: string | { [key: string]: SortOrder | { $meta: any } } | [string, SortOrder][] | null | undefined;
    let populate: any = {};

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
        } else {
            sortBy = { [sort]: "descending" };
        }
    }

    if (category) {
        filters["$and"] = [{ category: category }];
        populate = { path: "category", select: "name slug" };
    }

    // Get all sub categories
    const subCategories = await SubCategory.find(filters)
        .sort(sortBy)
        .populate([...populate])
        .skip(Number(page) * Number(limit))
        .limit(Number(limit));

    if (!subCategories) {
        return next(new ErrorHandler("Failed to get all sub categories", 500));
    }

    // Send response
    res.status(200).json({
        success: true,
        data: subCategories,
    });
});

/**
 * Retrieves a subcategory by ID and populates its category field with name and slug.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A JSON response with the subcategory data.
 * @throws {ErrorHandler} If the subcategory cannot be found.
 */
export const getSubCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Get sub category
    const subCategory = await SubCategory.findById(id).populate("category", "name slug");

    if (!subCategory) {
        return next(new ErrorHandler("Failed to get sub category", 500));
    }

    // Send response
    res.status(200).json({
        success: true,
        data: subCategory,
    });
});
