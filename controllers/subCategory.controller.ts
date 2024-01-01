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
    // check if category query exists
    const category = req.query.category as string;

    const findCategory = await Category.findOne({ slug: category });

    if (!findCategory) {
        return next(new ErrorHandler("Please provide a valid category", 400));
    }

    // if search query exists
    let filters = {} as FilterQuery<ISubCategory>;
    let populate: any = {};

    if (category) {
        filters["category"] = findCategory._id;
        populate = { path: "category", select: "name slug" };
    }

    // Get all sub categories
    const subCategories = await SubCategory.find(filters).populate({ ...populate });

    if (!subCategories) {
        return next(new ErrorHandler("Failed to get all sub categories", 500));
    }

    // Send response
    res.status(200).json({
        success: true,
        category: {
            name: findCategory.name,
            slug: findCategory.slug,
        },
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

const insertSubCategory = async (subCategory: ISubCategory) => {
    const subs = [
        { name: "Andhra and Telegana", slug: "andhra-telegana", description: "Andhra and Telegana sarees showcase traditional weaving techniques and patterns from the region.", status: true, category: "6593112d441a1a934e178a87" },
        { name: "Assam", slug: "assam", description: "Assam sarees are known for their rich silk and intricate weaving, often featuring traditional motifs.", status: true, category: "6593112d441a1a934e178a87" },
        { name: "Bagh", slug: "bagh", description: "Bagh sarees are adorned with traditional hand-block printing techniques, creating vibrant and colorful patterns.", status: true, category: "6593112d441a1a934e178a87" },
        { name: "Bagru", slug: "bagru", description: "Bagru sarees feature unique hand-block printing from the Bagru region, known for its distinct patterns and motifs.", status: true, category: "6593112d441a1a934e178a87" },
        { name: "Banaras", slug: "banaras", description: "Banaras sarees, also known as Benarasi sarees, are made in Varanasi and are famous for their luxurious silk and intricate zari work.", status: true, category: "6593112d441a1a934e178a87" },
        { name: "Bengal", slug: "bengal", description: "Bengal sarees showcase the rich weaving traditions of West Bengal, often featuring delicate embroidery and vibrant colors.", status: true, category: "6593112d441a1a934e178a87" },
        {
            name: "Bhagalpur",
            slug: "bhagalpur",
            description: "Bhagalpur sarees, also known as Tussar silk sarees, are handwoven in Bhagalpur, Bihar, and are known for their natural sheen and texture.",
            status: true,
            category: "6593112d441a1a934e178a87",
        },
        { name: "Chanderi", slug: "chanderi", description: "Chanderi sarees are made in Chanderi, Madhya Pradesh, and are known for their sheer texture, lightweight feel, and traditional motifs.", status: true, category: "6593112d441a1a934e178a87" },
        { name: "Chattisgarh", slug: "chattisgarh", description: "Chattisgarh sarees showcase the traditional weaving techniques of the region, often featuring unique patterns and designs.", status: true, category: "6593112d441a1a934e178a87" },
        { name: "Contemporary", slug: "contemporary", description: "Contemporary sarees feature modern designs and patterns, blending traditional techniques with contemporary aesthetics.", status: true, category: "6593112d441a1a934e178a87" },
        { name: "Gujarat", slug: "gujarat", description: "Gujarat sarees, including Patola sarees, showcase vibrant colors and intricate weaving techniques, often with geometric patterns.", status: true, category: "6593112d441a1a934e178a87" },
        { name: "Ikat", slug: "ikat", description: "Ikat sarees showcase a distinctive dyeing technique where the yarns are tie-dyed before weaving, creating bold and blurred patterns.", status: true, category: "6593112d441a1a934e178a87" },
        {
            name: "Kanjivaram",
            slug: "kanjivaram",
            description: "Kanjivaram sarees, from Kanchipuram, Tamil Nadu, are known for their luxurious silk and intricate zari work, often featuring temple-inspired motifs.",
            status: true,
            category: "6593112d441a1a934e178a87",
        },
        { name: "Lucknow", slug: "lucknow", description: "Lucknow sarees, also known as Lucknawi sarees, showcase the traditional Chikankari embroidery from Lucknow, Uttar Pradesh.", status: true, category: "6593112d441a1a934e178a87" },
        {
            name: "Machilipatnam",
            slug: "machilipatnam",
            description: "Machilipatnam sarees, also known as Kalamkari sarees, feature hand-painted or block-printed designs inspired by traditional Indian art.",
            status: true,
            category: "6593112d441a1a934e178a87",
        },
        {
            name: "Madhya Pradesh",
            slug: "madhya-pradesh",
            description: "Madhya Pradesh sarees showcase the diverse weaving traditions of the state, often featuring unique patterns and vibrant colors.",
            status: true,
            category: "6593112d441a1a934e178a87",
        },
        { name: "Maheshwar", slug: "maheshwar", description: "Maheshwar sarees are made in Maheshwar, Madhya Pradesh, and are known for their fine cotton or silk fabric and traditional motifs.", status: true, category: "6593112d441a1a934e178a87" },
        {
            name: "Mangalgiri",
            slug: "mangalgiri",
            description: "Mangalgiri sarees are handwoven in Mangalagiri, Andhra Pradesh, and are known for their distinctive zari borders and vibrant colors.",
            status: true,
            category: "6593112d441a1a934e178a87",
        },
        {
            name: "Murshidabad",
            slug: "murshidabad",
            description: "Murshidabad sarees showcase the traditional weaving techniques of Murshidabad, West Bengal, often featuring intricate patterns and vibrant colors.",
            status: true,
            category: "6593112d441a1a934e178a87",
        },
        { name: "Narayanpet", slug: "narayanpet", description: "Narayanpet sarees are handwoven in Narayanpet, Telangana, known for their distinctive checks pattern and vibrant colors.", status: true, category: "6593112d441a1a934e178a87" },
        { name: "Odisha", slug: "odisha", description: "Odisha sarees, including Sambalpuri sarees, showcase the traditional weaving techniques and ikat patterns of Odisha.", status: true, category: "6593112d441a1a934e178a87" },
        { name: "Paithani", slug: "paithani", description: "Paithani sarees are handwoven silk sarees known for their rich zari work and colorful peacock and flower motifs.", status: true, category: "6593112d441a1a934e178a87" },
        { name: "Pochampalli", slug: "pochampalli", description: "Pochampalli sarees showcase the unique ikat weaving technique of Pochampalli, Telangana, often featuring geometric patterns.", status: true, category: "6593112d441a1a934e178a87" },
        { name: "Rajasthan", slug: "rajasthan", description: "Rajasthan sarees showcase the vibrant colors and traditional patterns of the state, often with mirror and thread work.", status: true, category: "6593112d441a1a934e178a87" },
        { name: "Rajkot", slug: "rajkot", description: "Rajkot sarees, also known as Bandhani sarees, feature tie-dyeing techniques, creating intricate and vibrant patterns.", status: true, category: "6593112d441a1a934e178a87" },
        { name: "South", slug: "south", description: "South Indian sarees showcase the diverse weaving traditions of Southern India, often featuring temple-inspired motifs and vibrant colors.", status: true, category: "6593112d441a1a934e178a87" },
        {
            name: "Srikalahasti",
            slug: "srikalahasti",
            description: "Srikalahasti sarees showcase the traditional Kalamkari art from Srikalahasti, Andhra Pradesh, often featuring mythological and nature-inspired themes.",
            status: true,
            category: "6593112d441a1a934e178a87",
        },
        { name: "Ujjain", slug: "ujjain", description: "Ujjain sarees showcase the traditional weaving techniques of Ujjain, Madhya Pradesh, often featuring unique patterns and vibrant colors.", status: true, category: "6593112d441a1a934e178a87" },
        { name: "Uppada", slug: "uppada", description: "Uppada sarees are handwoven in Uppada, Andhra Pradesh, known for their fine silk and cotton mix and intricate zari borders.", status: true, category: "6593112d441a1a934e178a87" },
    ];

    const subCategories = await SubCategory.insertMany(subs);
    console.log(subCategories.length);
};
