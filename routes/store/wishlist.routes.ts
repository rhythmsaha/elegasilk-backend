import express from "express";
import { authorizeAccessToken } from "../../middlewares/auth";
import { CUSTOMER_JWT_SECRET } from "../../lib/jwt_secret";
import {
    addItemToWishlist,
    checkProductInWishlist,
    clearWishlist,
    getWishlist,
    removeItemFromWishlist,
} from "../../controllers/store/wishlist.controller";

const wishlistRouter = express.Router();

wishlistRouter.post("/add", authorizeAccessToken(CUSTOMER_JWT_SECRET, true), addItemToWishlist);
wishlistRouter.delete("/remove/:productId", authorizeAccessToken(CUSTOMER_JWT_SECRET, true), removeItemFromWishlist);
wishlistRouter.get("/:productId", authorizeAccessToken(CUSTOMER_JWT_SECRET, true), checkProductInWishlist);
wishlistRouter.get("/", authorizeAccessToken(CUSTOMER_JWT_SECRET, true), getWishlist);
wishlistRouter.delete("/", authorizeAccessToken(CUSTOMER_JWT_SECRET, true), clearWishlist);

export default wishlistRouter;
