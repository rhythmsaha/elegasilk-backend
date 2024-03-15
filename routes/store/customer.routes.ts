/**
 * Express router for handling customer-related routes.
 */
import express from "express";
import { Secret } from "jsonwebtoken";
import { authorizeAccessToken } from "../../middlewares/auth";
import {
    createCustomer,
    deleteCustomerAccount,
    forgetPassword,
    getCustomerProfile,
    loginCustomer,
    refreshCustomerSession,
    resendVerificationLink,
    resetPassword,
    updateCustomerEmail,
    updateCustomerPassword,
    updateCustomerProfile,
    verifyCustomerAccount,
    verifyCustomerEmail,
} from "../../controllers/store/customer.controller";

const CustomerRouter = express.Router();

const CUSTOMER_JWT_SECRET = process.env.CUSTOMER_JWT_SECRET as Secret;

/**
 * Route for registering a new customer.
 * @name POST /register
 * @function
 */
CustomerRouter.post("/register", createCustomer);

/**
 * Route for resending the verification link to a customer's email.
 * @name POST /resendverificationlink
 * @function
 */
CustomerRouter.post("/resendverificationlink", resendVerificationLink);

/**
 * Route for verifying a customer's account.
 * @name GET /verifyaccount
 * @function
 */
CustomerRouter.get("/verifyaccount", verifyCustomerAccount);

/**
 * Route for logging in a customer.
 * @name POST /login
 * @function
 */
CustomerRouter.post("/login", loginCustomer);

/**
 * Route for refreshing a customer's session.
 * @name GET /refresh-session
 * @function
 * @middleware authorizeAccessToken
 */
CustomerRouter.get("/refresh-session", authorizeAccessToken(CUSTOMER_JWT_SECRET, true), refreshCustomerSession);

/**
 * Route for updating a customer's email.
 * @name POST /email/:id
 * @function
 * @middleware authorizeAccessToken
 */
CustomerRouter.post("/email/:id", authorizeAccessToken(CUSTOMER_JWT_SECRET, true), updateCustomerEmail);

/**
 * Route for verifying a customer's email.
 * @name PUT /email/verify/:id
 * @function
 * @middleware authorizeAccessToken
 */
CustomerRouter.put("/email/verify/:id", authorizeAccessToken(CUSTOMER_JWT_SECRET, true), verifyCustomerEmail);

/**
 * Route for updating a customer's password.
 * @name PUT /password/:id
 * @function
 * @middleware authorizeAccessToken
 */
CustomerRouter.put("/password/:id", authorizeAccessToken(CUSTOMER_JWT_SECRET, true), updateCustomerPassword);

/**
 * Route for retrieving a customer's profile.
 * @name GET /:id
 * @function
 * @middleware authorizeAccessToken
 */
CustomerRouter.get("/:id", authorizeAccessToken(CUSTOMER_JWT_SECRET, true), getCustomerProfile);

/**
 * Route for updating a customer's profile.
 * @name PUT /:id
 * @function
 * @middleware authorizeAccessToken
 */
CustomerRouter.put("/:id", authorizeAccessToken(CUSTOMER_JWT_SECRET, true), updateCustomerProfile);

/**
 * Route for deleting a customer's account.
 * @name DELETE /:id
 * @function
 * @middleware authorizeAccessToken
 */
CustomerRouter.delete("/:id", authorizeAccessToken(CUSTOMER_JWT_SECRET, true), deleteCustomerAccount);

/**
 * Route for forgetting a customer's password.
 * @name POST /forgetpassword
 * @function
 */
CustomerRouter.post("/forgetpassword", forgetPassword);

/**
 * Route for resetting a customer's password.
 * @name POST /resetpassword
 * @function
 */
CustomerRouter.post("/resetpassword", resetPassword);

export default CustomerRouter;
