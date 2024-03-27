"use strict";
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
exports.getProductFilters = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const splitQuery_1 = __importDefault(require("../../utils/splitQuery"));
const Product_model_1 = __importDefault(require("../../models/Product.model"));
exports.getProductFilters = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { attributes, colors, collections, price } = req.query;
    const query = {};
    if (attributes) {
        const _attrs = (0, splitQuery_1.default)(attributes);
        query["attributes.subcategory"] = {
            $in: _attrs,
        };
    }
    if (collections) {
        const _collections = (0, splitQuery_1.default)(collections);
        query["collections"] = {
            $in: _collections,
        };
    }
    if (colors) {
        const _colors = (0, splitQuery_1.default)(colors);
        query["colors"] = {
            $in: _colors,
        };
    }
    try {
        const [colors, attributes] = yield Promise.all([
            Product_model_1.default.aggregate([
                { $match: query },
                { $unwind: "$colors" },
                {
                    $lookup: {
                        from: "colors",
                        localField: "colors",
                        foreignField: "_id",
                        as: "color",
                    },
                },
                { $unwind: "$color" },
                {
                    $group: {
                        _id: "$color._id",
                        name: { $first: "$color.name" },
                        hex: { $first: "$color.hex" },
                    },
                },
            ]),
            Product_model_1.default.aggregate([
                { $match: query },
                { $unwind: "$attributes" },
                { $unwind: "$attributes.subcategory" },
                {
                    $lookup: {
                        from: "categories",
                        localField: "attributes.category",
                        foreignField: "_id",
                        as: "attributes.category",
                    },
                },
                {
                    $lookup: {
                        from: "subcategories",
                        localField: "attributes.subcategory",
                        foreignField: "_id",
                        as: "attributes.subcategory",
                    },
                },
                { $unwind: "$attributes.category" },
                { $unwind: "$attributes.subcategory" },
                {
                    $group: {
                        _id: "$attributes.category._id",
                        name: { $first: "$attributes.category.name" },
                        subcategories: {
                            $addToSet: {
                                _id: "$attributes.subcategory._id",
                                name: "$attributes.subcategory.name",
                            },
                        },
                    },
                },
            ]),
        ]);
        const sortedAttributes = attributes.sort((a, b) => a.name.localeCompare(b.name));
        const sortedColors = colors.sort((a, b) => a.name.localeCompare(b.name));
        res.json({
            success: true,
            filterOptions: {
                attributes: sortedAttributes,
                colors: sortedColors,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
