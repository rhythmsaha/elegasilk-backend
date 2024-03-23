/**
 * Express router for the store routes.
 */

import express from "express";
import CollectionRouter from "./collection.routes";
import ProductRouter from "./products.routes";
import CustomerRouter from "./customer.routes";
import AddressRouter from "./address.routes";
import wishlistRouter from "./wishlist.routes";
import CartRouter from "./cart.routes";
import OrderRouter from "./orders.routes";
import RatingsRouter from "./ratings.routes";

const StoreRouter = express.Router();

StoreRouter.use("/user", CustomerRouter);
StoreRouter.use("/collections", CollectionRouter);
StoreRouter.use("/products", ProductRouter);
StoreRouter.use("/address", AddressRouter);
StoreRouter.use("/wishlist", wishlistRouter);
StoreRouter.use("/cart", CartRouter);
StoreRouter.use("/orders", OrderRouter);
StoreRouter.use("/ratings", RatingsRouter);

export default StoreRouter;
