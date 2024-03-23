import express from "express";
import {
    cancelOrder,
    checkSession,
    createOrder,
    getOrders,
    getSingleOrder,
    webhook,
} from "../../controllers/store/order.controller";
import { authorizeAccessToken } from "../../middlewares/auth";
import { CUSTOMER_JWT_SECRET } from "../../lib/jwt_secret";

const OrderRouter = express.Router();

OrderRouter.post("/create-checkout-session", authorizeAccessToken(CUSTOMER_JWT_SECRET, true), createOrder);

OrderRouter.post("/webhook", webhook);

OrderRouter.get("/check-session", authorizeAccessToken(CUSTOMER_JWT_SECRET, true), checkSession);

OrderRouter.get("/all", authorizeAccessToken(CUSTOMER_JWT_SECRET, true), getOrders);

OrderRouter.get("/single/:id", authorizeAccessToken(CUSTOMER_JWT_SECRET, true), getSingleOrder);

OrderRouter.put("/cancel/:id", authorizeAccessToken(CUSTOMER_JWT_SECRET, true), cancelOrder);

export default OrderRouter;
