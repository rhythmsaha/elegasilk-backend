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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const validator_1 = __importDefault(require("validator"));
const mongoose_slug_generator_1 = __importDefault(require("mongoose-slug-generator"));
mongoose_1.default.plugin(mongoose_slug_generator_1.default);
const ModelSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "Please provide a name"],
        minlength: [2, "Name must be at least 2 characters long"],
        maxlength: [50, "Name must be at most 50 characters long"],
        index: true,
        trim: true,
    },
    slug: {
        type: String,
        slug: "name",
        index: true,
    },
    description: {
        type: String,
        trim: true,
        minlength: [2, "Name must be at least 2 characters long"],
        maxlength: [500, "Name must be at most 50 characters long"],
    },
    image: {
        type: String,
        trim: true,
        validate: [validator_1.default.isURL, "Please provide a valid image URL"],
    },
    status: {
        type: Boolean,
        default: true,
    },
    category: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Category",
    },
}, { timestamps: true });
const SubCategory = mongoose_1.default.model("SubCategory", ModelSchema);
exports.default = SubCategory;
