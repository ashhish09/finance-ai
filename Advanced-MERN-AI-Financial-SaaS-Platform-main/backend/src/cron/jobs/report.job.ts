import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import ReportSettingModel from "../../models/report-setting.model";
import { UserDocument } from "../../models/user.model";
import mongoose from "mongoose";
import { generateReportService } from "../../services/report.service";
import ReportModel, { ReportStatusEnum } from "../../models/report.model";
import { calulateNextReportDate } from "../../utils/helper";
import { sendReportEmail } from "../../mailers/report.mailer";

export const processReportJob = async () => {
  const now = new Date();

  let processedCount = 0;
  let failedCount = 0;

  // Last month range
  const from = startOfMonth(subMonths(now, 1));
  const to = endOfMonth(subMonths(now, 1));

  try {
    const reportSettingCursor = ReportSettingModel.find({
      isEnabled: true,
      nextReportDate: { $lte: now },
    })
      .populate<{ userId: UserDocument }>("userId")
      .cursor();

    console.log("Running report job");

    for await (const setting of reportSettingCursor) {
      const user = setting.userId as UserDocument;

      if (!user) {
        console.log(`User not found for setting: ${setting._id}`);
        continue;
      }

      const userId = user._id.toString(); // ✅ FIX

      const session = await mongoose.startSession();

      try {
        const report = await generateReportService(userId, from, to);

        console.log(report, "report data");

        let emailSent = false;

        if (report) {
          try {
            await sendReportEmail({
              email: user.email!,
              username: user.name!,
              report: {
                period: report.period,
                totalIncome: report.summary.income,
                totalExpenses: report.summary.expenses,
                availableBalance: report.summary.balance,
                savingsRate: report.summary.savingsRate,
                topSpendingCategories: report.summary.topCategories,
                insights: report.insights,
              },
              frequency: setting.frequency!,
            });

            emailSent = true;
          } catch (error) {
            console.log(`Email failed for ${userId}`);
          }
        }

        await session.withTransaction(async () => {
          const bulkReports: any[] = [];
          const bulkSettings: any[] = [];

          if (report && emailSent) {
            bulkReports.push({
              insertOne: {
                document: {
                  userId: userId, // ✅ FIX
                  sentDate: now,
                  period: report.period,
                  status: ReportStatusEnum.SENT,
                  createdAt: now,
                  updatedAt: now,
                },
              },
            });

            bulkSettings.push({
              updateOne: {
                filter: { _id: setting._id },
                update: {
                  $set: {
                    lastSentDate: now,
                    nextReportDate: calulateNextReportDate(now),
                    updatedAt: now,
                  },
                },
              },
            });
          } else {
            bulkReports.push({
              insertOne: {
                document: {
                  userId: userId, // ✅ FIX
                  sentDate: now,
                  period:
                    report?.period ||
                    `${format(from, "MMMM d")}–${format(to, "d, yyyy")}`,
                  status: report
                    ? ReportStatusEnum.FAILED
                    : ReportStatusEnum.NO_ACTIVITY,
                  createdAt: now,
                  updatedAt: now,
                },
              },
            });

            bulkSettings.push({
              updateOne: {
                filter: { _id: setting._id },
                update: {
                  $set: {
                    // ⚠️ keep null only if schema allows it
                    lastSentDate: null,
                    nextReportDate: calulateNextReportDate(now),
                    updatedAt: now,
                  },
                },
              },
            });
          }

          await Promise.all([
            ReportModel.bulkWrite(bulkReports, { ordered: false }),
            ReportSettingModel.bulkWrite(bulkSettings, { ordered: false }),
          ]);
        });

        processedCount++;
      } catch (error) {
        console.log(`Failed to process report`, error);
        failedCount++;
      } finally {
        await session.endSession();
      }
    }

    console.log(`✅ Processed: ${processedCount} report`);
    console.log(`❌ Failed: ${failedCount} report`);

    return {
      success: true,
      processedCount,
      failedCount,
    };
  } catch (error) {
    console.error("Error processing reports", error);

    return {
      success: false,
      error: "Report process failed",
    };
  }
};