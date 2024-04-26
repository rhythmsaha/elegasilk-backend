import validator from "validator";
import { ICategoryFetchOptions, ICreateCategoryInput } from "../types/typings";
import ErrorHandler from "../utils/ErrorHandler";
import Category, { ICategory } from "../models/category.model";
import { FilterQuery, SortOrder } from "mongoose";
import SubCategory from "../models/subCategory.model";

class CategoryService {
    private static validateCategoryInput({ name, description, image, status }: ICreateCategoryInput) {
        if (description && typeof description !== "string" && !validator.isLength(description, { min: 2, max: 500 })) {
            throw new ErrorHandler("Description must be between 2 and 500 characters long", 400);
        }

        if (status && typeof status !== "boolean") {
            throw new ErrorHandler("Status must be a boolean value", 400);
        }
    }

    private static validateCategoryOptions(options: ICategoryFetchOptions) {
        let filters = {} as FilterQuery<ICategory>;
        let sortBy: string | { [key: string]: SortOrder | { $meta: any } } | [string, SortOrder][] | null | undefined;

        if (options.search) {
            filters["$text"] = { $search: options.search };
        }

        if (options.page && options.limit) {
            filters["$and"] = [{ status: true }];
            sortBy = { createdAt: -1 };
        }

        if (options.sort) {
            if (options.sort === "name" || options.sort === "status") {
                sortBy = { [options.sort]: "ascending" };
            } else {
                sortBy = { [options.sort]: "descending" };
            }
        }

        return { filters, sortBy };
    }

    private static async findCategoryById(id: string) {
        const category = await Category.findById(id);
        if (!category) throw new ErrorHandler("Category not found", 404);
        return category;
    }

    public static async findCategoryBySlug(slug: string) {
        if (!slug) throw new ErrorHandler("Slug is required", 400);

        const category = await Category.findOne({
            slug,
        });

        if (!category) throw new ErrorHandler("Category not found", 404);

        return category;
    }

    public static async createCategory(data: ICreateCategoryInput) {
        this.validateCategoryInput(data);
        const newCategory = await Category.create(data);
        return newCategory;
    }

    public static async updateCategory(id: string, data: ICreateCategoryInput) {
        this.validateCategoryInput(data);
        const category = await this.findCategoryById(id);

        category.name = data.name || category.name;
        category.description = data.description || category.description;
        category.image = data.image || category.image;
        category.status = typeof data.status === "boolean" ? data.status : category.status;

        const updatedCategory = await category.save();

        if (!updatedCategory) throw new ErrorHandler("Failed to update category", 500);

        return updatedCategory;
    }

    public static async deleteCategory(id: string) {
        const category = await this.findCategoryById(id);
        const deletedCategory = await category.deleteOne();
        if (!deletedCategory) throw new ErrorHandler("Failed to delete category", 500);
        return deletedCategory;
    }

    public static async getAllCategoriesWithFilter(options: ICategoryFetchOptions) {
        const { filters, sortBy } = this.validateCategoryOptions(options);

        const categories = await Category.find(filters)
            .sort(sortBy)
            .skip(options.page * options.limit)
            .limit(options.limit);

        return categories;
    }

    public static async getCategoriesWithSubcategories(options: ICategoryFetchOptions) {
        const { filters, sortBy } = this.validateCategoryOptions(options);

        const categories = await Category.find(filters)
            .sort(sortBy)
            .skip(options.page * options.limit)
            .limit(options.limit);

        const populatedData = categories.map(async (category) => {
            const subcategories = await SubCategory.find({ category: category._id });
            return { ...category.toObject(), subcategories };
        });

        const populatedCategories = await Promise.all(populatedData);

        return populatedCategories;
    }
}

export default CategoryService;
