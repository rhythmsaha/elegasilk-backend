"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const RatingSchema = new mongoose_1.default.Schema({
    productId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    customerId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Customer",
    },
    title: {
        type: String,
    },
    review: {
        type: String,
    },
    rating: {
        type: Number,
        required: true,
    },
});
const Rating = mongoose_1.default.model("Rating", RatingSchema);
exports.default = Rating;
