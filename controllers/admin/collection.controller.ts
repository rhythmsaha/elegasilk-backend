import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import { ICategorySortOptions, ISortOrder } from "../../types/typings";
import CollectionService from "../../services/CollectionService";

export const createCollection = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { name, description, image, status } = req.body;

    const collection = await CollectionService.createCollection({
        name,
        description,
        image,
        status,
    });

    res.status(201).json({
        success: true,
        data: collection,
    });
});

export const updateCollection = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { name, description, image, status } = req.body;

    const collection = await CollectionService.updateCollection(id, {
        name,
        description,
        image,
        status,
    });

    res.status(200).json({
        success: true,
        data: collection,
    });
});

export const deleteCollection = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const deletedCollection = await CollectionService.deleteCollection(id);

    res.status(200).json({
        success: true,
        data: deletedCollection,
    });
});

export const getAllCollections = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const sortBy = (req.query.sortby as ICategorySortOptions) || "name";
    const sortOrder: ISortOrder = (req.query.sortorder as ISortOrder) || "asc";
    const search = req.query.search as string;
    const status = req.query.status as string;
    const page = (req.query.page as string) || 1;
    const pageSize = (req.query.pageSize as string) || 5;
    const stopPagination = req.query.stopPagination as string;

    if (stopPagination === "true") {
        const { collections, total } = await CollectionService.getCollections({
            search,
            sort: sortBy,
            sortOrder,
            status,
        });

        res.status(200).json({
            success: true,
            total: total,
            data: collections,
        });
    } else {
        const {
            collections,
            total,
            maxPage,
            page: currentPage,
        } = await CollectionService.getCollectionsWithPagination({
            search,
            page: Number(page),
            limit: Number(pageSize),
            sort: sortBy,
            sortOrder,
            status,
        });

        res.status(200).json({
            success: true,
            total: total,
            currentPage: currentPage,
            maxPage: maxPage,
            data: collections,
        });
    }
});

export const getCollection = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const collection = await CollectionService.getCollectionById(id);

    res.status(200).json({
        success: true,
        data: collection,
    });
});
