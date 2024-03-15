import express from "express";
import { getProductFilters } from "../../controllers/store/filter.controller";
import { getProduct, getProductsForStoreFront, getProductsPaths } from "../../controllers/store/product.controller";

const ProductRouter = express.Router();

// StoreFront API
ProductRouter.get("/paths", getProductsPaths);
ProductRouter.get("/filters", getProductFilters);
ProductRouter.get("/:slug", getProduct);
ProductRouter.get("/", getProductsForStoreFront);

export default ProductRouter;
