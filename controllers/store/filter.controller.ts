import expressAsyncHandler from "express-async-handler";
import splitQuery from "../../utils/splitQuery";
import Product from "../../models/Product.model";

export const getProductFilters = expressAsyncHandler(async (req, res, next) => {
    const { attributes, colors, collections } = req.query as {
        attributes: string;
        colors: string;
        collections: string;
    };

    const query: {
        [key: string]: any;
    } = {};

    if (attributes) {
        const _attrs = splitQuery(attributes);
        query["attributes.subcategory"] = {
            $in: _attrs,
        };
    }

    if (collections) {
        const _collections = splitQuery(collections);
        query["collections"] = {
            $in: _collections,
        };
    }

    if (colors) {
        const _colors = splitQuery(colors);
        query["colors"] = {
            $in: _colors,
        };
    }

    try {
        const [colors, attributes] = await Promise.all([
            Product.aggregate([
                { $match: query },
                { $unwind: "$colors" },

                {
                    $lookup: {
                        from: "colors",
                        localField: "colors",
                        foreignField: "_id",
                        as: "colors",
                    },
                },

                { $unwind: "$colors" },

                {
                    $group: {
                        _id: "$colors._id",
                        name: { $first: "$colors.name" },
                        hex: { $first: "$colors.hex" },
                        count: { $sum: 1 },
                    },
                },

                {
                    $project: {
                        _id: 1,
                        name: 1,
                        hex: 1,
                        count: 1,
                    },
                },

                { $sort: { name: 1 } },
            ]),

            // Product.aggregate([
            //     { $unwind: "$colors" },
            //     {
            //         $facet: {
            //             colors: [
            //                 { $group: { _id: "$colors" } },
            //                 {
            //                     $lookup: {
            //                         from: "colors",
            //                         localField: "_id",
            //                         foreignField: "_id",
            //                         as: "color",
            //                     },
            //                 },

            //                 { $unwind: "$color" },

            //                 {
            //                     $group: {
            //                         _id: "$color._id",
            //                         name: {
            //                             $first: "$color.name",
            //                         },
            //                         hex: {
            //                             $first: "$color.hex",
            //                         },
            //                     },
            //                 },
            //             ],
            //             counting: [
            //                 {
            //                     $group: {
            //                         _id: "$colors",
            //                         count: { $sum: 1 },
            //                     },
            //                 },
            //             ],
            //         },
            //     },

            //     {
            //         $project: {
            //             meregeColors: {
            //                 $map: {
            //                     input: "$colors",
            //                     as: "color",
            //                     in: {
            //                         $mergeObjects: [
            //                             "$$color",
            //                             {
            //                                 $arrayElemAt: [
            //                                     {
            //                                         $filter: {
            //                                             input: "$counting",
            //                                             cond: { $eq: ["$$this._id", "$$color._id"] },
            //                                         },
            //                                     },
            //                                     0,
            //                                 ],
            //                             },
            //                         ],
            //                     },
            //                 },
            //             },
            //         },
            //     },

            //     {
            //         $unwind: "$meregeColors",
            //     },

            //     {
            //         $replaceRoot: {
            //             newRoot: "$meregeColors",
            //         },
            //     },
            // ]),

            Product.aggregate([
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
                        _id: "$attributes.subcategory._id",
                        category: { $first: "$attributes.category" },
                        name: { $first: "$attributes.subcategory.name" },
                        count: { $sum: 1 },
                    },
                },

                {
                    $project: {
                        _id: 1,
                        count: 1,
                        name: 1,
                        category_name: "$category.name",
                        category_id: "$category._id",
                    },
                },

                {
                    $group: {
                        _id: "$category_id",
                        name: { $first: "$category_name" },

                        subcategories: {
                            $addToSet: {
                                _id: "$_id",
                                name: "$name",
                                count: "$count",
                            },
                        },
                    },
                },

                {
                    $project: {
                        _id: 1,
                        name: 1,
                        subcategories: 1,
                    },
                },

                { $sort: { name: 1 } },
            ]),
        ]);

        attributes.forEach((category) => {
            category.subcategories.sort((a: any, b: any) => a.name.localeCompare(b.name));
        });

        colors.sort((a, b) => a.name.localeCompare(b.name));

        res.json({
            success: true,
            filterOptions: {
                attributes: attributes,
                colors: colors,
            },
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});
