import express from "express";
import {
    createAddress,
    deleteAddress,
    editAddress,
    getAddress,
    getAddresses,
    getDefaultAddress,
    setDefaultAddress,
} from "../../controllers/store/address.controller";

import { CUSTOMER_JWT_SECRET } from "../../lib/jwt_secret";
import { authorizeAccessToken } from "../../middlewares/auth";

const AddressRouter = express.Router();

AddressRouter.post("/create", authorizeAccessToken(CUSTOMER_JWT_SECRET, true), createAddress);
AddressRouter.put("/default/:id", authorizeAccessToken(CUSTOMER_JWT_SECRET, true), setDefaultAddress);
AddressRouter.get("/default", authorizeAccessToken(CUSTOMER_JWT_SECRET, true), getDefaultAddress);
AddressRouter.get("/:id", authorizeAccessToken(CUSTOMER_JWT_SECRET, true), getAddress);
AddressRouter.put("/:id", authorizeAccessToken(CUSTOMER_JWT_SECRET, true), editAddress);
AddressRouter.delete("/:id", authorizeAccessToken(CUSTOMER_JWT_SECRET, true), deleteAddress);
AddressRouter.get("/", authorizeAccessToken(CUSTOMER_JWT_SECRET, true), getAddresses);

export default AddressRouter;
