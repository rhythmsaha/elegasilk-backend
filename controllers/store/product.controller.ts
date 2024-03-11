import expressAsyncHandler from "express-async-handler";
import { ISortOrder } from "../../types/typings";

type IProductSortOption = "newest-first" | "price-high-to-low" | "price-low-to-high" | "relevant";

export const getProductsForStoreFront = expressAsyncHandler(async (req, res, next) => {
    const sortBy = (req.query.sortby as IProductSortOption) || "relevant";

    if (sortBy && !["name", "updatedAt", "published", "stock", "MRP"].includes(sortBy)) {
        // return next(new ErrorHandler("Invalid sort by property", 400));
    }

    res.send("Get products for store front");
});
