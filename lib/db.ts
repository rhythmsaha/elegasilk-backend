import mongoose from "mongoose";
require("dotenv").config();

const dbUrl: string = process.env.DB_HOST || "";

const connectDB = async () => {
    try {
        await mongoose.connect(dbUrl).then((res) => {
            console.log(`Database connected to ${res.connection.name}, on ${res.connection.host}`);
        });
    } catch (error: any) {
        console.log(error.message);
        setTimeout(() => connectDB, 5000);
    }
};

export default connectDB;
