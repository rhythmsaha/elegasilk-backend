import express from "express";
import { Secret } from "jsonwebtoken";
import { authorizeAccessToken, authorizeAdminRole } from "../middlewares/auth";
import { createProduct, getProduct } from "../controllers/product.controller";

const adminSecret = process.env.ADMIN_ACCESS_TOKEN_JWT_SECRET as Secret;

const productRouter = express.Router();

productRouter.post("/create-new", authorizeAccessToken(adminSecret), createProduct);
productRouter.get("/:id", authorizeAccessToken(adminSecret), getProduct);

export default productRouter;
