import asyncHandler from "express-async-handler";
import Category, { ICategory } from "../models/category.model";
import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import validator from "validator";
import { redis } from "../lib/redis";

// Create a new category
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

// Update a category
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
    category.status = status || category.status;

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

// Delete a category
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

// Get all categories
export const getAllCategories = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Get all categories
    const categories = await Category.find({});

    if (!categories) {
        return next(new ErrorHandler("Failed to get all categories", 500));
    }

    // Send response
    res.status(200).json({
        success: true,
        data: categories,
    });
});

// Get a category - with slug
export const getCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { slug } = req.params;

    // Get category
    const category = await Category.findOne({ slug });

    if (!category) {
        return next(new ErrorHandler("Category not found", 404));
    }

    // Send response
    res.status(200).json({
        success: true,
        data: category,
    });
});
