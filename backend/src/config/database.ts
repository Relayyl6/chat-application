import { connect } from "mongoose";
import { MONGODB_URI } from "./env.ts";

export const connectToDatabase = async () => {
    try {
        const conn = await connect(MONGODB_URI as string);
        console.log(`Connected to the database successfully: ${conn.connection.host}`);
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
}