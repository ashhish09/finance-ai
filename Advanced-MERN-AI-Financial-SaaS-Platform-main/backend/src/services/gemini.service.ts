import { GoogleGenerativeAI } from "@google/generative-ai";
import { Env } from "../config/env.config";

const genAI = new GoogleGenerativeAI(Env.GEMINI_API_KEY);

export const geminiChatService = async (prompt: string) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  const result = await model.generateContent(prompt);
  const response = await result.response;

  return response.text();
};