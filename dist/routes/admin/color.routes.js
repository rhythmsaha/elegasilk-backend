"use strict";
/**
 * Express router for managing color routes.
 * @module ColorRouter
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middlewares/auth");
const color_controller_1 = require("../../controllers/admin/color.controller");
const adminSecret = process.env.ADMIN_ACCESS_TOKEN_JWT_SECRET;
const colorRouter = express_1.default.Router();
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
colorRouter.post("/create-new", (0, auth_1.authorizeAccessToken)(adminSecret), (0, auth_1.authorizeAdminRole)("superadmin", "admin"), color_controller_1.createColor);
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
colorRouter.put("/:id", (0, auth_1.authorizeAccessToken)(adminSecret), (0, auth_1.authorizeAdminRole)("superadmin", "admin"), color_controller_1.updateColor);
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
colorRouter.delete("/:id", (0, auth_1.authorizeAccessToken)(adminSecret), (0, auth_1.authorizeAdminRole)("superadmin", "admin"), color_controller_1.deleteColor);
colorRouter.get("/", (0, auth_1.authorizeAccessToken)(adminSecret), (0, auth_1.authorizeAdminRole)("superadmin", "admin", "moderator"), color_controller_1.getColors);
colorRouter.get("/:id", (0, auth_1.authorizeAccessToken)(adminSecret), (0, auth_1.authorizeAdminRole)("superadmin", "admin", "moderator"), color_controller_1.getColor);
exports.default = colorRouter;
