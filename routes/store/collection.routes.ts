/**
 * Express router for managing collections.
 * @module StoreCollectionRoutes
 */

import express from "express";
import { getCollection } from "../../controllers/admin/collection.controller";

const CollectionRouter = express.Router();

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

CollectionRouter.get("/:id", getCollection);

export default CollectionRouter;
