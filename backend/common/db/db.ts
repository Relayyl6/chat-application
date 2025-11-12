import process from "process";
import mongoose from "mongoose";
import { MONGO_URI, NODE_ENV } from "../../config/env";

if (!MONGO_URI) {
    throw new Error("Please define the mongodb url inside the .env file");
}

const connectToDatabase = async () => {
    try {
        await mongoose.connect(MONGO_URI)
        console.log(`Connected to the data base ${NODE_ENV} mode`)
    } catch (error) {
        console.error("An error occured while connecting to the database");
        process.exit(1)
    }
}

export default connectToDatabase