import { Request, Response } from "express";
import {
  transactionCreateSchema,
  transactionUpdateSchema,
} from "../schemas/transaction.schema";
import { cacheGet, cacheSet, cacheDel } from "../utils/redis";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

// Todo: Implement the filtering by category and from date & to date, sorting by ascending or descending date, search by keyword and pagination logic

export const getAllTransactionsController = async (
  req: Request,
  res: Response
) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }

    // Get user ID from request
    const userId = req.user.id;
    const cacheKey = `transactions:${userId}`;

    // Try to get cached transactions
    const cachedTransactions = await cacheGet(cacheKey);
    if (cachedTransactions) {
      return res.status(200).json(cachedTransactions);
    }

    // Fetch from database
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    // Cache the result for 15 minutes
    await cacheSet(cacheKey, transactions, 15 * 60);

    // Return the transactions
    return res.status(200).json({
      transactions,
      success: true,
      message: "Transactions fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({ error: "Error fetching transactions" });
  }
};

export const addTransactionController = async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }

    // Get user ID from request
    const userId = req.user.id;

    // Validate request body
    const validatedData = transactionCreateSchema.safeParse(req.body);
    if (!validatedData.success) {
      return res.status(400).json({
        success: false,
        message: validatedData.error.issues[0].message,
      });
    }

    // Create a new transaction with these fields: amount, type, category
    const transaction = await prisma.transaction.create({
      data: { ...req.body, userId },
    });

    // Invalidate cache for transactions
    const cacheKey = `transactions:${userId}`;
    await cacheDel(cacheKey);

    // Return the transactions
    return res.status(200).json({
      transaction,
      success: true,
      message: "Transaction added successfully",
    });
  } catch (error) {
    console.error("Error adding transaction:", error);
    return res.status(500).json({ error: "Error adding transaction" });
  }
};

export const editTransactionController = async (
  req: Request,
  res: Response
) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }

    // Get user ID from request
    const userId = req.user.id;

    // Validate request body
    const validatedData = transactionUpdateSchema.safeParse(req.body);
    if (!validatedData.success) {
      return res.status(400).json({
        success: false,
        message: validatedData.error.issues[0].message,
      });
    }

    // Update the transaction with these fields: amount, type, category
    const transaction = await prisma.transaction.update({
      where: { id: req.params.id, userId },
      data: req.body,
    });
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    // Invalidate cache for transactions
    const cacheKey = `transactions:${userId}`;
    await cacheDel(cacheKey);

    // Return the transactions
    return res.status(200).json({
      transaction,
      success: true,
      message: "Transaction updated successfully",
    });
  } catch (error) {
    console.error("Error editing transaction:", error);
    return res.status(500).json({ error: "Error editing transaction" });
  }
};
export const deleteTransactionController = async (
  req: Request,
  res: Response
) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }

    // Get user ID from request
    const userId = req.user.id;

    // Delete the transaction
    const transaction = await prisma.transaction.delete({
      where: { id: req.params.id, userId },
    });
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    // Invalidate cache for transactions
    const cacheKey = `transactions:${userId}`;
    await cacheDel(cacheKey);

    // Return the transactions
    return res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return res.status(500).json({ error: "Error deleting transaction" });
  }
};
