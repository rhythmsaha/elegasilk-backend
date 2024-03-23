import asyncHandler from "express-async-handler";
import Order from "../../models/store/Order.model";
import Rating from "../../models/store/Ratings.model";
import ErrorHandler from "../../utils/ErrorHandler";
import mongoose from "mongoose";

export const checkIfPurchased = asyncHandler(async (req, res, next) => {
    const customerId = req.customer._id;
    const productId = req.params.productId;

    const order = await Order.findOne({
        userId: customerId,
        "items.productId._id": productId,
    });

    if (!order) {
        res.status(200).json({
            success: true,
            eligible: false,
            message: "Product Not Purchased",
        });
    } else {
        const ratings = await Rating.findOne({
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
});

export const addRating = asyncHandler(async (req, res, next) => {
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
        const newRating = new Rating({
            productId: productId,
            customerId: customerId,
            rating: rating,
            title: title,
            review: review,
        });

        await newRating.save();

        res.status(201).json({
            success: true,
            message: "Rating added successfully",
            rating: newRating,
        });
    } catch (error: any) {
        res.status(500);
        next(new ErrorHandler(error.message, 500));
    }
});

export const getRatings = asyncHandler(async (req, res, next) => {
    const productId = req.params.id;
    const cardOnly = req.query.cardOnly;

    if (cardOnly) {
        const ratings = await Rating.aggregate([
            { $match: { productId: new mongoose.Types.ObjectId(productId) } },
            { $group: { _id: "$rating", count: { $sum: 1 } } },
        ]);

        const averageRating = ratings.reduce((acc, rating: any) => acc + rating.rating, 0) / ratings.length;

        // Calculate total number of ratings
        const totalRatings = ratings.length;

        res.json({
            success: true,
            data: {
                averageRating,
                totalRatings,
            },
        });
    } else {
        const [ratings, groupedRatings] = await Promise.all([
            Rating.find({ productId: productId }).populate({
                path: "customerId",
                select: "firstName lastName",
            }),
            Rating.aggregate([
                { $match: { productId: new mongoose.Types.ObjectId(productId) } },
                { $group: { _id: "$rating", count: { $sum: 1 } } },
            ]),
        ]);

        // Calculate average rating
        const averageRating = ratings.reduce((acc, rating: any) => acc + rating.rating, 0) / ratings.length;

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
});
