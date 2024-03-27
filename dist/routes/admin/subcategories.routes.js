"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middlewares/auth");
const subCategory_controller_1 = require("../../controllers/admin/subCategory.controller");
const adminSecret = process.env.ADMIN_ACCESS_TOKEN_JWT_SECRET;
const subCategoryRouter = express_1.default.Router();
// Create a new subcategory route (POST): /api/subcategory/create-new
subCategoryRouter.post("/create-new", (0, auth_1.authorizeAccessToken)(adminSecret), (0, auth_1.authorizeAdminRole)("superadmin", "admin"), subCategory_controller_1.createSubCategory);
// Update a subcategory route (PUT): /api/subcategory/
subCategoryRouter.put("/:id", (0, auth_1.authorizeAccessToken)(adminSecret), (0, auth_1.authorizeAdminRole)("superadmin", "admin"), subCategory_controller_1.updateSubCategory);
// Delete a subcategory route (DELETE): /api/subcategory/
subCategoryRouter.delete("/:id", (0, auth_1.authorizeAccessToken)(adminSecret), (0, auth_1.authorizeAdminRole)("superadmin", "admin"), subCategory_controller_1.deleteSubCategory);
// Get all subcategories route (GET): /api/subcategory/
subCategoryRouter.get("/", (0, auth_1.authorizeAccessToken)(adminSecret), (0, auth_1.authorizeAdminRole)("superadmin", "admin", "moderator"), subCategory_controller_1.getAllSubCategories);
// Get a subcategory route (GET): /api/subcategory/:id
subCategoryRouter.get("/:id", (0, auth_1.authorizeAccessToken)(adminSecret), (0, auth_1.authorizeAdminRole)("superadmin", "admin", "moderator"), subCategory_controller_1.getSubCategory);
// Export the router
exports.default = subCategoryRouter;
