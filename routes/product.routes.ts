import express from "express";
import { Secret } from "jsonwebtoken";
import { authorizeAccessToken, authorizeAdminRole } from "../middlewares/auth";
import { createProduct, getAllProducts, getProduct, updateProduct } from "../controllers/product.controller";

const adminSecret = process.env.ADMIN_ACCESS_TOKEN_JWT_SECRET as Secret;

const productRouter = express.Router();

productRouter.post("/create-new", authorizeAccessToken(adminSecret), createProduct);
productRouter.get("/:id", authorizeAccessToken(adminSecret), getProduct);
productRouter.put("/:id", authorizeAccessToken(adminSecret), updateProduct);
productRouter.get("/", authorizeAccessToken(adminSecret), getAllProducts);

export default productRouter;
