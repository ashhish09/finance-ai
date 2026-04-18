import TransactionModel from "../../models/transaction.model";
import { generatePDFReport } from "../../utils/pdf-report";

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

    const data = {
      income: income / 100,
      expense: expense / 100,
      savings: (income - expense) / 100,
      insights: [
        "Spend less on unnecessary items",
        "Increase SIP investments",
        "Maintain emergency fund",
      ],
    };

    generatePDFReport(data, `./reports/${userId}.pdf`);
  }
};