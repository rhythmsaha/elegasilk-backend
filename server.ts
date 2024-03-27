import cluster from "node:cluster";
import os from "node:os";
import process from "node:process";

import dotenv from "dotenv";
import { app } from "./app";
import connectDB from "./lib/db";

const totalCpus = os.cpus().length;

//For env File
dotenv.config();

// Create Server
const port = process.env.PORT || 8000;

if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`);

    for (let i = 0; i < totalCpus; i++) {
        cluster.fork();
    }
} else {
    const server = app.listen(process.env.PORT, () => {
        console.log(`total cpus: ${totalCpus}`);
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
}
