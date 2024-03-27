"use strict";
/**
 * Express router for managing collections.
 * @module CollectionRouter
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middlewares/auth");
const collection_controller_1 = require("../../controllers/admin/collection.controller");
const adminSecret = process.env.ADMIN_ACCESS_TOKEN_JWT_SECRET;
const collectionRouter = express_1.default.Router();
/**
 * Route for creating a new collection.
 * @name POST /create-new
 * @function
 * @memberof module:CollectionRouter
 * @inner
 * @param {string} path - Express path
 * @param {function} middleware - Express middleware
 * @param {function} middleware - Express middleware
 * @param {function} handler - Express handler
 */
collectionRouter.post("/create-new", (0, auth_1.authorizeAccessToken)(adminSecret), (0, auth_1.authorizeAdminRole)("superadmin", "admin"), collection_controller_1.createCollection);
/**
 * Route for updating a collection.
 * @name PUT /
 * @function
 * @memberof module:CollectionRouter
 * @inner
 * @param {string} path - Express path
 * @param {function} middleware - Express middleware
 * @param {function} middleware - Express middleware
 * @param {function} handler - Express handler
 */
collectionRouter.put("/:id", (0, auth_1.authorizeAccessToken)(adminSecret), (0, auth_1.authorizeAdminRole)("superadmin", "admin"), collection_controller_1.updateCollection);
/**
 * Route for deleting a collection.
 * @name DELETE /
 * @function
 * @memberof module:CollectionRouter
 * @inner
 * @param {string} path - Express path
 * @param {function} middleware - Express middleware
 * @param {function} middleware - Express middleware
 * @param {function} handler - Express handler
 */
collectionRouter.delete("/:id", (0, auth_1.authorizeAccessToken)(adminSecret), (0, auth_1.authorizeAdminRole)("superadmin", "admin"), collection_controller_1.deleteCollection);
/**
 * Route for getting all collections.
 * @name GET /
 * @function
 * @memberof module:CollectionRouter
 * @inner
 * @param {string} path - Express path
 * @param {function} middleware - Express middleware
 * @param {function} middleware - Express middleware
 * @param {function} handler - Express handler
 */
collectionRouter.get("/", (0, auth_1.authorizeAccessToken)(adminSecret), (0, auth_1.authorizeAdminRole)("superadmin", "admin", "moderator"), collection_controller_1.getAllCollections);
/**
 * Route for getting a collection by ID.
 * @name GET /:id
 * @function
 * @memberof module:CollectionRouter
 * @inner
 * @param {string} path - Express path
 * @param {function} middleware - Express middleware
 * @param {function} middleware - Express middleware
 * @param {function} handler - Express handler
 */
collectionRouter.get("/:id", (0, auth_1.authorizeAccessToken)(adminSecret), (0, auth_1.authorizeAdminRole)("superadmin", "admin", "moderator"), collection_controller_1.getCollection);
exports.default = collectionRouter;
