import express from "express";
import { authorizeAccessToken } from "../../middlewares/auth";
import { CUSTOMER_JWT_SECRET } from "../../lib/jwt_secret";
import { addRating, checkIfPurchased, getRatings } from "../../controllers/store/Ratings.controller";
const router = express.Router();

router.get("/check-purchase/:productId", authorizeAccessToken(CUSTOMER_JWT_SECRET, true), checkIfPurchased);
router.post("/", authorizeAccessToken(CUSTOMER_JWT_SECRET, true), addRating);
router.get("/:id", getRatings);

export default router;
