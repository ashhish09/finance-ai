import { Request, Response } from "express";
import { voiceAIService } from "../services/voice.service";
import { asyncHandler } from "../middlewares/asyncHandler.middlerware";
import { HTTPSTATUS } from "../config/http.config";

export const voiceChatController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { message, mode = "friendly" } = req.body;

    if (!message) {
      res.status(HTTPSTATUS.BAD_REQUEST).json({
        message: "Voice input is required",
      });
      return;
    }

    const reply = await voiceAIService(message, mode);

    res.status(HTTPSTATUS.OK).json({
      success: true,
      reply,
    });
  }
);