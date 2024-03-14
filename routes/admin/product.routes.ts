import express from "express";
import { Secret } from "jsonwebtoken";
import { authorizeAccessToken, authorizeAdminRole } from "../../middlewares/auth";
import {
    createProduct,
    deleteProduct,
    getAllProducts,
    getProduct,
    updateProduct,
} from "../../controllers/admin/product.controller";

const adminSecret = process.env.ADMIN_ACCESS_TOKEN_JWT_SECRET as Secret;

const productRouter = express.Router();

// Admin API
productRouter.post(
    "/create-new",
    authorizeAccessToken(adminSecret),
    authorizeAdminRole("superadmin", "admin"),
    createProduct
);

productRouter.put(
    "/:id",
    authorizeAccessToken(adminSecret),
    authorizeAdminRole("superadmin", "admin"),
    updateProduct
);
productRouter.delete(
    "/:id",
    authorizeAccessToken(adminSecret),
    authorizeAdminRole("superadmin", "admin"),
    deleteProduct
);

productRouter.get(
    "/:id",
    authorizeAccessToken(adminSecret),
    authorizeAdminRole("superadmin", "admin", "moderator"),
    getProduct
);

productRouter.get(
    "/",
    authorizeAccessToken(adminSecret),
    authorizeAdminRole("superadmin", "admin", "moderator"),
    getAllProducts
);

export default productRouter;
