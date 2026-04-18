import { Mistral } from "@mistralai/mistralai";
import { Env } from "../config/env.config";

const client = new Mistral({
  apiKey: Env.MISTRAL_API_KEY,
});

export const mistralChatService = async (prompt: string) => {
  const response = await client.chat.complete({
    model: "mistral-large-latest",
    messages: [
      {
        role: "system",
        content:
          "You are a professional financial AI assistant. Give short practical advice.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return response.choices?.[0]?.message?.content || "";
};