import { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";
const prisma = new PrismaClient();
import { cacheGet, cacheSet } from "../utils/redis";

const ANALYTICS_TTL = 15 * 60; // 15 minutes
const CATEGORIES_TTL = 60 * 60; // 1 hour

interface QueryParams {
  page?: string;
  limit?: string;
  search?: string;
  role?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface UserAnalyticsQueryParams extends QueryParams {
  category?: string;
  fromDate?: string;
  toDate?: string;
  transactionType?: "INCOME" | "EXPENSE";
  transactionSearch?: string;
}

//! Step 1: Get analytics overview for all users: GET /analytics
export const getTransactionAnalyticsOverviewController = async (
  req: Request,
  res: Response
) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }

    const {
      page = "1",
      limit = "10",
      search = "",
      role = "",
      sortBy = "name",
      sortOrder = "asc",
    } = req.query as QueryParams;

    const pageNum = Number.parseInt(page);
    const limitNum = Number.parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Create cache key based on query parameters
    const cacheKey = `analytics:overview:${JSON.stringify(req.query)}`;

    // Try to get cached data
    const cachedData = await cacheGet(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    // Build where clause for filtering
    const whereClause: any = {};

    // Search by name or email
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Filter by role
    if (role && ["ADMIN", "USER", "READ_ONLY"].includes(role)) {
      whereClause.role = role;
    }

    // Build orderBy clause
    let orderBy: any = {};
    switch (sortBy) {
      case "name":
        orderBy = { name: sortOrder };
        break;
      case "joinedDate":
        orderBy = { createdAt: sortOrder };
        break;
      case "transactionCount":
        orderBy = { name: "asc" };
        break;
      default:
        orderBy = { name: sortOrder };
    }

    // Get users with transaction aggregations
    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        transactions: {
          select: {
            amount: true,
            type: true,
          },
        },
      },
      orderBy: sortBy !== "transactionCount" ? orderBy : undefined,
      skip: offset,
      take: limitNum,
    });

    // Get total count for pagination
    const totalUsers = await prisma.user.count({ where: whereClause });

    // Calculate analytics for each user
    const analyticsData = users.map((user) => {
      const transactions = user.transactions;
      const transactionCount = transactions.length;

      const totalIncome = transactions
        .filter((t) => t.type === "INCOME")
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpense = transactions
        .filter((t) => t.type === "EXPENSE")
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        joinedDate: user.createdAt,
        transactionCount,
        totalIncome,
        totalExpense,
        netAmount: totalIncome - totalExpense,
      };
    });

    // Sort by transaction count if requested
    if (sortBy === "transactionCount") {
      analyticsData.sort((a, b) => {
        const comparison = a.transactionCount - b.transactionCount;
        return sortOrder === "desc" ? -comparison : comparison;
      });
    }

    const result = {
      users: analyticsData,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalUsers / limitNum),
        totalUsers,
        hasNext: pageNum < Math.ceil(totalUsers / limitNum),
        hasPrev: pageNum > 1,
        limit: limitNum,
      },
      success: true,
      message: "Analytics overview fetched successfully",
    };

    // Cache the result
    await cacheSet(cacheKey, result, ANALYTICS_TTL);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching analytics overview:", error);
    return res.status(500).json({ error: "Error fetching analytics overview" });
  }
};

//! Step 2: Get user-specific analytics: GET /analytics/user/:id
export const getUserTransactionAnalyticsController = async (
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

    // Authorization check: users can only view their own data unless they are admin
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
    } = req.query as UserAnalyticsQueryParams;

    const pageNum = Number.parseInt(page);
    const limitNum = Number.parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Create cache key
    const cacheKey = `analytics:user:${targetUserId}:${JSON.stringify(
      req.query
    )}`;

    // Try to get cached data
    const cachedData = await cacheGet(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    // Get user information
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Build where clause for transactions
    const transactionWhere: any = { userId: targetUserId };

    // Filter by category
    if (category) {
      transactionWhere.category = { contains: category, mode: "insensitive" };
    }

    // Filter by date range
    if (fromDate || toDate) {
      transactionWhere.date = {};
      if (fromDate) {
        transactionWhere.date.gte = new Date(fromDate);
      }
      if (toDate) {
        transactionWhere.date.lte = new Date(toDate);
      }
    }

    // Filter by transaction type
    if (transactionType && ["INCOME", "EXPENSE"].includes(transactionType)) {
      transactionWhere.type = transactionType;
    }

    // Search by transaction ID
    if (transactionSearch) {
      transactionWhere.id = {
        contains: transactionSearch,
        mode: "insensitive",
      };
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

    // Get transactions with pagination
    const transactions = await prisma.transaction.findMany({
      where: transactionWhere,
      orderBy,
      skip: offset,
      take: limitNum,
      select: {
        id: true,
        date: true,
        updatedAt: true,
        amount: true,
        category: true,
        type: true,
      },
    });

    // Get total count for pagination
    const totalTransactions = await prisma.transaction.count({
      where: transactionWhere,
    });

    // Get overall user analytics
    const allUserTransactions = await prisma.transaction.findMany({
      where: { userId: targetUserId },
      select: {
        amount: true,
        type: true,
      },
    });

    const totalIncome = allUserTransactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = allUserTransactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0);

    // Get unique categories for filtering options
    const categories = await prisma.transaction.findMany({
      where: { userId: targetUserId },
      select: { category: true },
      distinct: ["category"],
    });

    const result = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        joinedDate: user.createdAt,
        transactionCount: allUserTransactions.length,
        totalIncome,
        totalExpense,
        netAmount: totalIncome - totalExpense,
      },
      transactions,
      categories: categories.map((c) => c.category),
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalTransactions / limitNum),
        totalTransactions,
        hasNext: pageNum < Math.ceil(totalTransactions / limitNum),
        hasPrev: pageNum > 1,
        limit: limitNum,
      },
      success: true,
      message: "User analytics fetched successfully",
    };

    // Cache the result
    await cacheSet(cacheKey, result, ANALYTICS_TTL);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching user analytics:", error);
    return res.status(500).json({ error: "Error fetching user analytics" });
  }
};
