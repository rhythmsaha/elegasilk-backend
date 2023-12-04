/**
 * Express router for handling admin related routes.
 * @module adminRouter
 */

import express from "express";
import { authorizeAccessToken, authorizeAdminRole } from "../middlewares/auth";
import {
    deleteAdmin,
    deleteSelfProfile,
    forgotPassword,
    getAdmin,
    getAdminSession,
    getAllAdmins,
    loginAdmin,
    logoutAdmin,
    registerNewAdmin,
    resetPassword,
    updateAdminUser,
    updateSelfPassword,
    updateSelfProfile,
    verifyResetPasswordCode,
} from "../controllers/admin.controller";
import { Secret } from "jsonwebtoken";
require("dotenv").config();

const adminRouter = express.Router();

const adminSecret = process.env.ADMIN_ACCESS_TOKEN_JWT_SECRET as Secret;

/**
 * Route for registering a new admin.
 * @name post/api/admin/create-new
 * @function
 * @memberof module:adminRouter
 * @param {string} path - Express path
 * @param {function} middleware - Middleware function
 * @param {function} controller - Controller function
 */
adminRouter.post("/create-new", authorizeAccessToken(adminSecret), authorizeAdminRole("superadmin", "admin"), registerNewAdmin);

/**
 * Route for logging in an admin.
 * @name post/api/admin/login
 * @function
 * @memberof module:adminRouter
 * @param {string} path - Express path
 * @param {function} controller - Controller function
 */
adminRouter.post("/login", loginAdmin);

/**
 * Route for logging out an admin.
 * @name post/api/admin/logout
 * @function
 * @memberof module:adminRouter
 * @param {string} path - Express path
 * @param {function} middleware - Middleware function
 * @param {function} controller - Controller function
 */
adminRouter.post("/logout", authorizeAccessToken(adminSecret), logoutAdmin);

/**
 * Route for getting the current admin session.
 * @name get/api/admin/session
 * @function
 * @memberof module:adminRouter
 * @param {string} path - Express path
 * @param {function} middleware - Middleware function
 * @param {function} controller - Controller function
 */
adminRouter.get("/session", authorizeAccessToken(adminSecret), getAdminSession);

/**
 * Route for updating the logged in admin user profile.
 * @name put/api/admin/user
 * @function
 * @memberof module:adminRouter
 * @param {string} path - Express path
 * @param {function} middleware - Middleware function
 * @param {function} controller - Controller function
 */
adminRouter.put("/user", authorizeAccessToken(adminSecret), updateSelfProfile);

/**
 * Route for deleting the logged in admin user profile.
 * @name delete/api/admin/user
 * @function
 * @memberof module:adminRouter
 * @param {string} path - Express path
 * @param {function} middleware - Middleware function
 * @param {function} controller - Controller function
 */
adminRouter.delete("/user", authorizeAccessToken(adminSecret), deleteSelfProfile);

/**
 * Route for updating the logged in admin user password.
 * @name put/api/admin/password
 * @function
 * @memberof module:adminRouter
 * @param {string} path - Express path
 * @param {function} middleware - Middleware function
 * @param {function} controller - Controller function
 */
adminRouter.put("/password", authorizeAccessToken(adminSecret), updateSelfPassword);

/**
 * Route for requesting a password reset.
 * @name get/api/admin/forgot-password
 * @function
 * @memberof module:adminRouter
 * @param {string} path - Express path
 * @param {function} controller - Controller function
 */
adminRouter.get("/forget-password", forgotPassword);

/**
 * Route for verifying a password reset code.
 * @name post/api/admin/reset-password
 * @function
 * @memberof module:adminRouter
 * @param {string} path - Express path
 * @param {function} controller - Controller function
 */
adminRouter.post("/reset-password", verifyResetPasswordCode);

/**
 * Route for resetting a password.
 * @name put/api/admin/reset-password
 * @function
 * @memberof module:adminRouter
 * @param {string} path - Express path
 * @param {function} controller - Controller function
 */
adminRouter.put("/reset-password", resetPassword);

/**
 * Route for updating an admin user.
 * @name put/api/admin/user/:id
 * @function
 * @memberof module:adminRouter
 * @param {string} path - Express path
 * @param {function} middleware - Middleware function
 * @param {function} controller - Controller function
 */
adminRouter.put("/user/:id", authorizeAccessToken(adminSecret), authorizeAdminRole("superadmin", "admin"), updateAdminUser);

/**
 * Route for deleting an admin user.
 * @name delete/api/admin/user/:id
 * @function
 * @memberof module:adminRouter
 * @param {string} path - Express path
 * @param {function} middleware - Middleware function
 * @param {function} controller - Controller function
 */
adminRouter.delete("/user/:id", authorizeAccessToken(adminSecret), authorizeAdminRole("superadmin", "admin"), deleteAdmin);

/**
 * Route for getting all admin users.
 * @name get/api/admin/users
 * @function
 * @memberof module:adminRouter
 * @param {string} path - Express path
 * @param {function} middleware - Middleware function
 * @param {function} controller - Controller function
 */
adminRouter.get("/users", authorizeAccessToken(adminSecret), authorizeAdminRole("superadmin", "admin"), getAllAdmins);

/**
 * Route for getting a single admin user.
 * @name get/api/admin/user/:id
 * @function
 * @memberof module:adminRouter
 * @param {string} path - Express path
 * @param {function} middleware - Middleware function
 * @param {function} controller - Controller function
 */
adminRouter.get("/user/:id", authorizeAccessToken(adminSecret), authorizeAdminRole("superadmin", "admin"), getAdmin);

export default adminRouter;
