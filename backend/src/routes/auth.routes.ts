import { Router } from "express";
import bcrypt from "bcryptjs";
import { authLimiter } from "../middleware/ratelimit.middleware";
import { PrismaClient } from "../generated/prisma";
import { registerSchema, loginSchema } from "../schemas/auth.schema";
import { generateToken } from "../utils/jwt";

const prisma = new PrismaClient();
const router = Router();

// Register route: POST /api/auth/register
router.post("/register", authLimiter, async (req, res) => {
  try {
    // Validate request body against schema
    const validatedData = registerSchema.safeParse(req.body);
    if (!validatedData.success) {
      return res.status(400).json({
        success: false,
        message: validatedData.error.issues[0].message,
      });
    }

    const { name, email, password, role } = validatedData.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: role || "USER" },
    });

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Set token in cookies
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    // Return success response
    res
      .status(201)
      .json({ success: true, message: "User created successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Login route: POST /api/auth/login
router.post("/login", authLimiter, async (req, res) => {
  try {
    // Validate request body against schema
    const validatedData = loginSchema.safeParse(req.body);
    if (!validatedData.success) {
      return res.status(400).json({
        success: false,
        message: validatedData.error.issues[0].message,
      });
    }

    // Extract email and password
    const { email, password } = validatedData.data;

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Set token in cookies
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    // Return success response
    res.status(200).json({ success: true, message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
