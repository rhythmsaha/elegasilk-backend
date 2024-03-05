import express from "express";
import { Secret } from "jsonwebtoken";
import { authorizeAccessToken } from "../../middlewares/auth";
import { createCustomer, loginCustomer, refreshCustomerSession, resendVerificationLink, verifyCustomerAccount } from "../../controllers/store/customer.controller";

const customerRouter = express.Router();

const CUSTOMER_JWT_SECRET = process.env.CUSTOMER_JWT_SECRET as Secret;

customerRouter.post("/register", createCustomer);
customerRouter.get("/verifyaccount", verifyCustomerAccount);
customerRouter.post("/resendverificationlink", resendVerificationLink);
customerRouter.post("/login", loginCustomer);
customerRouter.get("/refresh-session", authorizeAccessToken(CUSTOMER_JWT_SECRET, true), refreshCustomerSession);

export default customerRouter;
