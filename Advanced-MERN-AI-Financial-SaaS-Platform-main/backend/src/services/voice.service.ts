import { geminiChatService } from "./gemini.service";
import { mistralChatService } from "./mistral.service";

export const voiceAIService = async (
  text: string,
  mode: string = "friendly"
) => {
  const systemPrompt = `
You are a financial voice assistant.

Personality: ${mode}

Rules:
- VERY short spoken sentences
- Natural human tone
- Use INR currency
- ALWAYS give direct advice first
- THEN ask one short follow-up question
- No long explanations
`;

  const prompt = `
${systemPrompt}

User said: ${text}

Reply format:
1. Advice (1-2 lines)
2. Optional question (1 line)
`;

  // ✅ 1. Try Gemini
  try {
    const res = await geminiChatService(prompt);
    if (res) return res;
  } catch (err) {
    console.log("Gemini failed → switching to Mistral");
  }

  // ✅ 2. Fallback to Mistral
  try {
    const res = await mistralChatService(prompt);
    if (res) return res;
  } catch (err) {
    console.log("Mistral failed");
  }

  // ✅ 3. Final fallback
  return "Start saving at least 20% of your income. Do you track your expenses?";
};