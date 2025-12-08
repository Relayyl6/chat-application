import { Router } from "express";
import { healthCheck } from "../controllers/controller";

const appRouter = Router();

appRouter.get("/health", healthCheck);