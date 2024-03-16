import expressAsyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../../utils/ErrorHandler";
import Wishlist from "../../models/store/Wishlist.model";
import Product from "../../models/Product.model";

/**
 * Adds an item to the wishlist.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function.
 */
export const addItemToWishlist = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.body;
    const userId = req.customer?._id;

    if (!userId) {
        return next(new ErrorHandler("Please login to add product to wishlist", 401));
    }

    // check if product exists
    const product = await Product.findById(productId);

    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

    // check if wishlist exists
    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
        const newWishlist = await Wishlist.create({
            userId,
            products: [productId],
            total: 1,
        });

        if (!newWishlist) {
            return next(new ErrorHandler("Failed to add product to wishlist", 500));
        }

        res.status(201).json({
            success: true,
            message: "Product added to wishlist",
            data: newWishlist,
        });

        return;
    }

    const isProductInWishlist = wishlist.products.includes(productId);

    if (isProductInWishlist) {
        return next(new ErrorHandler("Product already in wishlist", 400));
    }

    wishlist.products.push(productId);

    wishlist.total = wishlist.products.length;

    const savewishlist = await wishlist.save();

    if (!savewishlist) {
        return next(new ErrorHandler("Failed to add product to wishlist", 500));
    }

    res.status(201).json({
        success: true,
        message: "Product added to wishlist",
        data: wishlist,
    });
});

/**
 * Retrieves the wishlist for a specific user.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns The wishlist for the user.
 */
export const getWishlist = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.customer?._id;

    if (!userId) {
        return next(new ErrorHandler("Please login to view wishlist", 401));
    }

    const wishlist = await Wishlist.findOne({ userId }).populate({
        path: "products",
        select: "name MRP discount images slug",
    });

    if (!wishlist) {
        const newWishlist = await Wishlist.create({
            userId,
            products: [],
            total: 0,
        });

        if (!newWishlist) {
            return next(new ErrorHandler("Failed to retrieve wishlist", 500));
        }

        res.status(200).json({
            success: true,
            data: newWishlist,
        });

        return next();
    }

    res.status(200).json({
        success: true,
        wishlist: wishlist,
    });
});

/**
 * Removes an item from the wishlist.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function.
 * @returns A JSON response indicating the success or failure of the operation.
 */
export const removeItemFromWishlist = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;
    const userId = req.customer?._id;

    if (!userId) {
        return next(new ErrorHandler("Please login to remove product from wishlist", 401));
    }

    if (!productId) {
        return next(new ErrorHandler("Product not found", 404));
    }

    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
        return next(new ErrorHandler("Wishlist not found", 404));
    }

    const isProductInWishlist = wishlist.products.map((product) => product.toString()).includes(productId);

    if (!isProductInWishlist) {
        return next(new ErrorHandler("Product not in wishlist", 400));
    }

    const index = wishlist.products.map((product) => product.toString()).indexOf(productId);

    wishlist.products.splice(index, 1);

    wishlist.total = wishlist.products.length;

    const savewishlist = await wishlist.save();

    if (!savewishlist) {
        return next(new ErrorHandler("Failed to remove product from wishlist", 500));
    }

    res.status(200).json({
        success: true,
        message: "Product removed from wishlist",
        data: wishlist,
    });
});

/**
 * Checks if a product is in the user's wishlist.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A JSON response indicating whether the product is in the wishlist.
 * @throws {ErrorHandler} If the user is not logged in or the product is not found.
 */
export const checkProductInWishlist = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;
    const userId = req.customer?._id;

    if (!userId) {
        return next(new ErrorHandler("Please login to check product in wishlist", 401));
    }

    if (!productId) {
        return next(new ErrorHandler("Product not found", 404));
    }

    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
        res.status(200).json({
            success: true,
            data: false,
        });

        return;
    }

    const isProductInWishlist = wishlist.products.map((product) => product.toString()).includes(productId);

    res.status(200).json({
        success: true,
        data: isProductInWishlist,
    });
});

/**
 * Clears the user's wishlist.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A JSON response indicating the success or failure of the operation.
 */
export const clearWishlist = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.customer?._id;

    if (!userId) {
        return next(new ErrorHandler("Please login to clear wishlist", 401));
    }

    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
        return next(new ErrorHandler("Wishlist not found", 404));
    }

    wishlist.products = [];
    wishlist.total = 0;

    const savewishlist = await wishlist.save();

    if (!savewishlist) {
        return next(new ErrorHandler("Failed to clear wishlist", 500));
    }

    res.status(200).json({
        success: true,
        message: "Wishlist cleared",
        data: wishlist,
    });
});
