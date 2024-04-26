import mongoose, { FilterQuery, PipelineStage } from "mongoose";
import { deleteCollection } from "../controllers/admin/collection.controller";
import Collection, { ICollection } from "../models/collection.model";
import { ICollectionFetchOptions, ICreateCategoryInput } from "../types/typings";
import ErrorHandler from "../utils/ErrorHandler";

class CollectionService {
    private static validateStatus(status: any) {
        if (status && typeof status !== "boolean") {
            throw new ErrorHandler("Status must be a boolean value", 400);
        }
    }

    public static async createCollection({ name, description, image, status }: ICreateCategoryInput) {
        this.validateStatus(status);

        const collection = await Collection.create({
            name,
            description,
            image,
            status,
        });

        if (!collection) throw new ErrorHandler("Failed to create new collection", 500);

        return collection;
    }

    public static async updateCollection(id: string, { name, description, image, status }: ICreateCategoryInput) {
        this.validateStatus(status);

        const updatedCollection = await Collection.findByIdAndUpdate(
            id,
            {
                name,
                description,
                image,
                status,
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updatedCollection) throw new ErrorHandler("Failed to update collection", 500);

        return updatedCollection;
    }

    public static async deleteCollection(id: string) {
        if (!id) throw new ErrorHandler("Please provide a valid collection ID", 400);

        const collection = await Collection.findByIdAndDelete(id);

        if (!collection) throw new ErrorHandler("Failed to delete collection", 500);

        return collection;
    }

    public static async getCollectionById(id: string) {
        if (!id) throw new ErrorHandler("Please provide a valid collection ID", 400);

        const collection = await Collection.findById(id);

        if (!collection) throw new ErrorHandler("Collection not found", 404);

        return collection;
    }

    private static validateGetOptions({ search, page, limit, sort, sortOrder, status }: ICollectionFetchOptions) {
        if (sort && !["name", "status", "createdAt", "updatedAt"].includes(sort)) {
            throw new ErrorHandler("Invalid sort by property", 400);
        }

        if (sortOrder && !["asc", "desc"].includes(sortOrder)) {
            throw new ErrorHandler("Invalid sort order property", 400);
        }

        if (page && isNaN(page)) {
            throw new ErrorHandler("Page must be a number", 400);
        }

        if (limit && isNaN(limit)) {
            throw new ErrorHandler("Limit must be a number", 400);
        }

        let filters = {} as FilterQuery<ICollection>;
        let pipeline: PipelineStage[] = [];

        let sortCondition: Record<string, 1 | -1 | mongoose.Expression.Meta> = {};

        if (sort) sortCondition[sort] = sortOrder === "asc" ? 1 : -1;

        if (search) {
            filters["name"] = { $regex: new RegExp(search, "i") };
        }

        if (status) {
            if (status === "true") filters["status"] = true;
            else if (status === "false") filters["status"] = false;
            else throw new ErrorHandler("Invalid status value", 400);
        }

        return { filters, pipeline, sortCondition };
    }

    public static async getCollectionsWithPagination(options: ICollectionFetchOptions) {
        const { filters, pipeline, sortCondition } = this.validateGetOptions(options);
        let { search, page, limit } = options;

        if (!page) page = 1;

        let startFrom = (Number(page) - 1) * Number(limit);
        let endAt = Number(limit);

        if (filters) {
            pipeline.push({ $match: filters });
        }

        pipeline.push({
            $facet: {
                collections: [{ $sort: sortCondition }, { $skip: startFrom }, { $limit: endAt }],
                totalCount: [{ $count: "total" }],
            },
        });

        const fetchedData = await Collection.aggregate(pipeline);

        if (!fetchedData) {
            throw new ErrorHandler("Failed to fetch collections", 500);
        }

        const total = fetchedData[0].totalCount.length > 0 ? fetchedData[0].totalCount[0].total : 0;
        const collections = fetchedData[0].collections;
        const maxPage = Math.ceil(total / endAt);
        // let currentPage = page;

        if (maxPage < page) page = 1;

        return { collections, total, page, maxPage };
    }

    public static async getCollections(options: ICollectionFetchOptions) {
        const { filters, pipeline, sortCondition } = this.validateGetOptions(options);

        if (filters) pipeline.push({ $match: filters });

        if (sortCondition) {
            pipeline.push({
                $facet: {
                    collections: [{ $sort: sortCondition }],
                    totalCount: [{ $count: "total" }],
                },
            });
        }

        const fetchedData = await Collection.aggregate(pipeline);

        if (!fetchedData) {
            throw new ErrorHandler("Failed to fetch collections", 500);
        }

        const total = fetchedData[0].totalCount.length > 0 ? fetchedData[0].totalCount[0].total : 0;
        const collections = fetchedData[0].collections;

        return { collections, total };
    }
}

export default CollectionService;
