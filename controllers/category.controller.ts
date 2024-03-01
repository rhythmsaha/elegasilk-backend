import asyncHandler from "express-async-handler";
import Category, { ICategory } from "../models/category.model";
import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import validator from "validator";
import { FilterQuery, SortOrder } from "mongoose";
import SubCategory from "../models/subCategory.model";

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
export const createCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { name, description, image, status } = req.body;

    // Name validation handled by mongoose

    // Description validation
    if (description) {
        if (!validator.isLength(description, { min: 2, max: 500 })) {
            return next(new ErrorHandler("Description must be between 2 and 500 characters long", 400));
        }
    }

    // Image validation handled by mongoose

    // Status validation
    if (status) {
        if (typeof status !== "boolean") {
            return next(new ErrorHandler("Status must be a boolean value", 400));
        }
    }

    // Create new category
    const newCategory = await Category.create({
        name,
        description,
        image,
        status,
    });

    if (!newCategory) {
        return next(new ErrorHandler("Failed to create new category", 500));
    }

    // Send response
    res.status(201).json({
        success: true,
        data: newCategory,
    });
});

/**
 * Updates a category by ID.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A JSON response indicating success or failure and the updated category data.
 */
export const updateCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { name, description, image, status } = req.body;

    // Name validation handled by mongoose

    // Description validation
    if (description) {
        if (!validator.isLength(description, { min: 2, max: 500 })) {
            return next(new ErrorHandler("Description must be between 2 and 500 characters long", 400));
        }
    }

    // Image validation handled by mongoose

    // Status validation
    if (status) {
        if (typeof status !== "boolean") {
            return next(new ErrorHandler("Status must be a boolean value", 400));
        }
    }

    // Find category
    const category = await Category.findById(id);

    if (!category) {
        return next(new ErrorHandler("Category not found", 404));
    }

    // Update category
    category.name = name || category.name;
    category.description = description || category.description;
    category.image = image || category.image;
    category.status = typeof status === "boolean" ? status : category.status;

    const updatedCategory = await category.save();

    if (!updatedCategory) {
        return next(new ErrorHandler("Failed to update category", 500));
    }

    // Send response
    res.status(200).json({
        success: true,
        data: updatedCategory,
    });
});

/**
 * Deletes a category by ID.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A JSON response indicating success or failure.
 */
export const deleteCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Find category
    const category = await Category.findById(id);

    if (!category) {
        return next(new ErrorHandler("Category not found", 404));
    }

    // Delete category
    const deletedCategory = await category.deleteOne({ _id: id });

    if (!deletedCategory) {
        return next(new ErrorHandler("Failed to delete category", 500));
    }

    // Send response
    res.status(200).json({
        success: true,
        data: deletedCategory,
    });
});

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
export const getAllCategories = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // check if search query exists
    const search = req.query.search as string;

    // check if populate query exists
    const shouldPopulate = req.query.populate === "true";

    // check if pagination query exists
    const page = req.query.page as string;
    const limit = req.query.limit as string;

    // check if sort query exists
    const sort = req.query.sort as ("name" | "createdAt" | "updatedAt" | "status") | undefined;

    // if search query exists
    let filters = {} as FilterQuery<ICategory>;
    let sortBy: string | { [key: string]: SortOrder | { $meta: any } } | [string, SortOrder][] | null | undefined;

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

    // Get all categories

    let categories: ICategory[] | null;

    if (shouldPopulate) {
        categories = await Category.find(filters)
            .sort(sortBy)
            .skip(Number(page) * Number(limit))
            .limit(Number(limit));

        const populatedData = categories.map(async (category) => {
            console.log(category._id);
            const subcategories = await SubCategory.find({ category: category._id });
            return { ...category.toObject(), subcategories };
        });

        categories = await Promise.all(populatedData);
    } else {
        categories = await Category.find(filters)
            .sort(sortBy)
            .skip(Number(page) * Number(limit))
            .limit(Number(limit));
    }

    if (!categories) {
        return next(new ErrorHandler("Failed to get all categories", 500));
    }

    // Send response
    res.status(200).json({
        success: true,
        data: categories,
    });
});

/**
 * Retrieves a category by its slug.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A JSON object containing the category data.
 * @throws {ErrorHandler} If the category is not found.
 */
export const getCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { slug } = req.params;

    const shouldPopulate = req.query.subcategories === "true";

    // Get category
    const category = await Category.findOne({ slug });

    if (!category) {
        return next(new ErrorHandler("Category not found", 404));
    }
    if (shouldPopulate) {
        await category.populate("subcategories");
    }

    // Send response
    res.status(200).json({
        success: true,
        data: category,
    });
});
