"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_process_1 = __importDefault(require("node:process"));
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = require("./app");
const db_1 = __importDefault(require("./lib/db"));
//For env File
dotenv_1.default.config();
// Create Server
const port = node_process_1.default.env.PORT || 8000;
const server = app_1.app.listen(node_process_1.default.env.PORT, () => {
    console.log(`Server listening on port ${port}`);
    (0, db_1.default)();
});
// Handle unhandled promise rejections
node_process_1.default.on("unhandledRejection", (err) => {
    console.log(`Shutting down the server for ERROR: ${err.message}`);
    console.log(`Shutting down the server for unhandled promise rejections`);
    server.close(() => {
        node_process_1.default.exit(1);
    });
});
