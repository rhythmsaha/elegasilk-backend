"use strict";
/**
 * Express router for the store routes.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const collection_routes_1 = __importDefault(require("./collection.routes"));
const products_routes_1 = __importDefault(require("./products.routes"));
const customer_routes_1 = __importDefault(require("./customer.routes"));
const address_routes_1 = __importDefault(require("./address.routes"));
const wishlist_routes_1 = __importDefault(require("./wishlist.routes"));
const cart_routes_1 = __importDefault(require("./cart.routes"));
const orders_routes_1 = __importDefault(require("./orders.routes"));
const ratings_routes_1 = __importDefault(require("./ratings.routes"));
const StoreRouter = express_1.default.Router();
StoreRouter.use("/user", customer_routes_1.default);
StoreRouter.use("/collections", collection_routes_1.default);
StoreRouter.use("/products", products_routes_1.default);
StoreRouter.use("/address", address_routes_1.default);
StoreRouter.use("/wishlist", wishlist_routes_1.default);
StoreRouter.use("/cart", cart_routes_1.default);
StoreRouter.use("/orders", orders_routes_1.default);
StoreRouter.use("/ratings", ratings_routes_1.default);
exports.default = StoreRouter;
