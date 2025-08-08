import { Router } from "express";
import { authLimiter } from "../middleware/ratelimit.middleware";
import {
  getCurrentUserController,
  loginController,
  logoutController,
  registerController,
} from "../controllers/auth.controllers";
import { authMiddleware } from "../middleware/auth.middleware";
import { roleMiddleware } from "../middleware/role.middleware";

const router = Router();

// Register route: POST /api/auth/register
router.post("/register", authLimiter, registerController);

// Login route: POST /api/auth/login
router.post("/login", authLimiter, loginController);

// Logout route: POST /api/auth/logout
router.post("/logout", authMiddleware, authLimiter, logoutController);

// Get current user route: GET /api/auth/me
router.get("/me", authMiddleware, authLimiter, getCurrentUserController);

export default router;
