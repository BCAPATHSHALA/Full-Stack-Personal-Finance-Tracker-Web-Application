import jwt from "jsonwebtoken";

export const generateToken = (
  payload: object,
  expiresIn?: jwt.SignOptions["expiresIn"]
) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET as string,
    expiresIn ? { expiresIn } : undefined
  );
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET!);
};
