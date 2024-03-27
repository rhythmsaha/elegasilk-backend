"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middlewares/auth");
const jwt_secret_1 = require("../../lib/jwt_secret");
const order_controller_1 = require("../../controllers/admin/order.controller");
const OrderRouter = express_1.default.Router();
OrderRouter.get("/", (0, auth_1.authorizeAccessToken)(jwt_secret_1.adminSecret), order_controller_1.getOrders);
OrderRouter.get("/:id", (0, auth_1.authorizeAccessToken)(jwt_secret_1.adminSecret), order_controller_1.getSingleOrder);
OrderRouter.put("/status/:id", (0, auth_1.authorizeAccessToken)(jwt_secret_1.adminSecret), order_controller_1.updateStatus);
exports.default = OrderRouter;
