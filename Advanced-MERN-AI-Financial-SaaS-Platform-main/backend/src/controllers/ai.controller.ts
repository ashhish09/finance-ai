import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middlerware";
import { HTTPSTATUS } from "../config/http.config";
import { generateAiInsightsService } from "../services/ai.service";
import { AppError } from "../utils/app-error";
import { ErrorCodeEnum } from "../enums/error-code.enum";

export const getAiCoachController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as any; // ✅ cast

    if (!user?._id) {
      throw new AppError(
        "Unauthorized access",
        HTTPSTATUS.UNAUTHORIZED,
        ErrorCodeEnum.ACCESS_UNAUTHORIZED
      );
    }

    const data = await generateAiInsightsService(user._id);

    return res.status(HTTPSTATUS.OK).json({
      message: "AI Coach insights fetched successfully",
      data,
    });
  }
);