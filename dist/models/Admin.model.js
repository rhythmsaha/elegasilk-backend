"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const mongoose_1 = __importStar(require("mongoose"));
const validator_1 = __importDefault(require("validator"));
const AdminSchema = new mongoose_1.Schema({
    firstName: {
        type: String,
        required: [true, "Please provide your first name"],
        validate: [validator_1.default.isAlpha, "Please provide a valid first name"],
        minlength: [2, "First name must be at least 2 characters long"],
        maxlength: [50, "First name must be at most 50 characters long"],
        trim: true,
    },
    lastName: {
        type: String,
        required: [true, "Please provide your last name"],
        validate: [validator_1.default.isAlpha, "Please provide a valid last name"],
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
        validate: [validator_1.default.isEmail, "Please provide a valid email address"],
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
        validate: [validator_1.default.isURL, "Please provide a valid URL"],
    },
}, {
    timestamps: true,
});
// Encrypting password before saving user
AdminSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified("hashed_password"))
            return next();
        const salt = process.env.PASSWORD_HASH_SALT;
        this.hashed_password = yield crypto_1.default.pbkdf2Sync(this.hashed_password, salt, 1000, 64, "sha512").toString("hex");
        next();
    });
});
// Compare user password with hashed password in database
AdminSchema.methods.comparePassword = function (enteredPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        const hashedPassword = yield crypto_1.default.pbkdf2Sync(enteredPassword, process.env.PASSWORD_HASH_SALT, 1000, 64, "sha512").toString("hex");
        return this.hashed_password === hashedPassword;
    });
};
// Sign Access Token
AdminSchema.methods.signAccessToken = function () {
    return jsonwebtoken_1.default.sign({ id: this._id }, process.env.ADMIN_ACCESS_TOKEN_JWT_SECRET, { expiresIn: "1d" });
};
const Admin = mongoose_1.default.model("Admin", AdminSchema);
exports.default = Admin;
