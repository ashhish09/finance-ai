import TransactionModel from "../models/transaction.model";
import ChatModel from "../models/chat.model";
import { geminiChatService } from "./gemini.service";
import { mistralChatService } from "./mistral.service";

export const aiChatService = async (
  userId: string,
  message: string,
  mode: string = "friendly"
) => {
  const history = await ChatModel.find({ userId })
    .sort({ createdAt: -1 })
    .limit(10);

  const transactions = await TransactionModel.find({ userId });

  let income = 0;
  let expense = 0;

  transactions.forEach((t) => {
    if (t.type === "INCOME") income += t.amount;
    else expense += t.amount;
  });

  const savings = income - expense;
  const savingsRate = income ? ((savings / income) * 100).toFixed(1) : "0";

  // 🇮🇳 UPDATED: Full digits with rupee formatting
  let systemPrompt = `
You are a ${mode} AI Financial Coach named "Finora AI".

Rules:
- Keep responses concise (3-4 sentences)
- Use Indian Rupee (₹) currency ONLY - show full amounts like ₹${income.toLocaleString("en-IN")} not rounded
- Be practical and based on real user data
- Help improve financial habits
`;

  if (mode === "strict") {
    systemPrompt += "\nBe strict, disciplined, no sugar coating.";
  }

  if (mode === "investor") {
    systemPrompt +=
      "\nFocus on SIP, mutual funds, stocks, long-term wealth building in India.";
  }

  const memory = history
    .reverse()
    .map((h) => `${h.role}: ${h.message}`)
    .join("\n");

  const context = `
User Financial Snapshot:
- Monthly Income: ₹${income.toLocaleString("en-IN")}
- Monthly Expense: ₹${expense.toLocaleString("en-IN")}
- Net Savings: ₹${savings.toLocaleString("en-IN")}
- Savings Rate: ${savingsRate}%
`;

  const prompt = `
${systemPrompt}

${context}

Conversation History:
${memory}

User: ${message}

Reply as Finora AI:
`;

  try {
    return await geminiChatService(prompt);
  } catch (err) {
    console.log("Gemini failed → switching to Mistral");
    return await mistralChatService(prompt);
  }
};