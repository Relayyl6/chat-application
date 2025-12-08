import { config } from "dotenv";
import process from "process";

config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });

export { NODE_ENV, PORT, MONGO_URI } = process.env;