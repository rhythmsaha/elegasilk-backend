import { Request, Response, NextFunction } from "express";
import { ICategorySortOptions } from "../../types/typings";
import asyncHandler from "express-async-handler";
import CategoryService from "../../services/CategoryService";

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

    const category = await CategoryService.createCategory({ name, description, image, status });

    res.status(201).json({
        success: true,
        data: category,
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

    const updatedCategory = await CategoryService.updateCategory(id, { name, description, image, status });

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

    const deletedCategory = await CategoryService.deleteCategory(id);

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
    const search = req.query.search as string;
    const shouldPopulate = req.query.populate === "true";

    const page = req.query.page as string;
    const limit = req.query.limit as string;
    const sort = req.query.sort as ICategorySortOptions;

    if (shouldPopulate) {
        const categories = await CategoryService.getCategoriesWithSubcategories({
            search,
            page: Number(page),
            limit: Number(limit),
            sort,
        });

        res.status(200).json({
            success: true,
            data: categories,
        });
    } else {
        const categories = await CategoryService.getAllCategoriesWithFilter({
            search,
            page: Number(page),
            limit: Number(limit),
            sort,
        });

        res.status(200).json({
            success: true,
            data: categories,
        });
    }
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

    const category = await CategoryService.findCategoryBySlug(slug);

    if (shouldPopulate) {
        await category.populate("subcategories");
    }

    res.status(200).json({
        success: true,
        data: category,
    });
});
