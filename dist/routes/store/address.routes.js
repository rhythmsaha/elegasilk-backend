"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const address_controller_1 = require("../../controllers/store/address.controller");
const jwt_secret_1 = require("../../lib/jwt_secret");
const auth_1 = require("../../middlewares/auth");
const AddressRouter = express_1.default.Router();
AddressRouter.post("/create", (0, auth_1.authorizeAccessToken)(jwt_secret_1.CUSTOMER_JWT_SECRET, true), address_controller_1.createAddress);
AddressRouter.put("/default/:id", (0, auth_1.authorizeAccessToken)(jwt_secret_1.CUSTOMER_JWT_SECRET, true), address_controller_1.setDefaultAddress);
AddressRouter.get("/default", (0, auth_1.authorizeAccessToken)(jwt_secret_1.CUSTOMER_JWT_SECRET, true), address_controller_1.getDefaultAddress);
AddressRouter.get("/:id", (0, auth_1.authorizeAccessToken)(jwt_secret_1.CUSTOMER_JWT_SECRET, true), address_controller_1.getAddress);
AddressRouter.put("/:id", (0, auth_1.authorizeAccessToken)(jwt_secret_1.CUSTOMER_JWT_SECRET, true), address_controller_1.editAddress);
AddressRouter.delete("/:id", (0, auth_1.authorizeAccessToken)(jwt_secret_1.CUSTOMER_JWT_SECRET, true), address_controller_1.deleteAddress);
AddressRouter.get("/", (0, auth_1.authorizeAccessToken)(jwt_secret_1.CUSTOMER_JWT_SECRET, true), address_controller_1.getAddresses);
exports.default = AddressRouter;
