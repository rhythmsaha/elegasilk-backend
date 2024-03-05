import crypto from "crypto";
import mongoose, { Document, Schema, Model, ObjectId } from "mongoose";

export interface IVerificationToken extends Document {
    token: string;
    userId: ObjectId;
    expireAt: Date;

    // Methods
    createVerificationToken: (userId: ObjectId) => void;
    verifyToken: (token: string) => boolean;
}

const VerificationTokenSchema = new Schema<IVerificationToken>(
    {
        token: {
            type: String,
            required: true,
        },

        userId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Customer",
        },

        expireAt: {
            type: Date,
            default: Date.now,
            index: { expires: "1h" },
        },
    },

    { timestamps: true }
);

VerificationTokenSchema.methods.createVerificationToken = function (userId: ObjectId) {
    const token = crypto.randomBytes(16).toString("hex");
    return token;
};

VerificationTokenSchema.methods.verifyToken = function (token: string) {
    return this.token === token;
};

const VerificationToken: Model<IVerificationToken> = mongoose.model("VerificationToken", VerificationTokenSchema);
export default VerificationToken;
