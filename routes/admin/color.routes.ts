/**
 * Express router for managing color routes.
 * @module ColorRouter
 */

import express from "express";
import { Secret } from "jsonwebtoken";
import { authorizeAccessToken, authorizeAdminRole } from "../../middlewares/auth";
import {
    createColor,
    deleteColor,
    getColor,
    getColors,
    updateColor,
} from "../../controllers/admin/color.controller";

const adminSecret = process.env.ADMIN_ACCESS_TOKEN_JWT_SECRET as Secret;

const colorRouter = express.Router();

/**
 * Route for creating a new color.
 * @name POST /create-new
 * @function
 * @memberof module:ColorRouter
 * @inner
 * @param {string} path - Express path
 * @param {function} middleware - Express middleware
 * @param {function} middleware - Express middleware
 * @param {function} handler - Express handler
 */
colorRouter.post(
    "/create-new",
    authorizeAccessToken(adminSecret),
    authorizeAdminRole("superadmin", "admin"),
    createColor
);

/**
 * Route for updating a color.
 * @name PUT /
 * @function
 * @memberof module:ColorRouter
 * @inner
 * @param {string} path - Express path
 * @param {function} middleware - Express middleware
 * @param {function} middleware - Express middleware
 * @param {function} handler - Express handler
 */
colorRouter.put(
    "/:id",
    authorizeAccessToken(adminSecret),
    authorizeAdminRole("superadmin", "admin"),
    updateColor
);

/**
 * Route for deleting a color.
 * @name DELETE /
 * @function
 * @memberof module:ColorRouter
 * @inner
 * @param {string} path - Express path
 * @param {function} middleware - Express middleware
 * @param {function} middleware - Express middleware
 * @param {function} handler - Express handler
 */
colorRouter.delete(
    "/:id",
    authorizeAccessToken(adminSecret),
    authorizeAdminRole("superadmin", "admin"),
    deleteColor
);

colorRouter.get(
    "/",
    authorizeAccessToken(adminSecret),
    authorizeAdminRole("superadmin", "admin", "moderator"),
    getColors
);

colorRouter.get(
    "/:id",
    authorizeAccessToken(adminSecret),
    authorizeAdminRole("superadmin", "admin", "moderator"),
    getColor
);

export default colorRouter;
