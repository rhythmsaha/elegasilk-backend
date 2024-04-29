import validator from "validator";
import ErrorHandler from "../utils/ErrorHandler";
import SubCategory from "../models/subCategory.model";

class SubCategoryService {
    private static validateSubCategoryOptions(options: ISubCategoryOptions) {
        const { name, image, status, category } = options;
        if (!name) throw new ErrorHandler("Please provide a name", 400);

        if (category && !validator.isMongoId(category)) throw new ErrorHandler("Please provide a category id", 400);

        if (status && typeof status !== "boolean") throw new ErrorHandler("Status must be a boolean value", 400);

        if (image && !validator.isURL(image)) throw new ErrorHandler("Please provide a valid image URL", 400);
    }

    public static async create(options: ISubCategoryOptions) {
        this.validateSubCategoryOptions(options);
        const { name, description, image, status, category } = options;

        const newSubCategory = await SubCategory.create({
            name,
            description,
            image,
            status,
            category,
        });

        return newSubCategory;
    }

    public static async update(id: string, options: ISubCategoryOptions) {
        this.validateSubCategoryOptions(options);

        const { name, description, image, status, category } = options;
        const subcategory = await SubCategory.findByIdAndUpdate(
            id,
            {
                name,
                description,
                image,
                status,
                category,
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!subcategory) throw new ErrorHandler("Failed to update sub category", 500);

        return subcategory;
    }

    public static async delete(id: string) {
        const deletedSubCategory = await SubCategory.findByIdAndDelete(id);

        if (!deletedSubCategory) throw new ErrorHandler("Failed to delete sub category", 500);

        return deletedSubCategory;
    }

    public static async getByID(id: string) {
        const subcategory = await SubCategory.findById(id);

        if (!subcategory) throw new ErrorHandler("Sub category not found", 404);

        return subcategory;
    }

    public static async getWithCategory(category: string) {
        if (!category) throw new ErrorHandler("Please provide a valid category", 400);

        const data = await this.getByID(category);
        const dataWithCategory = await data.populate("category", "name slug");

        if (!dataWithCategory) throw new ErrorHandler("Failed to get sub category with category", 500);

        return dataWithCategory;
    }

    public static async getSubCategoriesByCategoryId(categoryId: string) {
        if (!validator.isMongoId(categoryId.toString()))
            throw new ErrorHandler("Please provide a valid category id", 400);

        const subCategories = await SubCategory.find({ category: categoryId }).populate("category", "name slug");

        if (!subCategories) throw new ErrorHandler("Failed to get sub categories by category id", 500);

        return subCategories;
    }
}

export default SubCategoryService;

interface ISubCategoryOptions {
    name: string;
    description?: string;
    image?: string;
    status?: boolean;
    category: string;
}
