/**
 * Express router for managing collections.
 * @module CollectionRouter
 */

import express from "express";
import { Secret } from "jsonwebtoken";
import { authorizeAccessToken, authorizeAdminRole } from "../../middlewares/auth";
import {
    createCollection,
    deleteCollection,
    getAllCollections,
    getCollection,
    updateCollection,
} from "../../controllers/admin/collection.controller";

const adminSecret = process.env.ADMIN_ACCESS_TOKEN_JWT_SECRET as Secret;

const collectionRouter = express.Router();

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
collectionRouter.post(
    "/create-new",
    authorizeAccessToken(adminSecret),
    authorizeAdminRole("superadmin", "admin"),
    createCollection
);

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
collectionRouter.put(
    "/:id",
    authorizeAccessToken(adminSecret),
    authorizeAdminRole("superadmin", "admin"),
    updateCollection
);

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
collectionRouter.delete(
    "/:id",
    authorizeAccessToken(adminSecret),
    authorizeAdminRole("superadmin", "admin"),
    deleteCollection
);

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
collectionRouter.get(
    "/",
    authorizeAccessToken(adminSecret),
    authorizeAdminRole("superadmin", "admin", "moderator"),
    getAllCollections
);

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
collectionRouter.get(
    "/:id",
    authorizeAccessToken(adminSecret),
    authorizeAdminRole("superadmin", "admin", "moderator"),
    getCollection
);

export default collectionRouter;
