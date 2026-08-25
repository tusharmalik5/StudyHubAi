import express from "express";
import { Register } from "../controllers/auth.controller.js";
import {
  loginValidatonRules,
  registerValidationRules,
} from "../validators/auth.validator.js";
import { verifyEmail } from "../controllers/auth.controller.js";
import { Login } from "../controllers/auth.controller.js";
import { getMe } from "../controllers/auth.controller.js";
import { authUser } from "../middleware/auth.middleware.js";
import { Logout } from "../controllers/auth.controller.js";

const authRouter = express.Router();

authRouter.post("/register", registerValidationRules, Register);

authRouter.post("/login", loginValidatonRules, Login);
authRouter.get("/get-me", authUser, getMe);

authRouter.post("/logout", authUser, Logout )

authRouter.get("/verify-email", verifyEmail);

export default authRouter;
