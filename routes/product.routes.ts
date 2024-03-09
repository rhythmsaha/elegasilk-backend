import express from "express";
import { Secret } from "jsonwebtoken";
import { authorizeAccessToken, authorizeAdminRole } from "../middlewares/auth";
import {
    createProduct,
    deleteProduct,
    getAllProducts,
    getProduct,
    getProductFilters,
    getp,
    updateProduct,
} from "../controllers/product.controller";

const adminSecret = process.env.ADMIN_ACCESS_TOKEN_JWT_SECRET as Secret;

const productRouter = express.Router();

// StoreFront API
productRouter.get("/filters", getProductFilters);
productRouter.get("/testp", getp);

// Admin API
productRouter.post(
    "/create-new",
    authorizeAccessToken(adminSecret),
    createProduct
);
productRouter.get("/:id", authorizeAccessToken(adminSecret), getProduct);
productRouter.put("/:id", authorizeAccessToken(adminSecret), updateProduct);
productRouter.get("/", authorizeAccessToken(adminSecret), getAllProducts);
productRouter.delete("/:id", authorizeAccessToken(adminSecret), deleteProduct);

export default productRouter;
