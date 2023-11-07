// import Modules

require("dotenv").config();
import express, { NextFunction, Request, Response, Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middlewares/errorMiddleware";

// Initialize App
export const app = express();

app.use(cookieParser());

// Cors => Cross Origin Resource Sharing
app.use(
    cors({
        origin: process.env.ORIGIN,
    })
);

// Testing route
app.get("/test", (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
        success: true,
        message: "API is working",
    });
});

// Catch Unknown Routes
app.all("*", (req: Request, res: Response, next: NextFunction) => {
    const error = new Error(`Route not found - ${req.originalUrl}`) as any;
    error.statusCode = 404;
    next(error);
});

app.use(errorMiddleware);
