import mongoose from "mongoose";

const splitQuery = (query: string) => {
    return query.split(",").map((item) => new mongoose.Types.ObjectId(item));
};

export default splitQuery;
