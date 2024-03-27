"use strict";
/**
 * Express router for handling admin related routes.
 * @module adminRouter
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middlewares/auth");
const admin_controller_1 = require("../../controllers/admin/admin.controller");
require("dotenv").config();
const adminRouter = express_1.default.Router();
const adminSecret = process.env.ADMIN_ACCESS_TOKEN_JWT_SECRET;
/**
 * Route for registering a new admin.
 * @name post/api/admin/create-new
 * @function
 * @memberof module:adminRouter
 * @param {string} path - Express path
 * @param {function} middleware - Middleware function
 * @param {function} controller - Controller function
 */
adminRouter.post("/create-new", (0, auth_1.authorizeAccessToken)(adminSecret), (0, auth_1.authorizeAdminRole)("superadmin", "admin"), admin_controller_1.registerNewAdmin);
/**
 * Route for logging in an admin.
 * @name post/api/admin/login
 * @function
 * @memberof module:adminRouter
 * @param {string} path - Express path
 * @param {function} controller - Controller function
 */
adminRouter.post("/login", admin_controller_1.loginAdmin);
/**
 * Route for getting the current admin session.
 * @name get/api/admin/session
 * @function
 * @memberof module:adminRouter
 * @param {string} path - Express path
 * @param {function} middleware - Middleware function
 * @param {function} controller - Controller function
 */
adminRouter.get("/session", (0, auth_1.authorizeAccessToken)(adminSecret), admin_controller_1.getAdminSession);
/**
 * Route for updating the logged in admin user profile.
 * @name put/api/admin/user
 * @function
 * @memberof module:adminRouter
 * @param {string} path - Express path
 * @param {function} middleware - Middleware function
 * @param {function} controller - Controller function
 */
adminRouter.put("/user", (0, auth_1.authorizeAccessToken)(adminSecret), admin_controller_1.updateSelfProfile);
/**
 * Route for deleting the logged in admin user profile.
 * @name delete/api/admin/user
 * @function
 * @memberof module:adminRouter
 * @param {string} path - Express path
 * @param {function} middleware - Middleware function
 * @param {function} controller - Controller function
 */
adminRouter.delete("/user", (0, auth_1.authorizeAccessToken)(adminSecret), admin_controller_1.deleteSelfProfile);
/**
 * Route for updating the logged in admin user password.
 * @name put/api/admin/password
 * @function
 * @memberof module:adminRouter
 * @param {string} path - Express path
 * @param {function} middleware - Middleware function
 * @param {function} controller - Controller function
 */
adminRouter.put("/password", (0, auth_1.authorizeAccessToken)(adminSecret), admin_controller_1.updateSelfPassword);
/**
 * Route for requesting a password reset.
 * @name get/api/admin/forgot-password
 * @function
 * @memberof module:adminRouter
 * @param {string} path - Express path
 * @param {function} controller - Controller function
 */
adminRouter.get("/forget-password", admin_controller_1.forgotPassword);
/**
 * Route for verifying a password reset code.
 * @name post/api/admin/reset-password
 * @function
 * @memberof module:adminRouter
 * @param {string} path - Express path
 * @param {function} controller - Controller function
 */
adminRouter.post("/reset-password", admin_controller_1.verifyResetPasswordCode);
/**
 * Route for resetting a password.
 * @name put/api/admin/reset-password
 * @function
 * @memberof module:adminRouter
 * @param {string} path - Express path
 * @param {function} controller - Controller function
 */
adminRouter.put("/reset-password", admin_controller_1.resetPassword);
/**
 * Route for updating an admin user.
 * @name put/api/admin/user/:id
 * @function
 * @memberof module:adminRouter
 * @param {string} path - Express path
 * @param {function} middleware - Middleware function
 * @param {function} controller - Controller function
 */
adminRouter.put("/user/:id", (0, auth_1.authorizeAccessToken)(adminSecret), (0, auth_1.authorizeAdminRole)("superadmin", "admin"), admin_controller_1.updateAdminUser);
/**
 * Route for deleting an admin user.
 * @name delete/api/admin/user/:id
 * @function
 * @memberof module:adminRouter
 * @param {string} path - Express path
 * @param {function} middleware - Middleware function
 * @param {function} controller - Controller function
 */
adminRouter.delete("/user/:id", (0, auth_1.authorizeAccessToken)(adminSecret), (0, auth_1.authorizeAdminRole)("superadmin", "admin"), admin_controller_1.deleteAdmin);
/**
 * Route for getting all admin users.
 * @name get/api/admin/users
 * @function
 * @memberof module:adminRouter
 * @param {string} path - Express path
 * @param {function} middleware - Middleware function
 * @param {function} controller - Controller function
 */
adminRouter.get("/users", (0, auth_1.authorizeAccessToken)(adminSecret), (0, auth_1.authorizeAdminRole)("superadmin", "admin"), admin_controller_1.getAllAdmins);
/**
 * Route for getting a single admin user.
 * @name get/api/admin/user/:id
 * @function
 * @memberof module:adminRouter
 * @param {string} path - Express path
 * @param {function} middleware - Middleware function
 * @param {function} controller - Controller function
 */
adminRouter.get("/user/:id", (0, auth_1.authorizeAccessToken)(adminSecret), (0, auth_1.authorizeAdminRole)("superadmin", "admin"), admin_controller_1.getAdmin);
exports.default = adminRouter;
