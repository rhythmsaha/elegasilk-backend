import express from "express";
import { authorizeAccessToken, authorizeAdminRole } from "../middlewares/auth";
import {
    deleteAdmin,
    deleteSelfProfile,
    forgotPassword,
    getAdmin,
    getAdminSession,
    getAllAdmins,
    loginAdmin,
    logoutAdmin,
    registerNewAdmin,
    resetPassword,
    updateAdminUser,
    updateSelfPassword,
    updateSelfProfile,
    verifyResetPasswordCode,
} from "../controllers/admin.controller";
import { Secret } from "jsonwebtoken";
require("dotenv").config();

const adminRouter = express.Router();

const adminSecret = process.env.ADMIN_ACCESS_TOKEN_JWT_SECRET as Secret;

// Register new admin -> /api/admin/create-new
adminRouter.post(
    "/create-new",
    authorizeAccessToken(adminSecret),
    authorizeAdminRole("superadmin", "admin"),
    registerNewAdmin
);

// Login admin -> /api/admin/login -> post
adminRouter.post("/login", loginAdmin);

// logout admin -> /api/admin/logout -> post
adminRouter.post("/logout", authorizeAccessToken(adminSecret), logoutAdmin);

// get current admin session -> /api/admin/session -> get
adminRouter.get("/session", authorizeAccessToken(adminSecret), getAdminSession);

// Update logged in admin User profile -> /api/admin/user -> put
adminRouter.put("/user", authorizeAccessToken(adminSecret), updateSelfProfile);

// delete logged in admin User profile -> /api/admin/user -> delete
adminRouter.delete("/user", authorizeAccessToken(adminSecret), deleteSelfProfile);

// update logged in admin User password -> /api/admin/password -> put
adminRouter.put("/password", authorizeAccessToken(adminSecret), updateSelfPassword);

// forgot password -> /api/admin/forgot-password/:query -> get
adminRouter.get("/forget-password", forgotPassword);

// verifyResetPasswordCode -> /api/admin/reset-password -> post
adminRouter.post("/reset-password", verifyResetPasswordCode);

// reset password -> /api/admin/reset-password -> put
adminRouter.put("/reset-password", resetPassword);

// Update admin user -> /api/admin/user/:id
adminRouter.put(
    "/user/:id",
    authorizeAccessToken(adminSecret),
    authorizeAdminRole("superadmin", "admin"),
    updateAdminUser
);

// delete admin user -> /api/admin/user/:id -> delete
adminRouter.delete(
    "/user/:id",
    authorizeAccessToken(adminSecret),
    authorizeAdminRole("superadmin", "admin"),
    deleteAdmin
);

// get all admin users -> /api/admin/users  -> get
adminRouter.get("/users", authorizeAccessToken(adminSecret), authorizeAdminRole("superadmin", "admin"), getAllAdmins);

// get single admin user -> /api/admin/user/:id -> get
adminRouter.get("/user/:id", authorizeAccessToken(adminSecret), authorizeAdminRole("superadmin", "admin"), getAdmin);

export default adminRouter;
