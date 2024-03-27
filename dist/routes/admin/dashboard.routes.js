"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dashboard_controller_1 = require("../../controllers/admin/dashboard.controller");
const DashboardRouter = express_1.default.Router();
DashboardRouter.get("/graph", 
//  authorizeAccessToken(adminSecret),
dashboard_controller_1.graphReport);
DashboardRouter.get("/report", 
//  authorizeAccessToken(adminSecret),
dashboard_controller_1.salesReport);
exports.default = DashboardRouter;
