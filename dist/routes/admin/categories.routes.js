"use strict";
/**
 * Express router for managing categories.
 * @module categoriesRoute
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middlewares/auth");
const category_controller_1 = require("../../controllers/admin/category.controller");
const adminSecret = process.env.ADMIN_ACCESS_TOKEN_JWT_SECRET;
const categoryRouter = express_1.default.Router();
/**
 * Route for creating a new category.
 * @name POST /api/category/create-new
 * @function
 * @memberof module:categoriesRoute
 * @param {string} path - Express path
 * @param {function} middleware - Express middleware
 * @param {function} controller - Express controller
 */
categoryRouter.post("/create-new", (0, auth_1.authorizeAccessToken)(adminSecret), (0, auth_1.authorizeAdminRole)("superadmin", "admin"), category_controller_1.createCategory);
/**
 * Route for updating a category.
 * @name PUT /api/category/:id
 * @function
 * @memberof module:categoriesRoute
 * @param {string} path - Express path
 * @param {function} middleware - Express middleware
 * @param {function} controller - Express controller
 */
categoryRouter.put("/:id", (0, auth_1.authorizeAccessToken)(adminSecret), (0, auth_1.authorizeAdminRole)("superadmin", "admin"), category_controller_1.updateCategory);
/**
 * Route for deleting a category.
 * @name DELETE /api/category/
 * @function
 * @memberof module:categoriesRoute
 * @param {string} path - Express path
 * @param {function} middleware - Express middleware
 * @param {function} controller - Express controller
 */
categoryRouter.delete("/:id", (0, auth_1.authorizeAccessToken)(adminSecret), (0, auth_1.authorizeAdminRole)("superadmin", "admin"), category_controller_1.deleteCategory);
/**
 * Route for getting all categories.
 * @name GET /api/category/
 * @function
 * @memberof module:categoriesRoute
 * @param {string} path - Express path
 * @param {function} middleware - Express middleware
 * @param {function} controller - Express controller
 */
categoryRouter.get("/", (0, auth_1.authorizeAccessToken)(adminSecret), category_controller_1.getAllCategories);
/**
 * Route for getting a category by id.
 * @name GET /api/category/:id
 * @function
 * @memberof module:categoriesRoute
 * @param {string} path - Express path
 * @param {function} middleware - Express middleware
 * @param {function} controller - Express controller
 */
categoryRouter.get("/:slug", (0, auth_1.authorizeAccessToken)(adminSecret), category_controller_1.getCategory);
exports.default = categoryRouter;
