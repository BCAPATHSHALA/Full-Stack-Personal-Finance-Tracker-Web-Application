import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getAuthToken } from "../utils/getauthtoken";

export interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = getAuthToken(req);
    console.log("token:", token?.length);

    if (!token) {
      return res.status(401).json({ message: "You are not signed in" });
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decodedData;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
