import PDFDocument from "pdfkit";
import fs from "fs";

type ReportData = {
  income: number;
  expense: number;
  savings: number;
  insights: string[];
};

export const generatePDFReport = (data: ReportData, filePath: string) => {
  const doc = new PDFDocument();

  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(20).text("📊 Monthly Financial Report");

  doc.moveDown();
  doc.fontSize(14);

  doc.text(`Income: ₹${data.income}`);
  doc.text(`Expense: ₹${data.expense}`);
  doc.text(`Savings: ₹${data.savings}`);

  doc.moveDown();
  doc.text("💡 AI Insights:");

  data.insights.forEach((i) => {
    doc.text("- " + i);
  });

  doc.end();
};