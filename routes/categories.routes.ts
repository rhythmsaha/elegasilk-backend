/**
 * Express router for managing categories.
 * @module categoriesRoute
 */

import express from "express";
import { authorizeAccessToken, authorizeAdminRole } from "../middlewares/auth";
import { createCategory, deleteCategory, getAllCategories, getCategory, updateCategory } from "../controllers/category.controller";
import { Secret } from "jsonwebtoken";

const adminSecret = process.env.ADMIN_ACCESS_TOKEN_JWT_SECRET as Secret;

const categoryRouter = express.Router();

/**
 * Route for creating a new category.
 * @name POST /api/category/create-new
 * @function
 * @memberof module:categoriesRoute
 * @param {string} path - Express path
 * @param {function} middleware - Express middleware
 * @param {function} controller - Express controller
 */
categoryRouter.post("/create-new", authorizeAccessToken(adminSecret), authorizeAdminRole("superadmin", "admin"), createCategory);

/**
 * Route for updating a category.
 * @name PUT /api/category/:id
 * @function
 * @memberof module:categoriesRoute
 * @param {string} path - Express path
 * @param {function} middleware - Express middleware
 * @param {function} controller - Express controller
 */
categoryRouter.put("/:id", authorizeAccessToken(adminSecret), authorizeAdminRole("superadmin", "admin"), updateCategory);

/**
 * Route for deleting a category.
 * @name DELETE /api/category/
 * @function
 * @memberof module:categoriesRoute
 * @param {string} path - Express path
 * @param {function} middleware - Express middleware
 * @param {function} controller - Express controller
 */
categoryRouter.delete("/:id", authorizeAccessToken(adminSecret), authorizeAdminRole("superadmin", "admin"), deleteCategory);

/**
 * Route for getting all categories.
 * @name GET /api/category/
 * @function
 * @memberof module:categoriesRoute
 * @param {string} path - Express path
 * @param {function} middleware - Express middleware
 * @param {function} controller - Express controller
 */
categoryRouter.get("/", authorizeAccessToken(adminSecret), getAllCategories);

/**
 * Route for getting a category by id.
 * @name GET /api/category/:id
 * @function
 * @memberof module:categoriesRoute
 * @param {string} path - Express path
 * @param {function} middleware - Express middleware
 * @param {function} controller - Express controller
 */
categoryRouter.get("/:slug", authorizeAccessToken(adminSecret), getCategory);

export default categoryRouter;
