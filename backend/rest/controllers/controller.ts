import { Request, Router, Response } from "express";

export const healthCheck = (req: Request, res: Response) => {
    res.json({
        message : "Chat application"
    })
}