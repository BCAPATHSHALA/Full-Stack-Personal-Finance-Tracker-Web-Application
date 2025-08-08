import express from "express";
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

// Import routes
import authRoutes from "./routes/auth.routes";

// Use routes
app.use("/api/auth", authRoutes);

// health check route
app.get("/", (_, res) => {
  res.status(200).json({ message: "OK" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
