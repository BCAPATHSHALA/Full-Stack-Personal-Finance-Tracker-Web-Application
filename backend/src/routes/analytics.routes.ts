import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { roleMiddleware } from "../middleware/role.middleware";
import { analyticsLimiter } from "../middleware/ratelimit.middleware";
import {
  getTransactionAnalyticsOverviewController,
  getUserTransactionAnalyticsController,
} from "../controllers/analytics.controllers";

const router = Router();

// Get analytics overview: GET /analytics
// Query params: page, limit, search, role, sortBy, sortOrder
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["ADMIN", "USER", "READ_ONLY"]),
  analyticsLimiter,
  getTransactionAnalyticsOverviewController
);

// Get user-specific analytics: GET /analytics/user/:id
// Query params: page, limit, category, fromDate, toDate, transactionType, transactionSearch, sortBy, sortOrder
router.get(
  "/user/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "USER", "READ_ONLY"]),
  analyticsLimiter,
  getUserTransactionAnalyticsController
);

export default router;
