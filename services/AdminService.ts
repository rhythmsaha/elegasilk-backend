import validator from "validator";
import Admin, { IAdmin } from "../models/Admin.model";
import { ICreateAdminInput, IUpdateAdminInput } from "../types/typings";
import ErrorHandler from "../utils/ErrorHandler";
import { validateStrongPassword } from "../utils/validate";
import verificationService from "./VerificationService";

interface AdminExistsProps {
    username: string;
    email?: string;
}

class AdminService {
    _id: IAdmin["_id"];
    firstName: IAdmin["firstName"];
    lastName: IAdmin["lastName"];
    username: IAdmin["username"];
    email?: IAdmin["email"];
    role: IAdmin["role"];
    avatar: IAdmin["avatar"];
    status: IAdmin["status"];
    createdAt?: IAdmin["createdAt"];
    updatedAt?: IAdmin["updatedAt"];

    static accessToken: string;

    constructor(
        id: IAdmin["_id"],
        firstName: IAdmin["firstName"],
        lastName: IAdmin["lastName"],
        username: IAdmin["username"],
        email: IAdmin["email"],
        role: IAdmin["role"],
        avatar: IAdmin["avatar"],
        status: IAdmin["status"]
    ) {
        this._id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;
        this.email = email;
        this.role = role;
        this.avatar = avatar;
        this.status = status;
    }

    static from(admin: IAdmin): AdminService {
        return new AdminService(
            admin._id,
            admin.firstName,
            admin.lastName,
            admin.username,
            admin.email,
            admin.role,
            admin.avatar,
            admin.status
        );
    }

    private static async getAdminById(id: string) {
        const admin = await Admin.findById(id).select("+hashed_password");
        if (!admin) throw new ErrorHandler("Admin not found", 404);
        return admin;
    }

    private static async getAdminByUsername(username: string) {
        const admin = await Admin.findOne({ username }).select("+hashed_password");
        if (!admin) throw new ErrorHandler("Admin not found", 404);
        return admin;
    }

    private static async checkIfAdminExists({ username, email }: AdminExistsProps): Promise<boolean> {
        const adminExists = await Admin.exists({ $or: [{ username }, { email }] });
        if (adminExists && adminExists._id) return true;
        return false;
    }

    private static async getAdminWithUsernameOrEmail(usernameOrEmail: string) {
        // validate if email or username is valid
        if (!validator.isEmail(usernameOrEmail) && !validator.isAlphanumeric(usernameOrEmail)) {
            throw new ErrorHandler("Please provide valid email or username", 400);
        }

        const admin = await Admin.findOne({ $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }] }).select(
            "+hashed_password"
        );

        if (!admin) throw new ErrorHandler("Admin not found", 404);

        return admin;
    }

    private static checkProfileEnabled(admin: IAdmin) {
        if (!admin.status) throw new ErrorHandler("Your account is not active. Please contact your administrator", 401);
    }

    public static async createAdmin(admininput: ICreateAdminInput) {
        const { username, email, password, firstName, lastName, role, status, avatar } = admininput;

        validateStrongPassword(password);

        const adminExists = await this.checkIfAdminExists({ username, email });

        if (adminExists) {
            throw new ErrorHandler("Admin already exists", 400);
        }

        const admin = await Admin.create({
            firstName: firstName.toLowerCase(),
            lastName: lastName.toLowerCase(),
            username: username.toLowerCase(),
            email: email?.toLowerCase(),
            hashed_password: password,
            role,
            avatar,
            status,
        });

        const profileData = this.from(admin).createProfile();

        return profileData;
    }

    public static async login(username: string, password: string) {
        const admin = await this.getAdminByUsername(username);
        if (!admin) throw new ErrorHandler("Invalid credentials!", 401);

        this.checkProfileEnabled(admin);

        const isPasswordMatch = await admin.comparePassword(password);

        if (!isPasswordMatch) {
            throw new ErrorHandler("Invalid credentials!", 401);
        }

        const session = this.from(admin).createSession();
        const message = "Login successful";
        const success = true;
        return { success, message, ...session };
    }

    public static async refreshSession(id: string) {
        const admin = await this.getAdminById(id);
        this.checkProfileEnabled(admin);

        const session = this.from(admin).createSession();
        const message = "Session refreshed";
        const success = true;
        return { success, message, ...session };
    }

    private createProfile() {
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

    private createSession() {
        const userdata = this.createProfile();

        const session = {
            user: userdata,
            accessToken: new Admin({ _id: userdata._id, role: userdata.role }).signAccessToken(),
        };

        return session;
    }

    private get fullProfile() {
        return {
            _id: this._id,
            fullName: `${this.firstName} ${this.lastName}`,
            firstName: this.firstName,
            lastName: this.lastName,
            username: this.username,
            email: this.email,
            role: this.role,
            avatar: this.avatar,
            status: this.status,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }

    get profile() {
        return this.createProfile();
    }

    public static async getRole(id: string) {
        const user = await this.getAdminById(id);
        return user.role;
    }

    public static async updateProfile(id: string, data: IUpdateAdminInput) {
        const { firstName, lastName, username, email, avatar, role, password, status } = data;

        if (password) {
            validateStrongPassword(password);
        }

        const payload: any = {};
        if (firstName) payload.firstName = firstName?.toLowerCase();
        if (lastName) payload.lastName = lastName.toLowerCase();
        if (username) payload.username = username.toLowerCase();
        if (email) payload.email = email.toLowerCase();
        if (avatar) payload.avatar = avatar;
        if (role) payload.role = role;
        if (password) payload.hashed_password = password;
        if (status) payload.status = status;

        const updateAdmin = await Admin.findByIdAndUpdate(id, payload, { new: true });

        if (!updateAdmin) throw new ErrorHandler("Failed to update admin!", 500);

        const user = this.from(updateAdmin).createProfile();
        return user;
    }

    public static async deleteAdmin(id: string) {
        const admin = await this.getAdminById(id);
        if (!admin) throw new ErrorHandler("Admin not found", 404);

        const deletedAdmin = await Admin.findByIdAndDelete(id);

        if (!deletedAdmin) throw new ErrorHandler("Failed to delete admin!", 500);

        return deletedAdmin;
    }

    public static async updatePassword(id: string, password: string, newPassword: string) {
        const admin = await this.getAdminById(id);
        const isPasswordMatch = await admin.comparePassword(password);
        if (!isPasswordMatch) throw new ErrorHandler("Current password is incorrect", 400);

        await this.updateProfile(id, { password: newPassword });
        const session = this.from(admin).createSession();

        return session;
    }

    public static async sendPasswordResetEmail(payload: string) {
        const user = await this.getAdminWithUsernameOrEmail(payload);
        const { code, token } = await verificationService.createUserIdVerificationCode(user._id);

        // send email with code

        return token;
    }

    public static async verifyPasswordResetCode(token: string, code: string) {
        const session = await verificationService.verifyUserIdVerificationCode(token, code);
        return session;
    }

    public static async resetPassword(token: string, code: string, newPassword: string) {
        const session = await this.verifyPasswordResetCode(token, code);
        const profile = await this.updateProfile(session.userId, {
            password: newPassword,
        });

        return profile;
    }

    public static async getAdminProfile(id: string) {
        const admin = await this.getAdminById(id);
        const user = this.from(admin).profile;
        return user;
    }

    public static async getAllUsers() {
        const admins = await Admin.find();
        if (!admins) throw new ErrorHandler("No admin found", 404);
        const users = admins.map((admin) => this.from(admin).fullProfile);
        return users;
    }

    public static async getModerators() {
        const users = await Admin.find({ role: "moderator" });
        if (!users) throw new ErrorHandler("No moderator found", 404);
        const moderators = users.map((admin) => this.from(admin).fullProfile);
        return moderators;
    }
}

export default AdminService;
