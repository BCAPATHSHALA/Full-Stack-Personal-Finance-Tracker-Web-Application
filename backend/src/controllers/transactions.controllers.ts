import type { Request, Response } from "express";
import {
  transactionCreateSchema,
  transactionUpdateSchema,
} from "../schemas/transaction.schema";
import { cacheGet, cacheSet, cacheDel } from "../utils/redis";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

interface TransactionQueryParams {
  page?: string;
  limit?: string;
  category?: string;
  fromDate?: string;
  toDate?: string;
  transactionType?: "INCOME" | "EXPENSE";
  transactionSearch?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Helper function to convert date string to ISO DateTime
const convertToDateTime = (dateString: string): Date => {
  // If it's already a full datetime, return as is
  if (dateString.includes("T")) {
    return new Date(dateString);
  }
  // If it's just a date (YYYY-MM-DD), add time component
  return new Date(`${dateString}T00:00:00.000Z`);
};

// GET /transactions/user/:id - Get user-specific transaction analytics
export const getUserTransactionsController = async (
  req: Request,
  res: Response
) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }

    const { id: targetUserId } = req.params;
    const currentUser = req.user;

    // Authorization check
    if (currentUser.role !== "ADMIN" && currentUser.id !== targetUserId) {
      return res
        .status(403)
        .json({ error: "Forbidden: Cannot access other user's data" });
    }

    const {
      page = "1",
      limit = "10",
      category = "",
      fromDate = "",
      toDate = "",
      transactionType = "",
      transactionSearch = "",
      sortBy = "date",
      sortOrder = "desc",
    } = req.query as TransactionQueryParams;

    const pageNum = Number.parseInt(page);
    const limitNum = Number.parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Create cache key
    const cacheKey = `transactions:user:${targetUserId}:${JSON.stringify(
      req.query
    )}`;

    // Try to get cached data
    const cachedData = await cacheGet(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    // Build where clause
    const whereClause: any = { userId: targetUserId };

    // Filter by category
    if (category) {
      whereClause.category = { contains: category, mode: "insensitive" };
    }

    // Filter by date range
    if (fromDate || toDate) {
      whereClause.date = {};
      if (fromDate) {
        whereClause.date.gte = convertToDateTime(fromDate);
      }
      if (toDate) {
        whereClause.date.lte = convertToDateTime(toDate);
      }
    }

    // Filter by transaction type
    if (transactionType && ["INCOME", "EXPENSE"].includes(transactionType)) {
      whereClause.type = transactionType;
    }

    // Search by transaction ID
    if (transactionSearch) {
      whereClause.id = { contains: transactionSearch, mode: "insensitive" };
    }

    // Build orderBy clause
    let orderBy: any = {};
    switch (sortBy) {
      case "date":
        orderBy = { date: sortOrder };
        break;
      case "amount":
        orderBy = { amount: sortOrder };
        break;
      case "updatedAt":
        orderBy = { updatedAt: sortOrder };
        break;
      default:
        orderBy = { date: sortOrder };
    }

    // Get transactions
    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      orderBy,
      skip: offset,
      take: limitNum,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Get total count
    const totalTransactions = await prisma.transaction.count({
      where: whereClause,
    });

    const result = {
      transactions,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalTransactions / limitNum),
        totalTransactions,
        hasNext: pageNum < Math.ceil(totalTransactions / limitNum),
        hasPrev: pageNum > 1,
      },
      success: true,
      message: "User transactions fetched successfully",
    };

    // Cache the result for 15 minutes
    await cacheSet(cacheKey, result, 15 * 60);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching user transactions:", error);
    return res.status(500).json({ error: "Error fetching user transactions" });
  }
};

// Todo: Implement the filtering by category and from date & to date & transaction type(income/expense), sorting by ascending or descending date & amount, search by keyword(transaction id) and pagination logic
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
    const userRole = req.user.role;

    const {
      page = "1",
      limit = "10",
      category = "",
      fromDate = "",
      toDate = "",
      transactionType = "",
      transactionSearch = "",
      sortBy = "date",
      sortOrder = "desc",
    } = req.query as TransactionQueryParams;

    const pageNum = Number.parseInt(page);
    const limitNum = Number.parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const cacheKey = `transactions:${userId}:${userRole}:${JSON.stringify(
      req.query
    )}`;

    // Try to get cached transactions
    const cachedTransactions = await cacheGet(cacheKey);
    if (cachedTransactions) {
      return res.status(200).json(cachedTransactions);
    }

    // Build where clause based on user role
    const whereClause: any = {};

    // Non-admin users can only see their own transactions
    if (userRole !== "ADMIN") {
      whereClause.userId = userId;
    }

    // Filter by category
    if (category) {
      whereClause.category = { contains: category, mode: "insensitive" };
    }

    // Filter by date range
    if (fromDate || toDate) {
      whereClause.date = {};
      if (fromDate) {
        whereClause.date.gte = convertToDateTime(fromDate);
      }
      if (toDate) {
        whereClause.date.lte = convertToDateTime(toDate);
      }
    }

    // Filter by transaction type
    if (transactionType && ["INCOME", "EXPENSE"].includes(transactionType)) {
      whereClause.type = transactionType;
    }

    // Search by transaction ID
    if (transactionSearch) {
      whereClause.id = { contains: transactionSearch, mode: "insensitive" };
    }

    // Build orderBy clause
    let orderBy: any = {};
    switch (sortBy) {
      case "date":
        orderBy = { date: sortOrder };
        break;
      case "amount":
        orderBy = { amount: sortOrder };
        break;
      case "updatedAt":
        orderBy = { updatedAt: sortOrder };
        break;
      default:
        orderBy = { date: sortOrder };
    }

    // Fetch from database with pagination
    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      orderBy,
      skip: offset,
      take: limitNum,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Get total count for pagination
    const totalTransactions = await prisma.transaction.count({
      where: whereClause,
    });

    const result = {
      transactions,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalTransactions / limitNum),
        totalTransactions,
        hasNext: pageNum < Math.ceil(totalTransactions / limitNum),
        hasPrev: pageNum > 1,
      },
      success: true,
      message: "Transactions fetched successfully",
    };

    // Cache the result for 15 minutes
    await cacheSet(cacheKey, result, 15 * 60);

    return res.status(200).json(result);
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

    const { type, amount, category, date } = validatedData.data;

    // Create a new transaction with proper date handling
    const transaction = await prisma.transaction.create({
      data: {
        type,
        amount,
        category,
        date: date ? convertToDateTime(date) : new Date(),
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Invalidate cache for transactions and analytics
    await cacheDel(`transactions:${userId}*`);
    await cacheDel(`analytics:*`);

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
    const userRole = req.user.role;

    // Validate request body
    const validatedData = transactionUpdateSchema.safeParse(req.body);
    if (!validatedData.success) {
      return res.status(400).json({
        success: false,
        message: validatedData.error.issues[0].message,
      });
    }

    // Build where clause based on user role
    const whereClause: any = { id: req.params.id };
    if (userRole !== "ADMIN") {
      whereClause.userId = userId;
    }

    const updateData: any = { ...validatedData.data };

    // Handle date conversion if date is provided
    if (updateData.date) {
      updateData.date = convertToDateTime(updateData.date);
    }

    // Update the transaction with these fields: amount, type, category
    const transaction = await prisma.transaction.update({
      where: whereClause,
      data: req.body,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    // Invalidate cache for transactions and analytics
    await cacheDel(`transactions:*`);
    await cacheDel(`analytics:*`);

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
    const userRole = req.user.role;

    // Build where clause based on user role
    const whereClause: any = { id: req.params.id };
    if (userRole !== "ADMIN") {
      whereClause.userId = userId;
    }

    // Delete the transaction
    const transaction = await prisma.transaction.delete({
      where: whereClause,
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    // Invalidate cache for transactions and analytics
    await cacheDel(`transactions:*`);
    await cacheDel(`analytics:*`);

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
