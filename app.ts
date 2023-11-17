// import Modules
import express, { NextFunction, Request, Response, Application } from "express";
import cors from "cors";
import errorMiddleware from "./middlewares/errorMiddleware";
import adminRouter from "./routes/admin.routes";

// Initialize App
export const app = express();

app.use(express.json());

// Cors => Cross Origin Resource Sharing
app.use(
    cors({
        origin: process.env.ORIGIN,
    })
);

// Testing route
app.get("/api/test", async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
        success: true,
        message: "API is working",
    });
});

// Api routes
app.use("/api/admin", adminRouter);

// Catch Unknown Routes
app.all("*", (req: Request, res: Response, next: NextFunction) => {
    const error = new Error(`Route not found - ${req.originalUrl}`) as any;
    error.statusCode = 404;
    next(error);
});

app.use(errorMiddleware);
