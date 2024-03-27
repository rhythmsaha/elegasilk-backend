"use strict";
/**
 * The main application file for the elegasilk-backend project.
 * This file sets up the Express application, imports modules, defines routes, and handles errors.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
// import Modules
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const errorMiddleware_1 = __importDefault(require("./middlewares/errorMiddleware"));
// Import AdminAPI Routes
const admin_routes_1 = __importDefault(require("./routes/admin/admin.routes"));
const categories_routes_1 = __importDefault(require("./routes/admin/categories.routes"));
const collections_routes_1 = __importDefault(require("./routes/admin/collections.routes"));
const color_routes_1 = __importDefault(require("./routes/admin/color.routes"));
const subcategories_routes_1 = __importDefault(require("./routes/admin/subcategories.routes"));
const product_routes_1 = __importDefault(require("./routes/admin/product.routes"));
//Import StoreFrontAPI Routes
const admin_1 = __importDefault(require("./routes/admin"));
const store_1 = __importDefault(require("./routes/store"));
// Initialize App
exports.app = (0, express_1.default)();
exports.app.use(express_1.default.json());
// Cors => Cross Origin Resource Sharing
exports.app.use((0, cors_1.default)());
/**
 * Testing route to check if the API is working.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
exports.app.get("/api/test", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json({
        success: true,
        message: "API is working",
        pid: process.pid,
    });
}));
const dotenv_1 = __importDefault(require("dotenv"));
const orders_routes_1 = __importDefault(require("./routes/admin/orders.routes"));
const customers_routes_1 = __importDefault(require("./routes/admin/customers.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/admin/dashboard.routes"));
dotenv_1.default.config();
// Routes
exports.app.use("/api/admin", admin_routes_1.default);
exports.app.use("/api/categories", categories_routes_1.default);
exports.app.use("/api/subcategories", subcategories_routes_1.default);
exports.app.use("/api/collections", collections_routes_1.default);
exports.app.use("/api/colors", color_routes_1.default);
exports.app.use("/api/products", product_routes_1.default);
exports.app.use("/api/orders", orders_routes_1.default);
exports.app.use("/api/customers", customers_routes_1.default);
exports.app.use("/api/dashboard", dashboard_routes_1.default);
// AdminAPI - v1
exports.app.use("/api/v1/admin", admin_1.default);
// Storefront Api - v1
exports.app.use("/api/v1/store", store_1.default);
// Catch Unknown Routes
exports.app.all("*", (req, res, next) => {
    const error = new Error(`Route not found - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
});
exports.app.use(errorMiddleware_1.default);
