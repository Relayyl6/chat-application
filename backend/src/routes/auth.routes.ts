import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { LogIn, SignUp } from "../controller/auth.controller";


const authRouter = Router()

authRouter.post('/register', SignUp)

authRouter.post('/login', LogIn)

export default authRouter