import asyncHandler from "express-async-handler";
import Category, { ICategory } from "../models/category.model";
import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import validator from "validator";
import { redis } from "../lib/redis";
import SubCategory from "../models/subCategory.model";

// Create a new sub category
export const createSubCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { name, description, image, status, category } = req.body;

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

    // Send response
    res.status(201).json({
        success: true,
        data: newSubCategory,
    });
});

// Update a sub category
export const updateSubCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { name, description, image, status, category } = req.body;

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

    // Update sub category
    const updatedSubCategory = await SubCategory.findByIdAndUpdate(
        id,
        {
            name,
            description,
            image,
            status,
            category,
        },
        { new: true }
    );

    if (!updatedSubCategory) {
        return next(new ErrorHandler("Failed to update sub category", 500));
    }

    // Send response
    res.status(200).json({
        success: true,
        data: updatedSubCategory,
    });
});

// Delete a sub category
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

// Get all sub categories
export const getAllSubCategories = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {});

// Get a single sub category
export const getSubCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {});

// Get all sub categories of a category
export const getAllSubCategoriesOfCategory = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {}
);
