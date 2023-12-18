import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import validator from "validator";
import ErrorHandler from "../utils/ErrorHandler";
import { FilterQuery, SortOrder } from "mongoose";
import Color, { IColor } from "../models/color.model";

/**
 * Create a new color.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function.
 * @returns A JSON response indicating the success of creating a new color.
 */
export const createColor = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { name, hex, status } = req.body;

    // Name validation handled by mongoose

    // check if hex passed in body and if it is a valid hex color
    if (hex) {
        if (!validator.isHexColor(hex)) {
            return next(new ErrorHandler("Please provide a valid hex color", 400));
        }
    }

    // check if status passed in body and if it is a boolean value
    if (status) {
        if (typeof status !== "boolean") {
            return next(new ErrorHandler("Status must be a boolean value", 400));
        }
    }

    // Create new color
    const newColor = await Color.create({
        name,
        hex,
        status,
    });

    if (!newColor) {
        return next(new ErrorHandler("Failed to create new color", 500));
    }

    // Send response
    res.status(201).json({
        success: true,
        data: newColor,
    });
});

/**
 * Update a color by ID.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns The updated color object.
 */
export const updateColor = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { name, hex, status } = req.body;

    // check if id passed in params and if it is a valid mongo id
    if (!validator.isMongoId(id)) {
        return next(new ErrorHandler("Please provide a valid color id", 400));
    }

    // check if name passed in body and if it is a valid name
    if (name) {
        if (!validator.isAlpha(name)) {
            return next(new ErrorHandler("Please provide a valid name", 400));
        }
    }

    // check if hex passed in body and if it is a valid hex color
    if (hex) {
        if (!validator.isHexColor(hex)) {
            return next(new ErrorHandler("Please provide a valid hex color", 400));
        }
    }

    // check if status passed in body and if it is a boolean value
    if (status) {
        if (typeof status !== "boolean") {
            return next(new ErrorHandler("Status must be a boolean value", 400));
        }
    }

    // Find color by id and update
    const color = await Color.findByIdAndUpdate(
        id,
        {
            name,
            hex,
            status,
        },
        {
            new: true,
            runValidators: true,
        }
    );

    if (!color) {
        return next(new ErrorHandler("Color not found", 404));
    }

    // Send response
    res.status(200).json({
        success: true,
        data: color,
    });
});

/**
 * Deletes a color by its ID.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A JSON response indicating the success of the operation.
 */
export const deleteColor = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // check if id passed in params and if it is a valid mongo id
    if (!validator.isMongoId(id)) {
        return next(new ErrorHandler("Please provide a valid color id", 400));
    }

    // Find color by id and delete
    const color = await Color.findByIdAndDelete(id);

    if (!color) {
        return next(new ErrorHandler("Color not found", 404));
    }

    // Send response
    res.status(200).json({
        success: true,
        data: {},
    });
});

/**
 * Retrieves colors based on search, pagination, and sorting criteria.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function.
 * @returns A JSON response with the retrieved colors.
 */
export const getColors = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // check if search query passed in query string
    const search = req.query.search as string;

    // check if pagination query passed in query string
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    // check if sort query passed in query string
    const sort = req.query.sort as ("name" | "createdAt" | "updatedAt" | "status") | undefined;

    // Define query objects
    let filters = {} as FilterQuery<IColor>;
    let sortBy: string | { [key: string]: SortOrder | { $meta: any } } | [string, SortOrder][] | null | undefined;

    // if search query exists
    if (search) {
        filters["$text"] = { $search: search };
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

    // Find all colors
    const colors = await Color.find();

    if (!colors) {
        return next(new ErrorHandler("Colors not found", 404));
    }

    // Send response
    res.status(200).json({
        success: true,
        data: colors,
    });
});

/**
 * Get color by ID.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns The color object if found, or an error if not found.
 */
export const getColor = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // check if id passed in params and if it is a valid mongo id
    if (!validator.isMongoId(id)) {
        return next(new ErrorHandler("Please provide a valid color id", 400));
    }

    // Find color by id
    const color = await Color.findById(id);

    if (!color) {
        return next(new ErrorHandler("Color not found", 404));
    }

    // Send response
    res.status(200).json({
        success: true,
        data: color,
    });
});
