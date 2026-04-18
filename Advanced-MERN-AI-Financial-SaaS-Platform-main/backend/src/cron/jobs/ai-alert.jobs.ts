import TransactionModel, {
  TransactionTypeEnum,
} from "../../models/transaction.model";
import { resend } from "../../config/resend.config";

export const aiAlertJob = async () => {
  const users = await TransactionModel.distinct("userId");

  for (const userId of users) {
    const transactions = await TransactionModel.find({ userId });

    let expense = 0;

    transactions.forEach((t) => {
      if (t.type === TransactionTypeEnum.EXPENSE) {
        expense += t.amount;
      }
    });

    if (expense > 70000 * 100) {
      await resend.emails.send({
        from: "AI Finance <onboarding@resend.dev>",
        to: "user@example.com",
        subject: "⚠️ Overspending Alert",
        html: `<p>You are spending too much. Expense: ₹${expense / 100}</p>`,
      });
    }
  }
};