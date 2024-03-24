import express from "express";
import { authorizeAccessToken, authorizeAdminRole } from "../../middlewares/auth";
import { adminSecret } from "../../lib/jwt_secret";
import {
    createCustomerByAdmin,
    deleteCustomerAccountByAdmin,
    getCustomerProfileByAdmin,
    getCustomersListByAdmin,
    toggleCustomerStatus,
    updateCustomerProfileByAdmin,
} from "../../controllers/admin/customer.controller";
const router = express.Router();

router.post("/", authorizeAccessToken(adminSecret), authorizeAdminRole("superadmin", "admin"), createCustomerByAdmin);

router.put(
    "/:id",
    authorizeAccessToken(adminSecret),
    authorizeAdminRole("superadmin", "admin"),
    updateCustomerProfileByAdmin
);

router.get("/", authorizeAccessToken(adminSecret), getCustomersListByAdmin);

router.get("/:id", authorizeAccessToken(adminSecret), getCustomerProfileByAdmin);

router.delete(
    "/:id",
    authorizeAccessToken(adminSecret),
    authorizeAdminRole("superadmin", "admin"),
    deleteCustomerAccountByAdmin
);

router.put(
    "/status",
    authorizeAccessToken(adminSecret),
    authorizeAdminRole("superadmin", "admin"),
    toggleCustomerStatus
);

export default router;
