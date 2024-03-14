import expressAsyncHandler from "express-async-handler";
import splitQuery from "../../utils/splitQuery";
import Product from "../../models/Product.model";

export const getProductFilters = expressAsyncHandler(async (req, res, next) => {
    const { attributes, colors, collections, price } = req.query as {
        attributes: string;
        colors: string;
        collections: string;
        price: string;
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
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});
