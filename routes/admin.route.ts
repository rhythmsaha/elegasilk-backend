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

const adminRouter = express.Router();

const adminSecret = process.env.ADMIN_ACCESS_TOKEN_SECRET as Secret;

// Register new admin -> /api/admin/create-new
adminRouter.post(
    "/create-new",
    authorizeAccessToken(adminSecret),
    authorizeAdminRole("superadmin", "admin"),
    registerNewAdmin
);

// Login admin -> /api/admin/login
adminRouter.post("/login", loginAdmin);

// logout admin -> /api/admin/logout
adminRouter.post("/logout", logoutAdmin);

// get current admin session -> /api/admin/session
adminRouter.get("/session", authorizeAccessToken(adminSecret), getAdminSession);

// update self profile -> /api/admin/profile
adminRouter.put("/profile", authorizeAccessToken(adminSecret), updateSelfProfile);

// delete self profile -> /api/admin/profile
adminRouter.delete("/profile", authorizeAccessToken(adminSecret), deleteSelfProfile);

// update self password -> /api/admin/password
adminRouter.put("/password", authorizeAccessToken(adminSecret), updateSelfPassword);

// forgot password -> /api/admin/forgot-password
adminRouter.post("/forgot-password", forgotPassword);

// verifyResetPasswordCode -> /api/admin/reset-password
adminRouter.post("/reset-password", verifyResetPasswordCode);

// reset password -> /api/admin/reset-password
adminRouter.put("/reset-password", resetPassword);

// Update admin user -> /api/admin/user
adminRouter.put("/user", authorizeAccessToken(adminSecret), authorizeAdminRole("superadmin", "admin"), updateAdminUser);

// delete admin user -> /api/admin/user
adminRouter.delete("/user", authorizeAccessToken(adminSecret), authorizeAdminRole("superadmin", "admin"), deleteAdmin);

// get all admin users -> /api/admin/users
adminRouter.get("/users", authorizeAccessToken(adminSecret), authorizeAdminRole("superadmin", "admin"), getAllAdmins);

// get single admin user -> /api/admin/user/:id
adminRouter.get("/user/:id", authorizeAccessToken(adminSecret), authorizeAdminRole("superadmin", "admin"), getAdmin);

export default adminRouter;
