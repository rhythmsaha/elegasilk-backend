import mongoose, { Document, Models, Schema } from "mongoose";
import { Model } from "mongoose";

export interface IVerificationCode extends Document {
    code: string;
    expireAt: Date;

    verifyCode: (code: string) => boolean;
}

const verificationCode = new Schema<IVerificationCode>({
    code: {
        type: String,
        required: true,
    },

    expireAt: {
        type: Date,
        default: Date.now(),
        index: { expires: "1h" },
    },
});

verificationCode.methods.verifyCode = function (code: string) {
    return this.code === code;
};

const VerificationCode: Model<IVerificationCode> = mongoose.model(
    "VerificationCode",
    verificationCode
);

export default VerificationCode;
