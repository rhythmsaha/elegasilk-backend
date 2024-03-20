import { ObjectId, Schema, model } from "mongoose";
import validator from "validator";

export interface IAddress extends Document {
    userId: ObjectId;
    firstName: string;
    lastName: string;
    mobile: string;
    alternativeMobile?: string;

    houseNo: string;
    street: string;

    landmark?: string;
    city: string;
    state: string;
    pincode: string;
    isDefault?: boolean;
}

const AddressSchema = new Schema<IAddress>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Customer",
        },

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
    },
    {
        timestamps: true,
    }
);

const Address = model<IAddress>("Address", AddressSchema);
export default Address;
