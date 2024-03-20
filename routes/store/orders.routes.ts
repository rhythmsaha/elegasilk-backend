import express from "express";
import { checkSession, createOrder, webhook } from "../../controllers/store/order.controller";
import { authorizeAccessToken } from "../../middlewares/auth";
import { CUSTOMER_JWT_SECRET } from "../../lib/jwt_secret";

const OrderRouter = express.Router();

OrderRouter.post("/create-checkout-session", authorizeAccessToken(CUSTOMER_JWT_SECRET, true), createOrder);

OrderRouter.post("/webhook", express.raw({ type: "application/json" }), webhook);

OrderRouter.get("/check-session", authorizeAccessToken(CUSTOMER_JWT_SECRET, true), checkSession);

export default OrderRouter;
