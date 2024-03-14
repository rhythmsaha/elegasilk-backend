import express from "express";
import { getProductFilters } from "../../controllers/admin/product.controller";
import { getProductsForStoreFront } from "../../controllers/store/product.controller";

const ProductRouter = express.Router();

// StoreFront API
ProductRouter.get("/filters", getProductFilters);
ProductRouter.get("/", getProductsForStoreFront);

export default ProductRouter;
