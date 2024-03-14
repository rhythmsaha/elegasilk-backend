import express from "express";
import { getProductFilters } from "../../controllers/admin/product.controller";
import { getProductsForStoreFront } from "../../controllers/store/product.controller";

const productRouter = express.Router();

// StoreFront API
productRouter.get("/filters", getProductFilters);
productRouter.get("/", getProductsForStoreFront);

export default productRouter;
