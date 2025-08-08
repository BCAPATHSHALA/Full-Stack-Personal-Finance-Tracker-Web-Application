import { Request } from "express";

export const getAuthToken = (req: Request): string | undefined => {
  const token =
    req.headers?.token ||
    req.cookies?.token ||
    req.header("Authorization")?.replace("Bearer ", "");

  return typeof token === "string" ? token : undefined;
};
