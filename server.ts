import dotenv from "dotenv";
import { app } from "./app";

//For env File
dotenv.config();

// Create Server
const port = process.env.PORT || 8000;
app.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${port}`);
    // connectDB();
});
