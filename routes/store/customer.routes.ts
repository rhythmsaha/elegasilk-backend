import express from "express";
import { Secret } from "jsonwebtoken";
import { authorizeAccessToken } from "../../middlewares/auth";
import {
    createCustomer,
    loginCustomer,
    refreshCustomerSession,
    resendVerificationLink,
    verifyCustomerAccount,
} from "../../controllers/store/customer.controller";

const CustomerRouter = express.Router();

const CUSTOMER_JWT_SECRET = process.env.CUSTOMER_JWT_SECRET as Secret;

CustomerRouter.post("/register", createCustomer);
CustomerRouter.get("/verifyaccount", verifyCustomerAccount);
CustomerRouter.post("/resendverificationlink", resendVerificationLink);
CustomerRouter.post("/login", loginCustomer);
CustomerRouter.get(
    "/refresh-session",
    authorizeAccessToken(CUSTOMER_JWT_SECRET, true),
    refreshCustomerSession
);

export default CustomerRouter;
