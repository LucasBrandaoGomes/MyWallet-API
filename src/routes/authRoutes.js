import { SignIn, SignUp } from "../controllers/authControllers.js";
import { Router } from "express";

const authRoutes = Router()

authRoutes.post("/signup", SignUp);
authRoutes.post("/login", SignIn);

export default authRoutes;