"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middlewares/auth");
const jwt_secret_1 = require("../../lib/jwt_secret");
const cart_contrller_1 = require("../../controllers/store/cart.contrller");
/**
 * Express router for handling cart-related routes.
 */
const CartRouter = express_1.default.Router();
/**
 * Route for adding an item to the cart.
 * Requires authorized access token.
 */
CartRouter.post("/add", (0, auth_1.authorizeAccessToken)(jwt_secret_1.CUSTOMER_JWT_SECRET, true), cart_contrller_1.addItemToCart);
/**
 * Route for decreasing the quantity of an item in the cart.
 * Requires authorized access token.
 */
CartRouter.post("/decrease", (0, auth_1.authorizeAccessToken)(jwt_secret_1.CUSTOMER_JWT_SECRET, true), cart_contrller_1.reduceQuantity);
/**
 * Route for removing an item from the cart.
 * Requires authorized access token.
 */
CartRouter.post("/remove", (0, auth_1.authorizeAccessToken)(jwt_secret_1.CUSTOMER_JWT_SECRET, true), cart_contrller_1.removeItemFromCart);
/**
 * Route for clearing the cart.
 * Requires authorized access token.
 */
CartRouter.delete("/clear", (0, auth_1.authorizeAccessToken)(jwt_secret_1.CUSTOMER_JWT_SECRET, true), cart_contrller_1.clearCart);
/**
 * Route for getting the cart.
 * Requires authorized access token.
 */
CartRouter.get("/", (0, auth_1.authorizeAccessToken)(jwt_secret_1.CUSTOMER_JWT_SECRET, true), cart_contrller_1.getCart);
exports.default = CartRouter;
