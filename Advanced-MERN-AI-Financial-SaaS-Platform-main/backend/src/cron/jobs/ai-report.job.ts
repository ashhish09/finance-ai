import ChatModel from "../../models/chat.model";
import TransactionModel from "../../models/transaction.model";
import { geminiChatService } from "../../services/gemini.service";

export const generateMonthlyReport = async () => {
  const users = await TransactionModel.distinct("userId");

  for (const userId of users) {
    const transactions = await TransactionModel.find({ userId });

    let income = 0;
    let expense = 0;

    transactions.forEach((t) => {
      if (t.type === "INCOME") income += t.amount;
      else expense += t.amount;
    });

    const prompt = `
Generate monthly financial report:

Income: ₹${income / 100}
Expense: ₹${expense / 100}
Savings: ₹${(income - expense) / 100}

Give:
- Summary
- Score /100
- 3 improvement tips
`;

    const report = await geminiChatService(prompt);

    console.log("MONTHLY REPORT:", report);
  }
};