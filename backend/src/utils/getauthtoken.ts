import { Request } from "express";

export const getAuthToken = (req: Request): string | undefined => {
  return (
    (req.headers["token"] as string) ||
    req.cookies?.token ||
    (req.headers["authorization"] as string)?.replace("Bearer ", "")
  );
};
