import mongoose, { FilterQuery } from "mongoose";
import Product, { IProduct } from "../models/Product.model";
import { ISortOrder } from "../types/typings";
import ErrorHandler from "../utils/ErrorHandler";
import { PipelineStage } from "mongoose";

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
    | "createdAt";

export interface IProductQueryOptions {
    sortby?: IProductSortOptions;
    sortOrder?: ISortOrder;
    search?: string;
    attributesQuery?: string;
    colorsQuery?: string;
    collectionsQuery?: string;

    page?: number;
    pageSize?: number;
    stock?: "IN_STOCK" | "OUT_OF_STOCK" | "LOW_STOCK";
    status?: "true" | "false";
}

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
        if (collections && collections.length > 0)
            fields.collections = collections;
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
        const populatedProduct = await product.populate([
            { path: "collections" },
            { path: "colors" },
        ]);

        return populatedProduct;
    }

    private static validateSortOptionsForStoreFront(
        sortby: IProductSortOptions
    ) {
        const validSortOptions = [
            "newest-first",
            "price-high-to-low",
            "price-low-to-high",
            "relevant",
        ];

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
                sort = "MRP";
                sortOrder = "desc";
                break;
            case "price-low-to-high":
                // Get products sorted by price low to high
                sort = "MRP";
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
        const {
            sortby,
            sortOrder,
            search,
            attributesQuery,
            colorsQuery,
            collectionsQuery,
            page,
            pageSize,
            stock,
            status,
        } = options;

        let filters = {} as FilterQuery<IProduct>;
        let pipeline: PipelineStage[] = [];

        let sortCondition: Record<string, 1 | -1 | mongoose.Expression.Meta> =
            {};

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
        }

        if (status) {
            if (status === "true") filters["published"] = true;
            else if (status === "false") filters["published"] = false;
            else throw new ErrorHandler("Invalid status value", 400);
        }

        if (filters) {
            pipeline.push({ $match: filters });
        }

        return { pipeline, sortCondition };
    }

    public static async getProductsWithoutPagination(
        options: IProductQueryOptions
    ) {
        const {
            sortby,
            sortOrder,
            search,
            attributesQuery,
            colorsQuery,
            collectionsQuery,
            stock,
            status,
        } = options;
        const { pipeline, sortCondition } = this.validateQueryOptions(options);

        pipeline.push({
            $facet: {
                products: [{ $sort: sortCondition }],
                totalCount: [{ $count: "total" }],
            },
        });

        const products = await Product.aggregate(pipeline);
        if (!products) {
            throw new ErrorHandler("Failed to fetch products", 400);
        }

        return products;
    }

    public static async getProductsWithPagination(
        options: IProductQueryOptions
    ) {
        const { page, pageSize } = options;
        if (!page || !pageSize) {
            throw new ErrorHandler("Please provide page and pageSize", 400);
        }

        const { pipeline, sortCondition } = this.validateQueryOptions(options);

        pipeline.push({
            $facet: {
                products: [
                    { $sort: sortCondition },
                    { $skip: (page - 1) * pageSize },
                    { $limit: pageSize },
                ],
                totalCount: [{ $count: "total" }],
            },
        });

        const products = await Product.aggregate(pipeline);

        if (!products) {
            throw new ErrorHandler("Failed to fetch products", 400);
        }

        return products;
    }
}

export default ProductService;
