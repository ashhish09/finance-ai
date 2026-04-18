import TransactionModel from "../models/transaction.model";
import ChatModel from "../models/chat.model";
import { geminiChatService } from "./gemini.service";
import { mistralChatService } from "./mistral.service";

export const aiChatService = async (
  userId: string,
  message: string,
  mode: string = "friendly"
) => {
  // 1. Memory (last 10 chats)
  const history = await ChatModel.find({ userId })
    .sort({ createdAt: -1 })
    .limit(10);

  // 2. Financial data — amounts are stored as-is (dollars), no division needed
  const transactions = await TransactionModel.find({ userId });

  let income = 0;
  let expense = 0;

  transactions.forEach((t) => {
    if (t.type === "INCOME") income += t.amount;
    else expense += t.amount;
  });

  const savings = income - expense;
  const savingsRate = income ? ((savings / income) * 100).toFixed(1) : "0";

  // 3. Personality system
  let systemPrompt = `
You are a ${mode} AI Financial Coach named "Finora AI".

Rules:
- Keep responses concise and actionable (max 3-4 sentences)
- Use USD ($) currency
- Be practical and specific to the user's actual numbers
- Help user improve money habits based on their real data
- Reference their actual income/expense/savings when relevant
`;

  if (mode === "strict") {
    systemPrompt += "\nBe direct, strict, and disciplined. No sugar-coating.";
  }
  if (mode === "investor") {
    systemPrompt +=
      "\nFocus on wealth-building: SIP, index funds, stocks, and long-term growth strategies.";
  }

  const memory = history
    .reverse()
    .map((h) => `${h.role}: ${h.message}`)
    .join("\n");

  const context = `
User's Financial Snapshot:
- Monthly Income: $${income.toLocaleString()}
- Monthly Expense: $${expense.toLocaleString()}
- Net Savings: $${savings.toLocaleString()}
- Savings Rate: ${savingsRate}%
`;

  const prompt = `
${systemPrompt}

${context}

Conversation History:
${memory}

User: ${message}

Reply as Finora AI:`;

  try {
    return await geminiChatService(prompt);
  } catch (err) {
    console.log("Gemini failed → switching to Mistral");
    return await mistralChatService(prompt);
  }
};