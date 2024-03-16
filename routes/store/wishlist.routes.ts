import express from "express";
import { authorizeAccessToken } from "../../middlewares/auth";
import { CUSTOMER_JWT_SECRET } from "../../lib/jwt_secret";
import {
    addItemToWishlist,
    checkProductInWishlist,
    clearWishlist,
    getWishlist,
    removeItemFromWishlist,
} from "../../controllers/store/wishlist.controller";

/**
 * Express router for managing wishlist routes.
 */
const wishlistRouter = express.Router();

/**
 * Route for adding an item to the wishlist.
 * Requires authorization with customer JWT secret.
 */
wishlistRouter.post("/add", authorizeAccessToken(CUSTOMER_JWT_SECRET, true), addItemToWishlist);

/**
 * Route for removing an item from the wishlist.
 * Requires authorization with customer JWT secret.
 * @param productId - The ID of the product to be removed from the wishlist.
 */
wishlistRouter.delete("/remove/:productId", authorizeAccessToken(CUSTOMER_JWT_SECRET, true), removeItemFromWishlist);

/**
 * Route for checking if a product is in the wishlist.
 * Requires authorization with customer JWT secret.
 * @param productId - The ID of the product to check in the wishlist.
 */
wishlistRouter.get("/:productId", authorizeAccessToken(CUSTOMER_JWT_SECRET, true), checkProductInWishlist);

/**
 * Route for getting the wishlist.
 * Requires authorization with customer JWT secret.
 */
wishlistRouter.get("/", authorizeAccessToken(CUSTOMER_JWT_SECRET, true), getWishlist);

/**
 * Route for clearing the wishlist.
 * Requires authorization with customer JWT secret.
 */
wishlistRouter.delete("/", authorizeAccessToken(CUSTOMER_JWT_SECRET, true), clearWishlist);

export default wishlistRouter;
