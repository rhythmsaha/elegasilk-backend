"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middlewares/auth");
const product_controller_1 = require("../../controllers/admin/product.controller");
const adminSecret = process.env.ADMIN_ACCESS_TOKEN_JWT_SECRET;
const productRouter = express_1.default.Router();
// Admin API
productRouter.post("/create-new", (0, auth_1.authorizeAccessToken)(adminSecret), (0, auth_1.authorizeAdminRole)("superadmin", "admin"), product_controller_1.createProduct);
productRouter.put("/:id", (0, auth_1.authorizeAccessToken)(adminSecret), (0, auth_1.authorizeAdminRole)("superadmin", "admin"), product_controller_1.updateProduct);
productRouter.delete("/:id", (0, auth_1.authorizeAccessToken)(adminSecret), (0, auth_1.authorizeAdminRole)("superadmin", "admin"), product_controller_1.deleteProduct);
productRouter.get("/:id", (0, auth_1.authorizeAccessToken)(adminSecret), (0, auth_1.authorizeAdminRole)("superadmin", "admin", "moderator"), product_controller_1.getProduct);
productRouter.get("/", (0, auth_1.authorizeAccessToken)(adminSecret), (0, auth_1.authorizeAdminRole)("superadmin", "admin", "moderator"), product_controller_1.getAllProducts);
productRouter.post("/add-sample", product_controller_1.insertProduct);
exports.default = productRouter;
