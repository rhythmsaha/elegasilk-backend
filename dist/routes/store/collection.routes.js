"use strict";
/**
 * Express router for managing collections.
 * @module StoreCollectionRoutes
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const collection_controller_1 = require("../../controllers/admin/collection.controller");
const CollectionRouter = express_1.default.Router();
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
CollectionRouter.get("/:id", collection_controller_1.getCollection);
exports.default = CollectionRouter;
