"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearWishlist = exports.checkProductInWishlist = exports.removeItemFromWishlist = exports.getWishlist = exports.addItemToWishlist = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const ErrorHandler_1 = __importDefault(require("../../utils/ErrorHandler"));
const Wishlist_model_1 = __importDefault(require("../../models/store/Wishlist.model"));
const Product_model_1 = __importDefault(require("../../models/Product.model"));
/**
 * Adds an item to the wishlist.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function.
 */
exports.addItemToWishlist = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { productId } = req.body;
    const userId = (_a = req.customer) === null || _a === void 0 ? void 0 : _a._id;
    if (!userId) {
        return next(new ErrorHandler_1.default("Please login to add product to wishlist", 401));
    }
    // check if product exists
    const product = yield Product_model_1.default.findById(productId);
    if (!product) {
        return next(new ErrorHandler_1.default("Product not found", 404));
    }
    // check if wishlist exists
    const wishlist = yield Wishlist_model_1.default.findOne({ userId });
    if (!wishlist) {
        const newWishlist = yield Wishlist_model_1.default.create({
            userId,
            products: [productId],
            total: 1,
        });
        if (!newWishlist) {
            return next(new ErrorHandler_1.default("Failed to add product to wishlist", 500));
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
        return next(new ErrorHandler_1.default("Product already in wishlist", 400));
    }
    wishlist.products.push(productId);
    wishlist.total = wishlist.products.length;
    const savewishlist = yield wishlist.save();
    if (!savewishlist) {
        return next(new ErrorHandler_1.default("Failed to add product to wishlist", 500));
    }
    res.status(201).json({
        success: true,
        message: "Product added to wishlist",
        data: wishlist,
    });
}));
/**
 * Retrieves the wishlist for a specific user.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns The wishlist for the user.
 */
exports.getWishlist = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const userId = (_b = req.customer) === null || _b === void 0 ? void 0 : _b._id;
    if (!userId) {
        return next(new ErrorHandler_1.default("Please login to view wishlist", 401));
    }
    const wishlist = yield Wishlist_model_1.default.findOne({ userId }).populate({
        path: "products",
        select: "name MRP discount images slug",
    });
    if (!wishlist) {
        const newWishlist = yield Wishlist_model_1.default.create({
            userId,
            products: [],
            total: 0,
        });
        if (!newWishlist) {
            return next(new ErrorHandler_1.default("Failed to retrieve wishlist", 500));
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
}));
/**
 * Removes an item from the wishlist.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function.
 * @returns A JSON response indicating the success or failure of the operation.
 */
exports.removeItemFromWishlist = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const { productId } = req.params;
    const userId = (_c = req.customer) === null || _c === void 0 ? void 0 : _c._id;
    if (!userId) {
        return next(new ErrorHandler_1.default("Please login to remove product from wishlist", 401));
    }
    if (!productId) {
        return next(new ErrorHandler_1.default("Product not found", 404));
    }
    const wishlist = yield Wishlist_model_1.default.findOne({ userId });
    if (!wishlist) {
        return next(new ErrorHandler_1.default("Wishlist not found", 404));
    }
    const isProductInWishlist = wishlist.products.map((product) => product.toString()).includes(productId);
    if (!isProductInWishlist) {
        return next(new ErrorHandler_1.default("Product not in wishlist", 400));
    }
    const index = wishlist.products.map((product) => product.toString()).indexOf(productId);
    wishlist.products.splice(index, 1);
    wishlist.total = wishlist.products.length;
    const savewishlist = yield wishlist.save();
    if (!savewishlist) {
        return next(new ErrorHandler_1.default("Failed to remove product from wishlist", 500));
    }
    res.status(200).json({
        success: true,
        message: "Product removed from wishlist",
        data: wishlist,
    });
}));
/**
 * Checks if a product is in the user's wishlist.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A JSON response indicating whether the product is in the wishlist.
 * @throws {ErrorHandler} If the user is not logged in or the product is not found.
 */
exports.checkProductInWishlist = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    const { productId } = req.params;
    const userId = (_d = req.customer) === null || _d === void 0 ? void 0 : _d._id;
    if (!userId) {
        return next(new ErrorHandler_1.default("Please login to check product in wishlist", 401));
    }
    if (!productId) {
        return next(new ErrorHandler_1.default("Product not found", 404));
    }
    const wishlist = yield Wishlist_model_1.default.findOne({ userId });
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
}));
/**
 * Clears the user's wishlist.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A JSON response indicating the success or failure of the operation.
 */
exports.clearWishlist = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    const userId = (_e = req.customer) === null || _e === void 0 ? void 0 : _e._id;
    if (!userId) {
        return next(new ErrorHandler_1.default("Please login to clear wishlist", 401));
    }
    const wishlist = yield Wishlist_model_1.default.findOne({ userId });
    if (!wishlist) {
        return next(new ErrorHandler_1.default("Wishlist not found", 404));
    }
    wishlist.products = [];
    wishlist.total = 0;
    const savewishlist = yield wishlist.save();
    if (!savewishlist) {
        return next(new ErrorHandler_1.default("Failed to clear wishlist", 500));
    }
    res.status(200).json({
        success: true,
        message: "Wishlist cleared",
        data: wishlist,
    });
}));
