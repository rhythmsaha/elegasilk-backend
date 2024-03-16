import express from "express";
import { authorizeAccessToken } from "../../middlewares/auth";
import { CUSTOMER_JWT_SECRET } from "../../lib/jwt_secret";
import {
    addItemToCart,
    clearCart,
    getCart,
    reduceQuantity,
    removeItemFromCart,
} from "../../controllers/store/cart.contrller";

/**
 * Express router for handling cart-related routes.
 */
const CartRouter = express.Router();

/**
 * Route for adding an item to the cart.
 * Requires authorized access token.
 */
CartRouter.post("/add", authorizeAccessToken(CUSTOMER_JWT_SECRET, true), addItemToCart);

/**
 * Route for decreasing the quantity of an item in the cart.
 * Requires authorized access token.
 */
CartRouter.post("/decrease", authorizeAccessToken(CUSTOMER_JWT_SECRET, true), reduceQuantity);

/**
 * Route for removing an item from the cart.
 * Requires authorized access token.
 */
CartRouter.post("/remove", authorizeAccessToken(CUSTOMER_JWT_SECRET, true), removeItemFromCart);

/**
 * Route for clearing the cart.
 * Requires authorized access token.
 */
CartRouter.delete("/clear", authorizeAccessToken(CUSTOMER_JWT_SECRET, true), clearCart);

/**
 * Route for getting the cart.
 * Requires authorized access token.
 */
CartRouter.get("/", authorizeAccessToken(CUSTOMER_JWT_SECRET, true), getCart);

export default CartRouter;
