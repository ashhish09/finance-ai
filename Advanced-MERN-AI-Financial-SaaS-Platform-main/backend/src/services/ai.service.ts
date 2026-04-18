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
        "💡 AI will track your budget, savings, and spending patterns",
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

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);

  const insights: string[] = [];

  // 1. BUDGETING
  if (totalExpense > totalIncome * 0.5) {
    insights.push("⚠️ You exceeded the 50% budget rule — spending is too high");
  } else {
    insights.push("✅ Your budget is well managed");
  }

  // 2. EXPENSE & INCOME
  insights.push(`📊 Total Expense: ${fmt(totalExpense)}`);
  insights.push(`💰 Total Income: ${fmt(totalIncome)}`);

  // 3. SAVINGS ANALYSIS
  if (savingsRate > 20) {
    insights.push(`🎯 Excellent! You are saving ${savingsRate.toFixed(1)}% of your income`);
  } else {
    insights.push("💡 Try to save at least 20% of your income");
  }

  // 4. TOP SPENDING CATEGORY
  const topCategory = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0];
  if (topCategory) {
    insights.push(
      `📌 Highest spending: ${topCategory[0]} (${fmt(topCategory[1])})`
    );
  }

  // 5. ALERTS
  if (expenseRatio > 80) {
    insights.push("🚨 ALERT: You are spending more than 80% of your income");
  }

  // 6. SCORE CALCULATION
  let score = 100;
  if (expenseRatio > 80) score -= 30;
  if (savingsRate < 20) score -= 20;
  if (totalExpense > totalIncome) score -= 30;
  score = Math.max(score, 0);

  insights.push(`📈 Financial Score: ${score}/100`);

  // 7. INVESTMENT INSIGHT
  if (score > 70) {
    insights.push("📈 You are ready for investments — consider index funds or SIPs");
  } else {
    insights.push("💡 Focus on growing your savings before investing");
  }

  // 8. GOAL SETTING
  const goal = totalIncome * 0.3;
  insights.push(`🎯 Recommended monthly savings goal: ${fmt(goal)}`);

  // 9. SPENDING PATTERN
  insights.push(`📊 You spend ${expenseRatio.toFixed(1)}% of your income`);

  // 10. TIP
  insights.push("📰 Tip: Diversify with index funds & ETFs for long-term wealth growth");

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