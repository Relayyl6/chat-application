import express from "express";
import cookieParser from "cookie-parser";
const app = express();
import connectToDatabase from "../common/db/db.ts"

import { Request, Response } from "express";
import { PORT } from "../config/env";

app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use(() => cookieParser());
app.use(express.static("public"));

app.get("/", (req: Request, res: Response) => {
    res.send (`Welcome to teh We Chat application backend listening on port ${PORT}`)
})

app.listen(PORT, async () => {
    await connectToDatabase();
})

