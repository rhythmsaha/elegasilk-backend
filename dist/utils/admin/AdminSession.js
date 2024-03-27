"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Admin_model_1 = __importDefault(require("../../models/Admin.model"));
class AdminSession {
    constructor(id, firstName, lastName, username, email, role, avatar, status) {
        this._id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;
        this.email = email;
        this.role = role;
        this.avatar = avatar;
        this.status = status;
    }
    static from(admin) {
        return new AdminSession(admin._id, admin.firstName, admin.lastName, admin.username, admin.email, admin.role, admin.avatar, admin.status);
    }
    createProfile() {
        return {
            _id: this._id,
            firstName: this.firstName,
            lastName: this.lastName,
            username: this.username,
            email: this.email,
            role: this.role,
            avatar: this.avatar,
            status: this.status,
        };
    }
    createSession() {
        const userdata = this.createProfile();
        const session = {
            user: userdata,
            accessToken: new Admin_model_1.default({ _id: userdata._id, role: userdata.role }).signAccessToken(),
        };
        return session;
    }
    get loginSession() {
        const session = this.createSession();
        const message = "Login successful";
        const success = true;
        return Object.assign({ success, message }, session);
    }
    get refreshTokenSession() {
        const session = this.createSession();
        const message = "Token refreshed";
        const success = true;
        return Object.assign({ success, message }, session);
    }
    get updateProfileSession() {
        const user = this.createProfile();
        const message = "Profile updated successfully";
        const success = true;
        return { success, message, user };
    }
    get adminProfile() {
        return this.createProfile();
    }
}
exports.default = AdminSession;
