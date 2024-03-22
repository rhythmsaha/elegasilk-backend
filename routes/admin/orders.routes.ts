import express from "express";
import { authorizeAccessToken } from "../../middlewares/auth";
import { adminSecret } from "../../lib/jwt_secret";
import { getOrders, getSingleOrder, updateStatus } from "../../controllers/admin/order.controller";

const OrderRouter = express.Router();

OrderRouter.get("/", authorizeAccessToken(adminSecret), getOrders);
OrderRouter.get("/:id", authorizeAccessToken(adminSecret), getSingleOrder);
OrderRouter.put("/status/:id", authorizeAccessToken(adminSecret), updateStatus);

export default OrderRouter;
