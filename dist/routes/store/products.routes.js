"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const filter_controller_1 = require("../../controllers/store/filter.controller");
const product_controller_1 = require("../../controllers/store/product.controller");
const ProductRouter = express_1.default.Router();
// StoreFront API
ProductRouter.get("/paths", product_controller_1.getProductsPaths);
ProductRouter.get("/filters", filter_controller_1.getProductFilters);
ProductRouter.get("/:slug", product_controller_1.getProduct);
ProductRouter.get("/", product_controller_1.getProductsForStoreFront);
exports.default = ProductRouter;
