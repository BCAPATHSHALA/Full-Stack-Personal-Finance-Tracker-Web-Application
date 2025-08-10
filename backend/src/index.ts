import express from "express";
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

// Import routes
import authRoutes from "./routes/auth.routes";
import transactionRoutes from "./routes/transactions.routes";
import analyticsRoutes from "./routes/analytics.routes";

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/analytics", analyticsRoutes);

// health check route
app.get("/", (_, res) => {
  res.status(200).json({ message: "OK" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
