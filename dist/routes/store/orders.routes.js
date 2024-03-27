"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const order_controller_1 = require("../../controllers/store/order.controller");
const auth_1 = require("../../middlewares/auth");
const jwt_secret_1 = require("../../lib/jwt_secret");
const OrderRouter = express_1.default.Router();
OrderRouter.post("/create-checkout-session", (0, auth_1.authorizeAccessToken)(jwt_secret_1.CUSTOMER_JWT_SECRET, true), order_controller_1.createOrder);
OrderRouter.post("/webhook", order_controller_1.webhook);
OrderRouter.get("/check-session", (0, auth_1.authorizeAccessToken)(jwt_secret_1.CUSTOMER_JWT_SECRET, true), order_controller_1.checkSession);
OrderRouter.get("/all", (0, auth_1.authorizeAccessToken)(jwt_secret_1.CUSTOMER_JWT_SECRET, true), order_controller_1.getOrders);
OrderRouter.get("/single/:id", (0, auth_1.authorizeAccessToken)(jwt_secret_1.CUSTOMER_JWT_SECRET, true), order_controller_1.getSingleOrder);
OrderRouter.put("/cancel/:id", (0, auth_1.authorizeAccessToken)(jwt_secret_1.CUSTOMER_JWT_SECRET, true), order_controller_1.cancelOrder);
exports.default = OrderRouter;
