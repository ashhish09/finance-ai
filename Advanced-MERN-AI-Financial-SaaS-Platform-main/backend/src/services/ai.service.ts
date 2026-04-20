import TransactionModel, {
  TransactionTypeEnum,
} from "../models/transaction.model";

export const generateAiInsightsService = async (userId: string) => {
  const transactions = await TransactionModel.find({ userId });

  if (!transactions.length) {
    return {
      summary: {},
      score: 0,
      insights: [
        "📊 Start adding transactions to unlock AI insights",
        "💡 AI will track your income, expenses, and savings in ₹",
      ],
    };
  }

  let totalIncome = 0;
  let totalExpense = 0;
  const categoryMap: Record<string, number> = {};

  transactions.forEach((t) => {
    if (t.type === TransactionTypeEnum.INCOME) {
      totalIncome += t.amount;
    } else {
      totalExpense += t.amount;
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    }
  });

  const savings = totalIncome - totalExpense;
  const expenseRatio = totalIncome ? (totalExpense / totalIncome) * 100 : 0;
  const savingsRate = totalIncome ? (savings / totalIncome) * 100 : 0;

  // 🇮🇳 INR formatter
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);

  const insights: string[] = [];

  // Budget check
  if (totalExpense > totalIncome * 0.5) {
    insights.push("⚠️ You exceeded the 50% budget rule — spending too high");
  } else {
    insights.push("✅ Your budget is well managed");
  }

  // Income & Expense
  insights.push(`📊 Total Expense: ${fmt(totalExpense)}`);
  insights.push(`💰 Total Income: ${fmt(totalIncome)}`);

  // Savings
  if (savingsRate > 20) {
    insights.push(`🎯 Great! You save ${savingsRate.toFixed(1)}% of income`);
  } else {
    insights.push("💡 Try to save at least 20% of income");
  }

  // Top category
  const topCategory = Object.entries(categoryMap).sort(
    (a, b) => b[1] - a[1]
  )[0];

  if (topCategory) {
    insights.push(
      `📌 Highest spending: ${topCategory[0]} (${fmt(topCategory[1])})`
    );
  }

  // Alert
  if (expenseRatio > 80) {
    insights.push("🚨 ALERT: You are spending more than 80% of income");
  }

  // Score
  let score = 100;
  if (expenseRatio > 80) score -= 30;
  if (savingsRate < 20) score -= 20;
  if (totalExpense > totalIncome) score -= 30;
  score = Math.max(score, 0);

  insights.push(`📈 Financial Score: ${score}/100`);

  // Investment
  if (score > 70) {
    insights.push("📈 You are ready for SIPs or index funds in India");
  } else {
    insights.push("💡 Focus on saving before investing");
  }

  // Goal
  const goal = totalIncome * 0.3;
  insights.push(`🎯 Recommended monthly savings goal: ${fmt(goal)}`);

  // Pattern
  insights.push(`📊 You spend ${expenseRatio.toFixed(1)}% of income`);

  // Tip
  insights.push("📰 Tip: Diversify with mutual funds & SIPs for wealth growth");

  return {
    summary: {
      income: totalIncome,
      expense: totalExpense,
      savings,
      savingsRate: parseFloat(savingsRate.toFixed(1)),
      expenseRatio: parseFloat(expenseRatio.toFixed(1)),
    },
    score,
    insights,
    topCategory: topCategory
      ? { name: topCategory[0], amount: topCategory[1] }
      : null,
  };
};