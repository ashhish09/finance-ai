import cron from "node-cron";
import { processRecurringTransactions } from "./jobs/transaction.job";
import { processReportJob } from "./jobs/report.job";
import { aiAlertJob } from "./jobs/ai-alert.jobs";
import { generateMonthlyReport } from "./jobs/monthly-report.job";

const scheduleJob = (name: string, time: string, job: Function) => {
  console.log(`📅 Scheduling ${name} at ${time}`);

  return cron.schedule(
    time,
    async () => {
      try {
        console.log(`🚀 Running ${name}...`);
        await job();
        console.log(`✅ ${name} completed`);
      } catch (error) {
        console.log(`❌ ${name} failed`, error);
      }
    },
    {
      scheduled: true,
      timezone: "UTC",
    }
  );
};

export const startJobs = () => {
  return [
  
    scheduleJob("Transactions", "5 0 * * *", processRecurringTransactions),

   
    scheduleJob("Reports", "30 2 1 * *", processReportJob),

    scheduleJob("AI Alerts", "0 10 * * *", aiAlertJob),
  ];
};
scheduleJob("Monthly PDF Report", "0 0 1 * *", generateMonthlyReport);