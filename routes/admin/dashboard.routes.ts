import express from "express";
import { graphReport, salesReport } from "../../controllers/admin/dashboard.controller";
import { authorizeAccessToken } from "../../middlewares/auth";
import { adminSecret } from "../../lib/jwt_secret";
const DashboardRouter = express.Router();

DashboardRouter.get(
    "/graph",
    //  authorizeAccessToken(adminSecret),
    graphReport
);
DashboardRouter.get(
    "/report",
    //  authorizeAccessToken(adminSecret),
    salesReport
);

export default DashboardRouter;
