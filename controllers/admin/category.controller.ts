import { Request, Response, NextFunction } from "express";
import { ICategorySortOptions } from "../../types/typings";
import asyncHandler from "express-async-handler";
import CategoryService from "../../services/CategoryService";

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
    const { name, description, image, status } = req.body;

    const category = await CategoryService.createCategory({ name, description, image, status });

    res.status(201).json({
        success: true,
        data: category,
    });
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, image, status } = req.body;

    const updatedCategory = await CategoryService.updateCategory(id, { name, description, image, status });

    // Send response
    res.status(200).json({
        success: true,
        data: updatedCategory,
    });
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const deletedCategory = await CategoryService.deleteCategory(id);

    res.status(200).json({
        success: true,
        data: deletedCategory,
    });
});

export const getAllCategories = asyncHandler(async (req: Request, res: Response) => {
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

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
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
