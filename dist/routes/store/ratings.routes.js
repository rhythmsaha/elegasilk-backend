"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middlewares/auth");
const jwt_secret_1 = require("../../lib/jwt_secret");
const Ratings_controller_1 = require("../../controllers/store/Ratings.controller");
const router = express_1.default.Router();
router.get("/check-purchase/:productId", (0, auth_1.authorizeAccessToken)(jwt_secret_1.CUSTOMER_JWT_SECRET, true), Ratings_controller_1.checkIfPurchased);
router.post("/", (0, auth_1.authorizeAccessToken)(jwt_secret_1.CUSTOMER_JWT_SECRET, true), Ratings_controller_1.addRating);
router.get("/:id", Ratings_controller_1.getRatings);
exports.default = router;
