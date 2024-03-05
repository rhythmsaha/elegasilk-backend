import express from "express";
import { Secret } from "jsonwebtoken";
import {} from "../../middlewares/auth";
import { createCustomer, loginCustomer, verifyCustomerAccount } from "../../controllers/store/customer.controller";

const customerRouter = express.Router();

customerRouter.post("/register", createCustomer);
customerRouter.get("/verifyaccount", verifyCustomerAccount);
customerRouter.post("/login", loginCustomer);

export default customerRouter;
