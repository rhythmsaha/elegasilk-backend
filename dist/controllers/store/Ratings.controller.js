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
exports.getRatings = exports.addRating = exports.checkIfPurchased = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Order_model_1 = __importDefault(require("../../models/store/Order.model"));
const Ratings_model_1 = __importDefault(require("../../models/store/Ratings.model"));
const ErrorHandler_1 = __importDefault(require("../../utils/ErrorHandler"));
const mongoose_1 = __importDefault(require("mongoose"));
const Product_model_1 = __importDefault(require("../../models/Product.model"));
exports.checkIfPurchased = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customerId = req.customer._id;
    const productId = req.params.productId;
    const order = yield Order_model_1.default.findOne({
        userId: customerId,
        "items.productId._id": productId,
    });
    if (!order) {
        res.status(200).json({
            success: true,
            eligible: false,
            message: "Product Not Purchased",
        });
    }
    else {
        const ratings = yield Ratings_model_1.default.findOne({
            productId: productId,
            customerId: customerId,
        });
        if (ratings) {
            res.status(200).json({
                success: true,
                eligible: false,
                message: "Product already rated",
            });
            return;
        }
        res.status(200).json({
            success: true,
            eligible: true,
            message: "Product purchased",
        });
    }
}));
exports.addRating = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customerId = req.customer._id;
    const productId = req.body.productId;
    const rating = req.body.rating;
    const review = req.body.review;
    const title = req.body.title;
    if (!productId || !rating) {
        res.status(400);
        throw new Error("Invalid request");
    }
    if (rating < 1 || rating > 5) {
        res.status(400);
        throw new Error("Rating must be between 1 and 5");
    }
    try {
        const product = yield Product_model_1.default.findById(productId);
        if (!product) {
            res.status(404);
            throw new Error("Product not found");
        }
        const findCustomerId = product.ratings.find((r) => r.user.toString() === customerId.toString());
        if (findCustomerId) {
            res.status(400);
            throw new Error("You have already rated this product");
        }
        const newRating = new Ratings_model_1.default({
            productId: productId,
            customerId: customerId,
            rating: rating,
            title: title,
            review: review,
        });
        yield newRating.save();
        product.ratings.push({
            user: customerId,
            rating: rating,
        });
        product.save();
        res.status(201).json({
            success: true,
            message: "Rating added successfully",
            rating: newRating,
        });
    }
    catch (error) {
        res.status(500);
        next(new ErrorHandler_1.default(error.message, 500));
    }
}));
exports.getRatings = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const productId = req.params.id;
    const cardOnly = req.query.cardOnly;
    if (cardOnly) {
        const ratings = yield Ratings_model_1.default.aggregate([
            { $match: { productId: new mongoose_1.default.Types.ObjectId(productId) } },
            { $group: { _id: "$rating", count: { $sum: 1 } } },
        ]);
        const averageRating = ratings.reduce((acc, rating) => acc + rating.rating, 0) / ratings.length;
        // Calculate total number of ratings
        const totalRatings = ratings.length;
        res.json({
            success: true,
            data: {
                averageRating,
                totalRatings,
            },
        });
    }
    else {
        const [ratings, groupedRatings] = yield Promise.all([
            Ratings_model_1.default.find({ productId: productId }).populate({
                path: "customerId",
                select: "firstName lastName",
            }),
            Ratings_model_1.default.aggregate([
                { $match: { productId: new mongoose_1.default.Types.ObjectId(productId) } },
                { $group: { _id: "$rating", count: { $sum: 1 } } },
            ]),
        ]);
        // Calculate average rating
        const averageRating = ratings.reduce((acc, rating) => acc + rating.rating, 0) / ratings.length;
        // Calculate total number of ratings
        const totalRatings = ratings.length;
        let allStars = Array.from({ length: 5 }, (_, i) => ({ star: i + 1, count: 0 }));
        // Fill in the counts from groupedRatings
        const ratingsBreakdown = allStars.map((star) => {
            const found = groupedRatings.find((group) => group._id === star.star);
            return found ? { star: star.star, count: found.count } : star;
        });
        res.json({
            success: true,
            data: {
                averageRating,
                totalRatings,
                ratings,
                ratingsBreakdown,
            },
        });
    }
}));
