import express from "express";
import { Secret } from "jsonwebtoken";
import { authorizeAccessToken } from "../../middlewares/auth";
import {
    createCustomer,
    deleteCustomerAccount,
    getCustomerProfile,
    loginCustomer,
    refreshCustomerSession,
    resendVerificationLink,
    updateCustomerEmail,
    updateCustomerPassword,
    updateCustomerProfile,
    verifyCustomerAccount,
    verifyCustomerEmail,
} from "../../controllers/store/customer.controller";

const CustomerRouter = express.Router();

const CUSTOMER_JWT_SECRET = process.env.CUSTOMER_JWT_SECRET as Secret;

CustomerRouter.post("/register", createCustomer);

CustomerRouter.post("/resendverificationlink", resendVerificationLink);

CustomerRouter.get("/verifyaccount", verifyCustomerAccount);

CustomerRouter.post("/login", loginCustomer);

CustomerRouter.get(
    "/refresh-session",
    authorizeAccessToken(CUSTOMER_JWT_SECRET, true),
    refreshCustomerSession
);

CustomerRouter.post("/email/:id", authorizeAccessToken(CUSTOMER_JWT_SECRET), updateCustomerEmail);

CustomerRouter.put(
    "/email/verify/:id",
    authorizeAccessToken(CUSTOMER_JWT_SECRET),
    verifyCustomerEmail
);

CustomerRouter.put(
    "/password/:id",
    authorizeAccessToken(CUSTOMER_JWT_SECRET),
    updateCustomerPassword
);

CustomerRouter.get("/:id", authorizeAccessToken(CUSTOMER_JWT_SECRET), getCustomerProfile);

CustomerRouter.put("/:id", authorizeAccessToken(CUSTOMER_JWT_SECRET), updateCustomerProfile);

CustomerRouter.delete("/:id", authorizeAccessToken(CUSTOMER_JWT_SECRET), deleteCustomerAccount);

export default CustomerRouter;
