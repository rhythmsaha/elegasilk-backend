import dotenv from "dotenv";
import { app } from "./app";
import connectDB from "./lib/db";

//For env File
dotenv.config();

// Create Server
const port = process.env.PORT || 8000;

const server = app.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${port}`);
    connectDB();
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: any) => {
    console.log(`Shutting down the server for ERROR: ${err.message}`);
    console.log(`Shutting down the server for unhandled promise rejections`);
    server.close(() => {
        process.exit(1);
    });
});
