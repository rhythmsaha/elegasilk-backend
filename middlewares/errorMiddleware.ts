import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/ErrorHandler";

const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    // Wrong MongoDB ID Error
    if (err.name === "CastError") {
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new ErrorHandler(message, 400);
    }

    // Duplicate Key Error
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        err = new ErrorHandler(message, 400);
    }

    // Wrong JWT Error
    if (err.name === "JsonWebTokenError") {
        const message = "JSON Web Token is invalid. Try again!!!";
        err = new ErrorHandler(message, 400);
    }

    // JWT Expired Error
    if (err.name === "TokenExpiredError") {
        const message = "JSON Web Token is expired. Try again!!!";
        err = new ErrorHandler(message, 400);
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message,
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
};

export default errorMiddleware;
