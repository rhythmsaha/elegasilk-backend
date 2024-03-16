import express from "express";
import CollectionRouter from "./collection.routes";
import ProductRouter from "./products.routes";
import CustomerRouter from "./customer.routes";
import AddressRouter from "./address.routes";

const StoreRouter = express.Router();

StoreRouter.use("/user", CustomerRouter);
StoreRouter.use("/collections", CollectionRouter);
StoreRouter.use("/products", ProductRouter);
StoreRouter.use("/address", AddressRouter);

export default StoreRouter;
