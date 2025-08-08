import { z } from "zod";
import { TransactionTypes } from "../constants/data";

export const transactionCreateSchema = z.object({
  type: z.enum(TransactionTypes).default("EXPENSE"),
  amount: z.number().positive("Amount must be a positive number"),
  category: z.string().min(1, "Category is required"),
  date: z.string().optional(),
});

export const transactionUpdateSchema = z.object({
  type: z.enum(TransactionTypes).optional(),
  amount: z.number().positive().optional(),
  category: z.string().min(1).optional(),
  date: z.string().optional(),
});
