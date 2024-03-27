"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const splitQuery = (query) => {
    return query.split(",").map((item) => new mongoose_1.default.Types.ObjectId(item));
};
exports.default = splitQuery;
