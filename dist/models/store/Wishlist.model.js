"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const WishlistSchema = new mongoose_1.default.Schema({
    userId: { type: String, required: true, unique: true, index: true },
    products: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Product" }],
    total: { type: Number, default: 0 },
}, { timestamps: true });
const Wishlist = mongoose_1.default.model("Wishlist", WishlistSchema);
exports.default = Wishlist;
