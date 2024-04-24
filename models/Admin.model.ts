import jwt, { Secret } from "jsonwebtoken";
import crypto from "crypto";
import mongoose, { Document, Schema, Model } from "mongoose";
import validator from "validator";

export interface IAdmin extends Document {
    firstName: string;
    lastName: string;
    username: string;
    email?: string;
    hashed_password: string;
    role: "moderator" | "admin" | "superadmin";
    status: boolean;
    avatar?: string;
    createdAt?: Date;
    updatedAt?: Date;

    // Methods
    comparePassword: (enteredPassword: string) => Promise<boolean>;
    signAccessToken: () => string;
}

const AdminSchema = new Schema<IAdmin>(
    {
        firstName: {
            type: String,
            required: [true, "Please provide your first name"],
            validate: [validator.isAlpha, "Please provide a valid first name"],
            minlength: [2, "First name must be at least 2 characters long"],
            maxlength: [50, "First name must be at most 50 characters long"],
            trim: true,
        },
        lastName: {
            type: String,
            required: [true, "Please provide your last name"],
            validate: [validator.isAlpha, "Please provide a valid last name"],
            minlength: [2, "Last name must be at least 2 characters long"],
            maxlength: [50, "Last name must be at most 50 characters long"],
            trim: true,
        },

        username: {
            type: String,
            required: [true, "Please provide a username"],
            minlength: [4, "Username must be at least 4 characters long"],
            maxlength: [50, "Username must be at most 50 characters long"],
            trim: true,
            unique: true,
            index: true,
        },

        email: {
            type: String,
            validate: [validator.isEmail, "Please provide a valid email address"],
            trim: true,
            index: true,
        },

        hashed_password: {
            type: String,
            required: [true, "Please provide a password"],
            minlength: [8, "Password must be at least 8 characters long"],
            maxlength: [50, "Password must be at most 50 characters long"],
            select: false,
        },

        role: {
            type: String,
            enum: ["moderator", "admin", "superadmin", "guest"],
            default: "moderator",
        },

        status: {
            type: Boolean,
            default: true,
        },

        avatar: {
            type: String,
            validate: [validator.isURL, "Please provide a valid URL"],
        },
    },
    {
        timestamps: true,
    }
);

// Encrypting password before saving user
AdminSchema.pre<IAdmin & { salt?: string }>("save", async function (next) {
    if (!this.isModified("hashed_password")) return next();

    const salt = process.env.PASSWORD_HASH_SALT;
    this.hashed_password = await crypto.pbkdf2Sync(this.hashed_password, salt!, 1000, 64, "sha512").toString("hex");
    next();
});

// Compare user password with hashed password in database
AdminSchema.methods.comparePassword = async function (enteredPassword: string) {
    const hashedPassword = await crypto
        .pbkdf2Sync(enteredPassword, process.env.PASSWORD_HASH_SALT!, 1000, 64, "sha512")
        .toString("hex");
    return this.hashed_password === hashedPassword;
};

// Sign Access Token
AdminSchema.methods.signAccessToken = function () {
    return jwt.sign({ id: this._id }, process.env.ADMIN_ACCESS_TOKEN_JWT_SECRET as Secret, { expiresIn: "1d" });
};

const Admin: Model<IAdmin> = mongoose.model("Admin", AdminSchema);
export default Admin;
