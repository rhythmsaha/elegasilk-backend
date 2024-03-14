/**
 * The main application file for the elegasilk-backend project.
 * This file sets up the Express application, imports modules, defines routes, and handles errors.
 */

// import Modules
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import errorMiddleware from "./middlewares/errorMiddleware";

// Import AdminAPI Routes
import adminRouter from "./routes/admin/admin.routes";
import categoryRouter from "./routes/admin/categories.routes";
import collectionRouter from "./routes/admin/collections.routes";
import colorRouter from "./routes/admin/color.routes";
import subCategoryRouter from "./routes/admin/subcategories.routes";

import productRouter from "./routes/admin/product.routes";

//Import StoreFrontAPI Routes
import StoreCustomerRoutes from "./routes/store/customer.routes";
import StoreProductRoutes from "./routes/store/products.routes";
import StoreCollectionRoutes from "./routes/store/collection.routes";
import AdminRoutes from "./routes/admin";
import StoreRouter from "./routes/store";

// Initialize App
export const app = express();

app.use(express.json());

// Cors => Cross Origin Resource Sharing
app.use(cors());

/**
 * Testing route to check if the API is working.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
app.get("/api/test", async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
        success: true,
        message: "API is working",
    });
});

// Routes
app.use("/api/admin", adminRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/subcategories", subCategoryRouter);
app.use("/api/collections", collectionRouter);
app.use("/api/colors", colorRouter);
app.use("/api/products", productRouter);

// AdminAPI - v1
app.use("/api/v1/admin", AdminRoutes);

// StoreFrontAPI
app.use("/api/store/user", StoreCustomerRoutes);
app.use("/api/store/products", StoreProductRoutes);
app.use("/api/store/collections", StoreCollectionRoutes);

// Storefront Api - v1
app.use("/api/v1/store", StoreRouter);

// Catch Unknown Routes
app.all("*", (req: Request, res: Response, next: NextFunction) => {
    const error = new Error(`Route not found - ${req.originalUrl}`) as any;
    error.statusCode = 404;
    next(error);
});

app.use(errorMiddleware);
