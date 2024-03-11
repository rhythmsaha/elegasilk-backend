import express from "express";
import { Secret } from "jsonwebtoken";
import { authorizeAccessToken } from "../../middlewares/auth";
import { getProductFilters, getp } from "../../controllers/product.controller";

const productRouter = express.Router();

// StoreFront API
productRouter.get("/filters", getProductFilters);
productRouter.get("/testp", getp);

export default productRouter;
