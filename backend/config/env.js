import { config } from "dotenv";
import process from "process";

config({ path: `.env.${process.env.NODE_ENV || production}.local` })