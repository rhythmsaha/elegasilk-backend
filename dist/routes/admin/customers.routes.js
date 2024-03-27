"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middlewares/auth");
const jwt_secret_1 = require("../../lib/jwt_secret");
const customer_controller_1 = require("../../controllers/admin/customer.controller");
const router = express_1.default.Router();
router.put("/status", (0, auth_1.authorizeAccessToken)(jwt_secret_1.adminSecret), (0, auth_1.authorizeAdminRole)("superadmin", "admin"), customer_controller_1.toggleCustomerStatus);
router.post("/", (0, auth_1.authorizeAccessToken)(jwt_secret_1.adminSecret), (0, auth_1.authorizeAdminRole)("superadmin", "admin"), customer_controller_1.createCustomerByAdmin);
router.put("/:id", (0, auth_1.authorizeAccessToken)(jwt_secret_1.adminSecret), (0, auth_1.authorizeAdminRole)("superadmin", "admin"), customer_controller_1.updateCustomerProfileByAdmin);
router.get("/", (0, auth_1.authorizeAccessToken)(jwt_secret_1.adminSecret), customer_controller_1.getCustomersListByAdmin);
router.get("/:id", (0, auth_1.authorizeAccessToken)(jwt_secret_1.adminSecret), customer_controller_1.getCustomerProfileByAdmin);
router.delete("/:id", (0, auth_1.authorizeAccessToken)(jwt_secret_1.adminSecret), (0, auth_1.authorizeAdminRole)("superadmin", "admin"), customer_controller_1.deleteCustomerAccountByAdmin);
exports.default = router;
