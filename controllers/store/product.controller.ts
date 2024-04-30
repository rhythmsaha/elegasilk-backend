import expressAsyncHandler from "express-async-handler";
import ErrorHandler from "../../utils/ErrorHandler";
import Product from "../../models/Product.model";
import ProductService from "../../services/ProductService";

type IProductSortOption = "newest-first" | "price-high-to-low" | "price-low-to-high" | "relevant";

export const getProductsForStoreFront = expressAsyncHandler(async (req, res, next) => {
    const sortQuery = (req.query.sortby as IProductSortOption) || "relevant";
    const search = req.query.search as string;
    const attributesQuery = req.query.attributes as string;
    const colorsQuery = req.query.colors as string;
    const collectionsQuery = req.query.collections as string;

    const page = parseInt(req.query.page as string, 10) || 1;
    const pageSize = parseInt(req.query.pagesize as string, 10) || 30;

    if (!["newest-first", "price-high-to-low", "price-low-to-high", "relevant"].includes(sortQuery)) {
        throw new ErrorHandler("Invalid Sort Option!", 400);
    }

    const { products, total, currentPage, maxPage } = await ProductService.getProductsWithPagination(
        {
            page,
            pageSize,
            search,
            status: "true",
            stock: "ALL_IN_STOCK",
            sortby: sortQuery,
            sortOrder: "asc",
            attributesQuery: attributesQuery,
            colorsQuery: colorsQuery,
            collectionsQuery: collectionsQuery,
        },
        true
    );

    // const filter = await ProductService.getFilters({ attributesQuery, colorsQuery, collectionsQuery });

    res.status(200).json({
        // filter,
        success: true,
        data: products,
        total,
        currentPage,
        maxPage,
    });
});

export const getProductsPaths = expressAsyncHandler(async (req, res, next) => {
    const products = await Product.find({ published: true });

    if (!products) {
        return next(new ErrorHandler("Failed to fetch products", 500));
    }

    const paths = products.map((product) => {
        if (product.published === false) return;
        return {
            params: {
                slug: product.slug,
            },
        };
    });

    res.status(200).json({
        success: true,
        paths: paths,
    });
});

export const getProduct = expressAsyncHandler(async (req, res, next) => {
    const slug = req.params.slug;
    const product = await ProductService.getProductForStoreFront(slug);
    res.status(200).json({
        success: true,
        data: product,
    });
});
