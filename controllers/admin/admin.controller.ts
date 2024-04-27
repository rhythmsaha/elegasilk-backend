import asyncHandler from "express-async-handler";
import { IAdmin } from "../../models/Admin.model";
import ErrorHandler from "../../utils/ErrorHandler";
import AdminService from "../../services/AdminService";
import { Request, Response, NextFunction } from "express";
import { ICreateAdminInput, ILoginAdminInput } from "../../types/typings";

export const registerNewAdmin = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      firstName,
      lastName,
      username,
      email,
      password,
      role,
      avatar,
      status,
    }: ICreateAdminInput = req.body;

    // Check user role
    const adminRole = req.admin?.role || "moderator";

    const rolePermissions = {
      superadmin: ["superadmin", "admin", "moderator"],
      admin: ["moderator"],
      moderator: [],
    };

    if (!rolePermissions[adminRole].includes(role as never)) {
      throw new ErrorHandler(
        `A ${adminRole} is not allowed to create a ${role}`,
        403
      );
    }

    // Create new admin
    const admin = await AdminService.createAdmin({
      firstName,
      lastName,
      username,
      email,
      password,
      role,
      avatar,
      status,
    });

    res.status(201).json({
      success: true,
      message: `User created successfully`,
      user: admin,
    });
  }
);

export const loginAdmin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { username, password }: ILoginAdminInput = req.body;

    if (!username || !password)
      return next(
        new ErrorHandler("Please provide username and password", 400)
      );

    const session = await AdminService.login(username, password);

    res.status(200).json(session);
  }
);

export const getAdminSession = asyncHandler(
  async (req: Request, res: Response) => {
    // Get User id from admin object in request
    const adminId = req.admin?._id;

    // get session
    const session = await AdminService.refreshSession(adminId);

    // Send response
    res.status(200).json(session);
  }
);

export const updateSelfProfile = asyncHandler(
  async (req: Request, res: Response) => {
    // Get admin id from admin object in request
    const adminId = req.admin?._id;
    // Get fields to update from body {firstName, lastName, username, email, avatar}
    const { firstName, lastName, username, email, avatar }: IAdmin = req.body;

    const updatedAdmin = await AdminService.updateProfile(adminId, {
      firstName,
      lastName,
      username,
      email,
      avatar,
    });

    // Send response
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedAdmin,
    });
  }
);

export const deleteSelfProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const adminId = req.admin?._id;

    await AdminService.deleteAdmin(adminId);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  }
);

export const updateSelfPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const adminId = req.admin?._id;

    const { currentPassword, newPassword } = req.body;

    const session = await AdminService.updatePassword(
      adminId,
      currentPassword,
      newPassword
    );

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
      session,
    });
  }
);

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const emailOrUsername = req.params.query;

    if (!emailOrUsername) {
      return next(new ErrorHandler("Please provide email or username", 400));
    }

    const token = await AdminService.sendPasswordResetEmail(emailOrUsername);

    res.status(200).json({
      success: true,
      message: "Password reset code sent to email",
      token,
    });
  }
);

export const verifyResetPasswordCode = asyncHandler(
  async (req: Request, res: Response) => {
    const { token, code } = req.body;

    const sessionData = await AdminService.verifyPasswordResetCode(token, code);

    res.status(200).json({
      success: true,
      message: "code verified",
      data: {
        code: sessionData.code,
        token: sessionData.token,
      },
    });
  }
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token, code, newPassword } = req.body;

    if (!token) return next(new ErrorHandler("Please provide token", 400));
    if (!code) return next(new ErrorHandler("Please provide code", 400));
    if (!newPassword)
      return next(new ErrorHandler("Please provide new password", 400));

    await AdminService.resetPassword(token, code, newPassword);

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  }
);

// ------------------------------------------------------------------

// Update an admin user.
export const updateAdminUser = asyncHandler(
  async (req: Request, res: Response) => {
    let { firstName, lastName, username, email, role, avatar, status }: IAdmin =
      req.body;

    const requestedUserRole = req.admin?.role;
    const requestedUserId = req.admin?._id;

    const existingUserId = req.params.id;

    if (requestedUserId === existingUserId)
      throw new ErrorHandler("Access Denied!", 403);

    const existingUserRole = await AdminService.getRole(existingUserId);

    if (requestedUserRole === "superadmin") {
      const updatedUser = await AdminService.updateProfile(existingUserId, {
        firstName,
        lastName,
        username,
        email,
        role,
        avatar,
        status,
      });

      res.status(200).json({
        success: true,
        message: "User updated successfully",
        user: updatedUser,
      });

      return;
    } else if (
      requestedUserRole === "admin" &&
      existingUserRole === "moderator"
    ) {
      const updatedUser = await AdminService.updateProfile(existingUserId, {
        firstName,
        lastName,
        username,
        email,
        avatar,
        status,
      });

      res.status(200).json({
        success: true,
        message: "User updated successfully",
        user: updatedUser,
      });

      return;
    } else {
      throw new ErrorHandler("Access Denied!", 403);
    }
  }
);

export const deleteAdmin = asyncHandler(async (req: Request, res: Response) => {
  const requestedUserRole = req.admin?.role;
  const requestedUserId = req.admin?._id;
  const existingUserId = req.params.id;

  if (requestedUserId === existingUserId)
    throw new ErrorHandler("Access Denied!", 403);

  const existingUserRole = await AdminService.getRole(existingUserId);

  if (existingUserRole === "superadmin" && requestedUserRole !== "superadmin") {
    throw new ErrorHandler("Access Denied!", 403);
  }

  if (requestedUserRole === "admin" && existingUserRole === "admin") {
    throw new ErrorHandler("Access Denied!", 403);
  }

  if (requestedUserRole === "moderator") {
    throw new ErrorHandler("Access Denied!", 403);
  }

  // Delete admin
  await AdminService.deleteAdmin(existingUserId);

  // Send response
  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

export const getAllAdmins = asyncHandler(
  async (req: Request, res: Response) => {
    const requestedUserRole = req.admin?.role;

    // only super admin can get all admins
    if (requestedUserRole === "superadmin") {
      const users = await AdminService.getAllUsers();

      res.status(200).json({
        success: true,
        users,
      });
    } else if (requestedUserRole === "admin") {
      const users = await AdminService.getModerators();

      res.status(200).json({
        success: true,
        users,
      });
    } else {
      throw new ErrorHandler("Access Denied!", 403);
    }
  }
);

export const getAdmin = asyncHandler(async (req: Request, res: Response) => {
  const requestedUserRole = req.admin?.role;
  const existingUserId = req.params.id;

  const user = await AdminService.getAdminProfile(existingUserId);

  if (requestedUserRole === "admin" && user.role !== "moderator") {
    throw new ErrorHandler("Access Denied!", 403);
  }

  res.status(200).json({
    success: true,
    user,
  });
});
