import express from "express";
import adminRouter from "./admin.routes";
import categoryRouter from "./categories.routes";
import subCategoryRouter from "./subcategories.routes";
import collectionRouter from "./collections.routes";
import colorRouter from "./color.routes";
import productRouter from "./product.routes";
import OrderRouter from "./orders.routes";
import CustomerRouter from "./customers.routes";
import DashboardRouter from "./dashboard.routes";

const AdminRoutes = express.Router();

AdminRoutes.use("/user", adminRouter);
AdminRoutes.use("/categories", categoryRouter);
AdminRoutes.use("/subcategories", subCategoryRouter);
AdminRoutes.use("/collections", collectionRouter);
AdminRoutes.use("/colors", colorRouter);
AdminRoutes.use("/products", productRouter);
AdminRoutes.use("/orders", OrderRouter);
AdminRoutes.use("/customers", CustomerRouter);
AdminRoutes.use("/dashboard", DashboardRouter);

export default AdminRoutes;
