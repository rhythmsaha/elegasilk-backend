import expressAsyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../../utils/ErrorHandler";
import Wishlist from "../../models/store/Wishlist.model";
import Product from "../../models/Product.model";
import mongoose from "mongoose";

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

export const getWishlist = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.customer?._id;

    if (!userId) {
        return next(new ErrorHandler("Please login to view wishlist", 401));
    }

    const wishlist = await Wishlist.findOne({ userId }).populate({
        path: "products",
        select: "name price discount images",
    });

    if (!wishlist) {
        return next(new ErrorHandler("Wishlist not found", 404));
    }

    res.status(200).json({
        success: true,
        data: wishlist,
    });
});

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
