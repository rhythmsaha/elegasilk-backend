"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const validator_1 = __importDefault(require("validator"));
const AddressSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "Customer",
    },
    firstName: {
        type: String,
        required: [true, "Please provide your first name"],
        validate: [validator_1.default.isAlpha, "Please provide a valid first name"],
        minlength: [2, "First name must be at least 2 characters long"],
        maxlength: [50, "First name must be at most 50 characters long"],
        lowercase: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: [true, "Please provide your last name"],
        validate: [validator_1.default.isAlpha, "Please provide a valid last name"],
        minlength: [2, "Last name must be at least 2 characters long"],
        maxlength: [50, "Last name must be at most 50 characters long"],
        lowercase: true,
        trim: true,
    },
    mobile: {
        type: String,
        required: [true, "Please provide your phone number"],
        trim: true,
    },
    alternativeMobile: {
        type: String,
        trim: true,
    },
    houseNo: {
        type: String,
        required: [true, "Please provide your house number"],
        trim: true,
    },
    street: {
        type: String,
        required: [true, "Please provide your street"],
        trim: true,
    },
    landmark: {
        type: String,
        trim: true,
    },
    city: {
        type: String,
        required: [true, "Please provide your city"],
        trim: true,
    },
    state: {
        type: String,
        required: [true, "Please provide your state"],
        trim: true,
    },
    pincode: {
        type: String,
        required: [true, "Please provide your pincode"],
        trim: true,
    },
    isDefault: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
const Address = (0, mongoose_1.model)("Address", AddressSchema);
exports.default = Address;
