import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import SubCategoryService from "../../services/SubCategoryService";
import CategoryService from "../../services/CategoryService";

export const createSubCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { name, description, image, status, category } = req.body;

    const subcategory = await SubCategoryService.create({
        name,
        description,
        image,
        status,
        category,
    });

    res.status(201).json({
        success: true,
        data: subcategory,
    });
});

export const updateSubCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { name, description, image, status, category } = req.body;

    const updatedSubCategory = await SubCategoryService.update(id, {
        name,
        description,
        image,
        status,
        category,
    });

    res.status(200).json({
        success: true,
        data: updatedSubCategory,
    });
});

export const deleteSubCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const deletedSubCategory = await SubCategoryService.delete(id);

    res.status(200).json({
        success: true,
        data: deletedSubCategory,
    });
});

export const getAllSubCategories = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const categoryId = req.query.category as string;

    const category = await CategoryService.findCategoryBySlug(categoryId);

    const subCategories = await SubCategoryService.getSubCategoriesByCategoryId(category._id);

    res.status(200).json({
        success: true,
        category: {
            name: category.name,
            slug: category.slug,
        },
        data: subCategories,
    });
});

export const getSubCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const subCategory = await SubCategoryService.getWithCategory(id);

    res.status(200).json({
        success: true,
        data: subCategory,
    });
});
