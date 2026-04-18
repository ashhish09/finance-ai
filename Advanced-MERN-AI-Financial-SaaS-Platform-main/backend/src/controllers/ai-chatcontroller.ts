import { Request, Response } from "express";
import ChatModel from "../models/chat.model";
import { aiChatService } from "../services/ai-chat-service";
import { asyncHandler } from "../middlewares/asyncHandler.middlerware";
import { HTTPSTATUS } from "../config/http.config";

export const aiChatController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as any;

    if (!user?._id) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        message: "Unauthorized",
      });
    }

    const { message, mode = "friendly" } = req.body;

    if (!message) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        message: "Message is required",
      });
    }

    // save user msg
    await ChatModel.create({
      userId: user._id,
      role: "user",
      message,
      mode,
    });

    // AI reply
    const reply = await aiChatService(user._id, message, mode);

    // save AI msg
    await ChatModel.create({
      userId: user._id,
      role: "assistant",
      message: reply,
      mode,
    });

    return res.status(HTTPSTATUS.OK).json({
      message: "AI chat response",
      reply,
    });
  }
);