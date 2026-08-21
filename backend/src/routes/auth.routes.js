import express from "express";
import { Register } from "../controllers/auth.controller.js";
import { registerValidationRules } from "../validators/auth.validator.js";
import { verifyEmail } from "../controllers/auth.controller.js";

const authRouter = express.Router();


authRouter.post("/register", registerValidationRules, Register);

authRouter.get("/verify-email", verifyEmail);


export default authRouter;