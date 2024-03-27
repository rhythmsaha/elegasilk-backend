"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Express router for handling customer-related routes.
 */
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middlewares/auth");
const customer_controller_1 = require("../../controllers/store/customer.controller");
const CustomerRouter = express_1.default.Router();
const CUSTOMER_JWT_SECRET = process.env.CUSTOMER_JWT_SECRET;
/**
 * Route for registering a new customer.
 * @name POST /register
 * @function
 */
CustomerRouter.post("/register", customer_controller_1.createCustomer);
/**
 * Route for resending the verification link to a customer's email.
 * @name POST /resendverificationlink
 * @function
 */
CustomerRouter.post("/resendverificationlink", customer_controller_1.resendVerificationLink);
/**
 * Route for verifying a customer's account.
 * @name GET /verifyaccount
 * @function
 */
CustomerRouter.get("/verifyaccount", customer_controller_1.verifyCustomerAccount);
/**
 * Route for logging in a customer.
 * @name POST /login
 * @function
 */
CustomerRouter.post("/login", customer_controller_1.loginCustomer);
/**
 * Route for refreshing a customer's session.
 * @name GET /refresh-session
 * @function
 * @middleware authorizeAccessToken
 */
CustomerRouter.get("/refresh-session", (0, auth_1.authorizeAccessToken)(CUSTOMER_JWT_SECRET, true), customer_controller_1.refreshCustomerSession);
/**
 * Route for updating a customer's email.
 * @name POST /email/:id
 * @function
 * @middleware authorizeAccessToken
 */
CustomerRouter.post("/email/:id", (0, auth_1.authorizeAccessToken)(CUSTOMER_JWT_SECRET, true), customer_controller_1.updateCustomerEmail);
/**
 * Route for verifying a customer's email.
 * @name PUT /email/verify/:id
 * @function
 * @middleware authorizeAccessToken
 */
CustomerRouter.put("/email/verify/:id", (0, auth_1.authorizeAccessToken)(CUSTOMER_JWT_SECRET, true), customer_controller_1.verifyCustomerEmail);
/**
 * Route for updating a customer's password.
 * @name PUT /password/:id
 * @function
 * @middleware authorizeAccessToken
 */
CustomerRouter.put("/password/:id", (0, auth_1.authorizeAccessToken)(CUSTOMER_JWT_SECRET, true), customer_controller_1.updateCustomerPassword);
/**
 * Route for retrieving a customer's profile.
 * @name GET /:id
 * @function
 * @middleware authorizeAccessToken
 */
CustomerRouter.get("/:id", (0, auth_1.authorizeAccessToken)(CUSTOMER_JWT_SECRET, true), customer_controller_1.getCustomerProfile);
/**
 * Route for updating a customer's profile.
 * @name PUT /:id
 * @function
 * @middleware authorizeAccessToken
 */
CustomerRouter.put("/:id", (0, auth_1.authorizeAccessToken)(CUSTOMER_JWT_SECRET, true), customer_controller_1.updateCustomerProfile);
/**
 * Route for deleting a customer's account.
 * @name DELETE /:id
 * @function
 * @middleware authorizeAccessToken
 */
CustomerRouter.delete("/:id", (0, auth_1.authorizeAccessToken)(CUSTOMER_JWT_SECRET, true), customer_controller_1.deleteCustomerAccount);
/**
 * Route for forgetting a customer's password.
 * @name POST /forgetpassword
 * @function
 */
CustomerRouter.post("/forgetpassword", customer_controller_1.forgetPassword);
/**
 * Route for resetting a customer's password.
 * @name POST /resetpassword
 * @function
 */
CustomerRouter.post("/resetpassword", customer_controller_1.resetPassword);
exports.default = CustomerRouter;
