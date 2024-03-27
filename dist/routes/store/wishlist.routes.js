"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middlewares/auth");
const jwt_secret_1 = require("../../lib/jwt_secret");
const wishlist_controller_1 = require("../../controllers/store/wishlist.controller");
/**
 * Express router for managing wishlist routes.
 */
const wishlistRouter = express_1.default.Router();
/**
 * Route for adding an item to the wishlist.
 * Requires authorization with customer JWT secret.
 */
wishlistRouter.post("/add", (0, auth_1.authorizeAccessToken)(jwt_secret_1.CUSTOMER_JWT_SECRET, true), wishlist_controller_1.addItemToWishlist);
/**
 * Route for removing an item from the wishlist.
 * Requires authorization with customer JWT secret.
 * @param productId - The ID of the product to be removed from the wishlist.
 */
wishlistRouter.delete("/remove/:productId", (0, auth_1.authorizeAccessToken)(jwt_secret_1.CUSTOMER_JWT_SECRET, true), wishlist_controller_1.removeItemFromWishlist);
/**
 * Route for checking if a product is in the wishlist.
 * Requires authorization with customer JWT secret.
 * @param productId - The ID of the product to check in the wishlist.
 */
wishlistRouter.get("/:productId", (0, auth_1.authorizeAccessToken)(jwt_secret_1.CUSTOMER_JWT_SECRET, true), wishlist_controller_1.checkProductInWishlist);
/**
 * Route for getting the wishlist.
 * Requires authorization with customer JWT secret.
 */
wishlistRouter.get("/", (0, auth_1.authorizeAccessToken)(jwt_secret_1.CUSTOMER_JWT_SECRET, true), wishlist_controller_1.getWishlist);
/**
 * Route for clearing the wishlist.
 * Requires authorization with customer JWT secret.
 */
wishlistRouter.delete("/", (0, auth_1.authorizeAccessToken)(jwt_secret_1.CUSTOMER_JWT_SECRET, true), wishlist_controller_1.clearWishlist);
exports.default = wishlistRouter;
