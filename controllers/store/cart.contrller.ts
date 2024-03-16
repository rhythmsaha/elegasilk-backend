import expressAsyncHandler from "express-async-handler";
import ErrorHandler from "../../utils/ErrorHandler";
import Product, { IProduct } from "../../models/Product.model";
import Cart, { ICartSchema } from "../../models/store/Cart.model";

interface IPopulatedCartItem {
    productId: {
        name: string;
        MRP: number;
        discount?: number;
        stock: number;
    };
    quantity: number;
}

interface IPopulatedCart {
    userId: string;
    products: IPopulatedCartItem[];
    totalQuantity?: number;
    totalPrice?: number;
}

/**
 * Adds an item to the cart for a logged-in user.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
export const addItemToCart = expressAsyncHandler(async (req, res, next) => {
    const userId = req.customer?._id;
    if (!userId) return next(new ErrorHandler("Please login to add item to cart", 401));

    const { productId, quantity } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);

    if (!product) return next(new ErrorHandler("Product not found", 404));

    // Check if product is in stock
    if (product.stock < quantity) return next(new ErrorHandler("Don't have enough stock left!", 400));

    // Check if Cart exists
    const cart = await Cart.findOne({ userId });

    if (!cart) {
        const newCart = await Cart.create({
            userId,
            products: [{ productId, quantity }],
        });

        res.status(201).json({ success: true, cart: newCart });
        return;
    }

    // Check if product is already in cart
    const productIndex = cart.products.findIndex((item) => item.productId.toString() === productId);

    if (productIndex !== -1) {
        cart.products[productIndex].quantity += quantity;
    } else {
        cart.products.push({ productId, quantity });
    }

    await cart.save();

    res.status(200).json({ success: true, cart });
});

/**
 * Reduces the quantity of a product in the user's cart.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next function.
 * @returns {Promise<void>} - A promise that resolves with the updated cart.
 * @throws {ErrorHandler} - If the user is not logged in, cart is not found, or product is not found in cart.
 */
export const reduceQuantity = expressAsyncHandler(async (req, res, next) => {
    const userId = req.customer?._id;
    if (!userId) return next(new ErrorHandler("Please login to reduce quantity", 401));

    const { productId } = req.body;

    // Check if Cart exists
    const cart = await Cart.findOne({ userId });

    if (!cart) return next(new ErrorHandler("Cart not found", 404));

    // Check if product is in cart
    const productIndex = cart.products.findIndex((item) => item.productId.toString() === productId);

    if (productIndex === -1) return next(new ErrorHandler("Product not found in cart", 404));

    if (cart.products[productIndex].quantity > 1) {
        cart.products[productIndex].quantity -= 1;
    } else {
        cart.products.splice(productIndex, 1);
    }

    await cart.save();

    res.status(200).json({ success: true, cart });
});

/**
 * Removes an item from the cart.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next function.
 * @returns {Promise<void>}
 */
export const removeItemFromCart = expressAsyncHandler(async (req, res, next) => {
    const userId = req.customer?._id;
    if (!userId) return next(new ErrorHandler("Please login to remove item from cart", 401));

    const { productId } = req.body;

    // Check if Cart exists
    const cart = await Cart.findOne({ userId });

    if (!cart) return next(new ErrorHandler("Cart not found", 404));

    // Check if product is in cart
    const productIndex = cart.products.findIndex((item) => item.productId.toString() === productId);

    if (productIndex === -1) return next(new ErrorHandler("Product not found in cart", 404));

    cart.products.splice(productIndex, 1);

    await cart.save();

    res.status(200).json({ success: true, cart });
});

/**
 * Retrieves the cart for the logged-in user.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} - A promise that resolves when the cart is retrieved.
 * @throws {ErrorHandler} - If the user is not logged in or the cart is not found.
 */

export const getCart = expressAsyncHandler(async (req, res, next) => {
    const userId = req.customer?._id;
    if (!userId) return next(new ErrorHandler("Please login to view cart", 401));

    // check if Cart exists
    const cart = (await Cart.findOne({ userId }).populate({
        path: "products.productId",
        select: "name MRP discount stock",
        model: Product,
    })) as IPopulatedCart;

    // If cart is not found, Create a new cart

    if (!cart) {
        const newCart = await Cart.create({ userId, products: [] });

        if (!newCart) return next(new ErrorHandler("Failed to create cart", 500));

        newCart.totalPrice = 0;
        newCart.totalQuantity = 0;

        res.status(200).json({ success: true, cart: newCart });
        return;
    }

    // Remove products that are not in stock
    cart.products = cart.products.filter((item) => item.productId.stock > 0);

    // Calulate total price of each product based on their quantity
    cart.products.forEach((item) => {
        const discountPercent = item.productId.discount || 0;
        let discountAmount = item.productId.MRP * (discountPercent / 100);
        item.productId.MRP -= discountAmount;
        item.productId.MRP *= item.quantity;
        delete item.productId.discount;
    });

    // Calculate total price of the cart
    cart.totalPrice = cart.products.reduce((acc, item) => acc + item.productId.MRP, 0);

    // Count total quantity of products in the cart with reduce method
    cart.totalQuantity = cart.products.reduce((acc, item) => acc + item.quantity, 0);

    res.status(200).json({ success: true, cart });
});

/**
 * Clears the cart for the logged-in user.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
export const clearCart = expressAsyncHandler(async (req, res, next) => {
    const userId = req.customer?._id;
    if (!userId) return next(new ErrorHandler("Please login to clear cart", 401));

    const cart = await Cart.findOne({ userId });

    if (!cart) return next(new ErrorHandler("Cart not found", 404));

    cart.products = [];
    cart.totalPrice = 0;
    cart.totalQuantity = 0;

    await cart.save();
});
