import expressAsyncHandler from "express-async-handler";
import Product from "../../models/Product.model";
import ErrorHandler from "../../utils/ErrorHandler";
import { ISortOrder } from "../../types/typings";
import splitQuery from "../../utils/splitQuery";
import SAMPLE_PRODUCTS from "../../lib/SAMPLE_PRODUCTS";
import ProductService, {
    IProductOptions,
    IProductSortOptions,
    IPublishedStatusOption,
    IStockOptions,
} from "../../services/ProductService";

export const createProduct = expressAsyncHandler(async (req, res, next) => {
    const {
        name,
        slug,
        description,
        images,
        MRP,
        discount,
        published,
        colors,
        collections,
        attributes,
        stock,
        specs,
        sku,
    } = req.body as IProductOptions;

    const product = await ProductService.createProduct({
        name,
        slug,
        description,
        images,
        MRP,
        discount,
        published,
        colors,
        collections,
        attributes,
        stock,
        specs,
        sku,
    });

    // Send response
    res.status(201).json({
        success: true,
        data: product,
    });
});

export const updateProduct = expressAsyncHandler(async (req, res, next) => {
    const { name, description, images, MRP, discount, published, colors, collections, attributes, stock, specs, sku } =
        req.body as IProductOptions;

    const updatedProduct = await ProductService.updateProduct(req.params.id, {
        name,
        description,
        images,
        MRP,
        discount,
        published,
        colors,
        collections,
        attributes,
        stock,
        specs,
        sku,
    });

    res.status(200).json({
        success: true,
        data: updatedProduct,
    });
});

export const deleteProduct = expressAsyncHandler(async (req, res, next) => {
    const productId = req.params.id;

    const deletedProduct = await ProductService.deleteProduct(productId);

    res.status(200).json({
        success: true,
        data: deletedProduct,
    });
});

export const getAllProducts = expressAsyncHandler(async (req, res, next) => {
    const sortBy = (req.query.sortby as IProductSortOptions) || "name";
    const sortOrder: ISortOrder = (req.query.sortorder as ISortOrder) || "asc";

    if (!["name", "updatedAt", "published", "stock", "MRP"].includes(sortBy) || !["asc", "desc"].includes(sortOrder)) {
        throw new ErrorHandler("Invalid Sort Option!", 400);
    }

    const search = req.query.search as string;
    const status = req.query.status as IPublishedStatusOption;
    const stock = req.query.stock as IStockOptions;

    const page = parseInt(req.query.page as string, 10) || 1;
    const pageSize = parseInt(req.query.pageSize as string, 10) || 5;

    const { products, total, currentPage, maxPage } = await ProductService.getProductsWithPagination({
        page,
        pageSize,
        search,
        status,
        stock,
        sortby: sortBy,
        sortOrder,
    });

    res.status(200).json({
        success: true,
        data: products,
        total,
        currentPage,
        maxPage,
    });
});

export const getProduct = expressAsyncHandler(async (req, res, next) => {
    const product = await ProductService.getSingleProduct(req.params.id);

    product.attributes = product.attributes.map(({ category, subcategory }) => {
        return {
            _id: category._id,
            category: category._id,
            subcategory: subcategory.map((sub) => sub._id),
        };
    }) as any;

    product.collections = product.collections?.map((collection: any) => collection._id);

    product.colors = product.colors?.map((color: any) => color._id);

    res.status(200).json({
        success: true,
        data: product,
    });
});

// For public users
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

export const insertProduct = expressAsyncHandler(async (req, res, next) => {
    const mprods = SAMPLE_PRODUCTS.map(async (product) => {
        const { name, sku, description, price, discount, images, specs, attributes, collections, colors } = product;

        let createFields: any = {};

        if (name) createFields["name"] = name;
        if (sku) createFields["sku"] = sku;
        if (description) createFields["description"] = description;
        if (price) createFields["MRP"] = price;
        if (discount) createFields["discount"] = discount;
        if (images?.length > 0) createFields["images"] = images;

        if (collections && collections.length > 0) createFields["collections"] = collections;
        if (colors?.length > 0) createFields["colors"] = colors;
        if (attributes?.length > 0) {
            const _attrs = attributes.map(({ category, subcategory }) => {
                return {
                    category: category,
                    subcategory: subcategory,
                };
            });
            createFields["attributes"] = _attrs;
        }
        createFields["stock"] = Math.floor(Math.random() * 200) + 1;
        createFields["published"] = true;

        if (specs && specs.length > 0) {
            const _specs = specs.map(({ property, value }) => {
                return {
                    name: property,
                    value: value,
                };
            });

            createFields["specs"] = _specs;
        }

        Product.create(createFields);

        return createFields;
    });

    // Create new product
    // const newProduct = await Product.create(createFields);

    // create multple products
    // const newProduct = await Product.insertMany(products);

    // if (!newProduct) {
    //     return next(new ErrorHandler("Failed to create new product", 500));
    // }

    // Send response
    res.status(201).json({
        success: true,
        data: mprods.length,
    });
});
