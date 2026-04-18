import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { HTTPSTATUS } from "../config/http.config";
import { AppError } from "../utils/app-error";
import { ErrorCodeEnum } from "../enums/error-code.enum";

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(
        "Unauthorized",
        HTTPSTATUS.UNAUTHORIZED,
        ErrorCodeEnum.ACCESS_UNAUTHORIZED
      );
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    req.user = decoded;

    next();
  } catch (error) {
    next(
      new AppError(
        "Invalid or expired token",
        HTTPSTATUS.UNAUTHORIZED,
        ErrorCodeEnum.ACCESS_UNAUTHORIZED
      )
    );
  }
};