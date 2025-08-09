import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { roleMiddleware } from "../middleware/role.middleware";
import { transactionLimiter } from "../middleware/ratelimit.middleware";
import {
  addTransactionController,
  deleteTransactionController,
  editTransactionController,
  getAllTransactionsController,
} from "../controllers/transactions.controllers";

const router = Router();

// Get all transactions: GET /transactions
router.get(
  "/",
  authMiddleware,
  transactionLimiter,
  roleMiddleware(["ADMIN", "USER", "READ_ONLY"]),
  getAllTransactionsController
);

// ADD new transaction: POST /transactions
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["ADMIN", "USER"]),
  transactionLimiter,
  addTransactionController
);

// EDIT transaction by ID: PUT /transactions/:id
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "USER"]),
  transactionLimiter,
  editTransactionController
);

// DELETE transaction by ID: DELETE /transactions/:id
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "USER"]),
  transactionLimiter,
  deleteTransactionController
);

export default router;
