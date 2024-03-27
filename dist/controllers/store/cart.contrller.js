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
exports.clearCart = exports.getCart = exports.removeItemFromCart = exports.reduceQuantity = exports.addItemToCart = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const ErrorHandler_1 = __importDefault(require("../../utils/ErrorHandler"));
const Product_model_1 = __importDefault(require("../../models/Product.model"));
const Cart_model_1 = __importDefault(require("../../models/store/Cart.model"));
/**
 * Adds an item to the cart for a logged-in user.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
exports.addItemToCart = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.customer) === null || _a === void 0 ? void 0 : _a._id;
    if (!userId)
        return next(new ErrorHandler_1.default("Please login to add item to cart", 401));
    const { productId, quantity } = req.body;
    // Check if product exists
    const product = yield Product_model_1.default.findById(productId);
    if (!product)
        return next(new ErrorHandler_1.default("Product not found", 404));
    // Check if product is in stock
    if (product.stock < quantity)
        return next(new ErrorHandler_1.default("Don't have enough stock left!", 400));
    // Check if Cart exists
    const cart = yield Cart_model_1.default.findOne({ userId });
    if (!cart) {
        const newCart = yield Cart_model_1.default.create({
            userId,
            products: [{ productId, quantity }],
        });
        if (!newCart)
            return next(new ErrorHandler_1.default("Failed to create cart", 500));
        const populatedCart = yield newCart.populate({
            path: "products.productId",
            select: "name MRP discount stock images slug",
            model: Product_model_1.default,
        });
        const calculatedCart = populatedCart.calculateTotal();
        res.status(200).json({ success: true, cart: calculatedCart });
        return;
    }
    // Check if product is already in cart
    const productIndex = cart.products.findIndex((item) => item.productId.toString() === productId);
    if (productIndex !== -1) {
        cart.products[productIndex].quantity += quantity;
    }
    else {
        cart.products.push({ productId, quantity });
    }
    yield cart.save();
    const _cart = yield cart.populate({
        path: "products.productId",
        select: "name MRP discount stock images slug",
        model: Product_model_1.default,
    });
    if (!_cart)
        return next(new ErrorHandler_1.default("Failed to populate cart", 500));
    const calculatedCart = _cart.calculateTotal();
    res.status(200).json({ success: true, cart: calculatedCart });
}));
/**
 * Reduces the quantity of a product in the user's cart.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next function.
 * @returns {Promise<void>} - A promise that resolves with the updated cart.
 * @throws {ErrorHandler} - If the user is not logged in, cart is not found, or product is not found in cart.
 */
exports.reduceQuantity = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const userId = (_b = req.customer) === null || _b === void 0 ? void 0 : _b._id;
    if (!userId)
        return next(new ErrorHandler_1.default("Please login to reduce quantity", 401));
    const { productId } = req.body;
    // Check if Cart exists
    const cart = yield Cart_model_1.default.findOne({ userId });
    if (!cart)
        return next(new ErrorHandler_1.default("Cart not found", 404));
    // Check if product is in cart
    const productIndex = cart.products.findIndex((item) => item.productId.toString() === productId);
    if (productIndex === -1)
        return next(new ErrorHandler_1.default("Product not found in cart", 404));
    if (cart.products[productIndex].quantity > 1) {
        cart.products[productIndex].quantity -= 1;
    }
    else {
        cart.products.splice(productIndex, 1);
    }
    yield cart.save();
    const _cart = yield cart.populate({
        path: "products.productId",
        select: "name MRP discount stock images slug",
        model: Product_model_1.default,
    });
    if (!_cart)
        return next(new ErrorHandler_1.default("Failed to populate cart", 500));
    const calculatedCart = _cart.calculateTotal();
    res.status(200).json({ success: true, cart: calculatedCart });
}));
/**
 * Removes an item from the cart.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next function.
 * @returns {Promise<void>}
 */
exports.removeItemFromCart = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const userId = (_c = req.customer) === null || _c === void 0 ? void 0 : _c._id;
    if (!userId)
        return next(new ErrorHandler_1.default("Please login to remove item from cart", 401));
    const { productId } = req.body;
    // Check if Cart exists
    const cart = yield Cart_model_1.default.findOne({ userId });
    if (!cart)
        return next(new ErrorHandler_1.default("Cart not found", 404));
    // Check if product is in cart
    const productIndex = cart.products.findIndex((item) => item.productId.toString() === productId);
    if (productIndex === -1)
        return next(new ErrorHandler_1.default("Product not found in cart", 404));
    cart.products.splice(productIndex, 1);
    yield cart.save();
    const _cart = yield cart.populate({
        path: "products.productId",
        select: "name MRP discount stock images slug",
        model: Product_model_1.default,
    });
    if (!_cart)
        return next(new ErrorHandler_1.default("Failed to populate cart", 500));
    const calculatedCart = _cart.calculateTotal();
    res.status(200).json({ success: true, cart: calculatedCart });
}));
/**
 * Retrieves the cart for the logged-in user.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} - A promise that resolves when the cart is retrieved.
 * @throws {ErrorHandler} - If the user is not logged in or the cart is not found.
 */
exports.getCart = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    const userId = (_d = req.customer) === null || _d === void 0 ? void 0 : _d._id;
    if (!userId)
        return next(new ErrorHandler_1.default("Please login to view cart", 401));
    // check if Cart exists
    const cart = (yield Cart_model_1.default.findOne({ userId }).populate({
        path: "products.productId",
        select: "name MRP discount stock images slug",
        model: Product_model_1.default,
    }));
    // If cart is not found, Create a new cart
    if (!cart) {
        const newCart = yield Cart_model_1.default.create({ userId, products: [] });
        if (!newCart)
            return next(new ErrorHandler_1.default("Failed to create cart", 500));
        const _cart = {
            _id: newCart._id,
            products: newCart.products,
            totalPrice: 0,
            totalQuantity: 0,
        };
        res.status(200).json({ success: true, cart: _cart });
        return;
    }
    const calculatedCart = cart.calculateTotal();
    if (!calculatedCart)
        return next(new ErrorHandler_1.default("Failed to calculate cart", 500));
    res.status(200).json({ success: true, cart: calculatedCart });
}));
/**
 * Clears the cart for the logged-in user.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
exports.clearCart = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    const userId = (_e = req.customer) === null || _e === void 0 ? void 0 : _e._id;
    if (!userId)
        return next(new ErrorHandler_1.default("Please login to clear cart", 401));
    const cart = yield Cart_model_1.default.findOne({ userId });
    if (!cart)
        return next(new ErrorHandler_1.default("Cart not found", 404));
    cart.products = [];
    // await cart.save();
    const _cart = cart.calculateTotal();
    res.status(200).json({ success: true, cart: _cart });
}));
