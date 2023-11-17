import express from "express";
import { authorizeAccessToken, authorizeAdminRole } from "../middlewares/auth";
import { Secret } from "jsonwebtoken";
import {
    createSubCategory,
    deleteSubCategory,
    getAllSubCategories,
    getSubCategory,
    updateSubCategory,
} from "../controllers/subCategory.controller";

const adminSecret = process.env.ADMIN_ACCESS_TOKEN_JWT_SECRET as Secret;

const subCategoryRouter = express.Router();

// Create a new subcategory route (POST): /api/subcategory/create-new
subCategoryRouter.post(
    "/create-new",
    authorizeAccessToken(adminSecret),
    authorizeAdminRole("superadmin", "admin"),
    createSubCategory
);

// Update a subcategory route (PUT): /api/subcategory/
subCategoryRouter.put(
    "/",
    authorizeAccessToken(adminSecret),
    authorizeAdminRole("superadmin", "admin"),
    updateSubCategory
);

// Delete a subcategory route (DELETE): /api/subcategory/
subCategoryRouter.delete(
    "/",
    authorizeAccessToken(adminSecret),
    authorizeAdminRole("superadmin", "admin"),
    deleteSubCategory
);

// Get all subcategories route (GET): /api/subcategory/
subCategoryRouter.get("/", authorizeAccessToken, getAllSubCategories);

// Get a subcategory route (GET): /api/subcategory/:id
subCategoryRouter.get("/:id", authorizeAccessToken, getSubCategory);

// Export the router
export default subCategoryRouter;
