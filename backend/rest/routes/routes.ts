import { Router } from "express";

const appRouter = Router();

appRouter.get("/root", (_, res) => {
    res.json({
        message : "Chat application"
    })
})