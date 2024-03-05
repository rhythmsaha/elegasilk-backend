import jwt, { Secret } from "jsonwebtoken";
import crypto from "crypto";
import mongoose, { Document, Schema, Model, ObjectId } from "mongoose";
import validator from "validator";

export interface ICustomer extends Document {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    hashed_password: string;
    status: boolean;
    verified: boolean;
    createdAt?: Date;
    updatedAt?: Date;

    cartId: ObjectId;
    wishlistId: ObjectId;
    adresses: ObjectId[];
    orders: ObjectId[];

    // Methods
    comparePassword: (enteredPassword: string) => Promise<boolean>;
    signAccessToken: () => string;
}

const CustomerSchema = new Schema<ICustomer>(
    {
        firstName: {
            type: String,
            required: [true, "Please provide your first name"],
            validate: [validator.isAlpha, "Please provide a valid first name"],
            minlength: [2, "First name must be at least 2 characters long"],
            maxlength: [50, "First name must be at most 50 characters long"],
            lowercase: true,
            trim: true,
        },

        lastName: {
            type: String,
            required: [true, "Please provide your last name"],
            validate: [validator.isAlpha, "Please provide a valid last name"],
            minlength: [2, "Last name must be at least 2 characters long"],
            maxlength: [50, "Last name must be at most 50 characters long"],
            lowercase: true,
            trim: true,
        },

        email: {
            type: String,
            required: [true, "Please provide an email address"],
            validate: [validator.isEmail, "Please provide a valid email address"],
            lowercase: true,
            trim: true,
            index: true,
            unique: true,
        },

        hashed_password: {
            type: String,
            required: [true, "Please provide a password"],
            minlength: [8, "Password must be at least 8 characters long"],
            select: false,
        },

        status: {
            type: Boolean,
            default: true,
        },

        verified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Encrypt Password before saving to database
CustomerSchema.pre<ICustomer>("save", async function (next) {
    if (!this.isModified("hashed_password")) return next();
    const salt = process.env.CUSTOMER_PWD_SALT;
    this.hashed_password = crypto.pbkdf2Sync(this.hashed_password, salt!, 1000, 64, "sha512").toString("hex");
    next();
});

// Compare password
CustomerSchema.methods.comparePassword = async function (enteredPassword: string) {
    return crypto.pbkdf2Sync(enteredPassword, process.env.CUSTOMER_PWD_SALT!, 1000, 64, "sha512").toString("hex") === this.hashed_password;
};

// Sign Access Token
CustomerSchema.methods.signAccessToken = function () {
    return jwt.sign({ id: this._id }, process.env.CUSTOMER_JWT_SECRET as Secret, { expiresIn: process.env.CUSTOMER_JWT_EXPIRESIN });
};

// Get Customer Profile
CustomerSchema.methods.getCustomerProfile = function () {
    return {
        _id: this._id,
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        status: this.status,
        verified: this.verified,
    };
};

const Customer: Model<ICustomer> = mongoose.model("Customer", CustomerSchema);
export default Customer;
