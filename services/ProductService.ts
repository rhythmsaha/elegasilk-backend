import mongoose, { FilterQuery } from "mongoose";
import Product, { IProduct } from "../models/Product.model";
import { ISortOrder } from "../types/typings";
import ErrorHandler from "../utils/ErrorHandler";
import { PipelineStage } from "mongoose";
import splitQuery from "../utils/splitQuery";

export interface IProductOptions {
    name?: string;
    slug?: string;
    sku?: string;
    description?: string;
    images?: string[];
    MRP?: number;
    discount?: number;
    published?: boolean;
    stock?: number;
    colors?: string[];
    collections?: string[];
    attributes?: {
        _id: string;
        subcategory: string[];
    }[];
    specs?: {
        name: string;
        value: string;
    }[];
}

export type IProductSortOptions =
    | "newest-first"
    | "price-high-to-low"
    | "price-low-to-high"
    | "relevant"
    | "updatedAt"
    | "name"
    | "published"
    | "stock"
    | "MRP"
    | "createdAt"
    | "price";

export interface IProductQueryOptions {
    sortby?: IProductSortOptions;
    sortOrder?: ISortOrder;
    search?: string;
    attributesQuery?: string;
    colorsQuery?: string;
    collectionsQuery?: string;

    page?: number;
    pageSize?: number;
    stock?: IStockOptions;
    status?: IPublishedStatusOption;
}

export type IStockOptions = "IN_STOCK" | "OUT_OF_STOCK" | "LOW_STOCK" | "ALL_IN_STOCK";
export type IPublishedStatusOption = "true" | "false";

class ProductService {
    private static validateOptions(options: IProductOptions) {
        const {
            name,
            sku,
            description,
            images,
            MRP,
            discount,
            published,
            stock,
            colors,
            collections,
            attributes,
            specs,
        } = options;
        let fields: any = {};

        // status validation
        if (published && typeof published !== "boolean") {
            throw new ErrorHandler("Status must be a boolean value", 400);
        }

        if (name) fields.name = name;
        if (sku) fields.sku = sku;
        if (description) fields.description = description;
        if (images && images.length > 0) fields.images = images;
        if (MRP) fields.MRP = MRP;
        if (discount) fields.discount = discount;
        if (typeof published === "boolean") fields.published = published;
        if (stock) fields.stock = stock;
        if (colors && colors.length > 0) fields.colors = colors;
        if (collections && collections.length > 0) fields.collections = collections;
        if (attributes && attributes.length > 0)
            fields.attributes = attributes.map((attr) => ({
                category: attr._id,
                subcategory: attr.subcategory,
            }));
        if (specs && specs.length > 0) fields.specs = specs;

        return fields;
    }

    public static async createProduct(options: IProductOptions) {
        const fields = this.validateOptions(options);
        const product = await Product.create(fields);
        return product;
    }

    public static async updateProduct(id: string, options: IProductOptions) {
        const fields = this.validateOptions(options);

        const updatedProduct = await Product.findByIdAndUpdate(id, fields, {
            new: true,
            runValidators: true,
        });

        if (!updatedProduct) {
            throw new ErrorHandler("Failed to update product", 400);
        }

        return updatedProduct;
    }

    public static async deleteProduct(id: string) {
        if (!id) throw new ErrorHandler("Please provide a product id", 400);

        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            throw new ErrorHandler("Failed to delete product", 400);
        }

        return deletedProduct;
    }

    private static async getProductById(id: string) {
        const product = await Product.findById(id);

        if (!product) {
            throw new ErrorHandler("Product not found", 404);
        }

        return product;
    }

    public static async getSingleProduct(id: string) {
        const product = await this.getProductById(id);
        const populatedProduct = await product.populate([
            {
                path: "attributes.category",
                select: "name",
            },
            {
                path: "attributes.subcategory",
                select: "name",
            },
            {
                path: "collections",
                select: "name",
            },
            {
                path: "colors",
                select: "name",
            },
        ]);

        return populatedProduct;
    }

    private static async getProductBySlug(slug: string) {
        const product = await Product.findOne({ slug, published: true });

        if (!product) {
            throw new ErrorHandler("Product not found", 404);
        }

        return product;
    }

    public static async getProductForStoreFront(slug: string) {
        const product = await this.getProductBySlug(slug);
        const populatedProduct = await product.populate([{ path: "collections" }, { path: "colors" }]);

        return populatedProduct;
    }

    private static validateSortOptionsForStoreFront(sortby: IProductSortOptions) {
        const validSortOptions = ["newest-first", "price-high-to-low", "price-low-to-high", "relevant"];

        if (!validSortOptions.includes(sortby)) {
            throw new ErrorHandler("Invalid sort option", 400);
        }

        let sortOrder: ISortOrder = "asc";
        let sort: IProductSortOptions;

        switch (sortby) {
            case "newest-first":
                // Get products sorted by newest first
                sort = "createdAt";
                sortOrder = "desc";
                break;
            case "price-high-to-low":
                // Get products sorted by price high to low
                sort = "price";
                sortOrder = "desc";
                break;
            case "price-low-to-high":
                // Get products sorted by price low to high
                sort = "price";
                sortOrder = "asc";
                break;
            case "relevant":
                // Get products sorted by relevance
                sort = "stock";
                sortOrder = "desc";

                break;
            default:
                // Get products sorted by relevance
                sort = "stock";
                sortOrder = "desc";
                break;
        }

        return { sort, sortOrder };
    }

    private static validateQueryOptions(options: IProductQueryOptions) {
        const { sortby, sortOrder, search, attributesQuery, colorsQuery, collectionsQuery, stock, status } = options;

        let filters = {} as FilterQuery<IProduct>;
        let pipeline: PipelineStage[] = [];

        let sortCondition: Record<string, 1 | -1 | mongoose.Expression.Meta> = {};

        if (sortby) sortCondition[sortby] = sortOrder === "asc" ? 1 : -1;

        if (search) {
            filters["name"] = { $regex: new RegExp(search, "i") };
        }

        if (stock === "IN_STOCK") {
            filters["stock"] = {
                $gte: 10,
            };
        } else if (stock === "OUT_OF_STOCK") {
            filters["stock"] = {
                $lt: 1,
            };
        } else if (stock === "LOW_STOCK") {
            filters["stock"] = {
                $lt: 10,
            };
        } else if (stock === "ALL_IN_STOCK") {
            filters["stock"] = {
                $gt: 0,
            };
        }

        if (status) {
            if (status === "true") filters["published"] = true;
            else if (status === "false") filters["published"] = false;
            else throw new ErrorHandler("Invalid status value", 400);
        }

        if (attributesQuery && attributesQuery.length > 0) {
            const _attrs = splitQuery(attributesQuery);
            filters["attributes.subcategory"] = {
                $in: _attrs,
            };
        }

        if (collectionsQuery && collectionsQuery.length > 0) {
            const _collections = splitQuery(collectionsQuery);
            filters["collections"] = {
                $in: _collections,
            };
        }

        if (colorsQuery && colorsQuery.length > 0) {
            const _colors = splitQuery(colorsQuery);
            filters["colors"] = {
                $in: _colors,
            };
        }

        if (filters) {
            pipeline.push({ $match: filters });
        }

        return { pipeline, sortCondition };
    }

    public static async getProductsWithPagination(options: IProductQueryOptions, storefront: boolean = false) {
        let { page, pageSize, sortby } = options;

        if (!page || !pageSize) {
            throw new ErrorHandler("Please provide page and pageSize", 400);
        }

        if (storefront) {
            const { sort, sortOrder } = this.validateSortOptionsForStoreFront(sortby!);
            options.sortby = sort;
            options.sortOrder = sortOrder;
        }

        const { pipeline, sortCondition } = this.validateQueryOptions(options);

        let project: any = {
            name: 1,
            slug: 1,
            images: 1,
            MRP: 1,
            discount: 1,
            published: 1,
            stock: 1,
        };

        if (storefront) {
            project["createdAt"] = 1;
            project["ratings"] = 1;
            project["price"] = 1;
        } else {
            project["updatedAt"] = 1;
        }

        pipeline.push({
            $addFields: {
                price: { $subtract: ["$MRP", { $multiply: [{ $divide: ["$discount", 100] }, "$MRP"] }] },
            },
        });

        pipeline.push({
            $facet: {
                products: [
                    { $sort: sortCondition },
                    { $skip: (page - 1) * pageSize },
                    { $limit: pageSize },
                    {
                        $project: project,
                    },
                ],
                totalCount: [{ $count: "total" }],
            },
        });

        const products = await Product.aggregate(pipeline);

        if (!products) {
            throw new ErrorHandler("Failed to fetch products", 400);
        }

        const total = products[0].totalCount[0]?.total || 0;
        const _products = products[0].products;
        const maxPage = Math.ceil(total / pageSize);
        let currentPage = page;

        if (currentPage > maxPage) {
            currentPage = maxPage;
        }

        return { products: _products, total, currentPage, maxPage };
    }

    public static async reduceStock(productId: string, quantity: number) {
        const product = await Product.findById(productId);

        if (!product) {
            throw new ErrorHandler("Product not found", 404);
        }

        if (product.stock < quantity) {
            throw new ErrorHandler("Insufficient stock", 400);
        }

        product.stock -= quantity;
        await product.save();

        return product;
    }

    public static async increaseStock(productId: string, quantity: number) {
        const product = await Product.findById(productId);

        if (!product) {
            throw new ErrorHandler("Product not found", 404);
        }

        product.stock += quantity;
        await product.save();

        return product;
    }
}

export default ProductService;
