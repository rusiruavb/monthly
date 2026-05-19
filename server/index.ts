import "dotenv/config";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import cors from "cors";
import express from "express";
import multer from "multer";
import { getAttachmentPath, saveAttachment } from "./db/attachments.js";
import { getDb } from "./db/index.js";
import {
  createLoan,
  deleteLoan,
  exportAllData,
  getLoan,
  getPayment,
  listLoans,
  listPayments,
  updateLoan,
  updatePaymentAttachment,
  updatePaymentStatus,
} from "./db/loans.js";
import {
  createTransaction,
  deleteTransaction,
  listTransactions,
  updateTransaction,
} from "./db/transactions.js";

getDb();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const isProduction = process.env.NODE_ENV === "production";
const clientUrl =
  process.env.CLIENT_URL ??
  process.env.RENDER_EXTERNAL_URL ??
  "http://localhost:5173";

app.use(
  cors({
    origin: isProduction ? true : clientUrl,
  }),
);
app.use(express.json({ limit: "10mb" }));

function fileUrl(path: string | null): string {
  if (!path) return "";
  return `/api/files/${encodeURIComponent(path)}`;
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

// Transactions
app.get("/api/transactions", (_req, res) => {
  try {
    const rows = listTransactions();
    res.json(
      rows.map((r) => ({
        rowIndex: r.id,
        date: r.date,
        amount: r.amount,
        description: r.description,
        financeType: r.finance_type,
        driveLink: fileUrl(r.attachment_path),
        fileName: r.attachment_name ?? "",
      })),
    );
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post("/api/transactions", upload.single("file"), (req, res) => {
  try {
    const { date, amount, description, financeType } = req.body as {
      date: string;
      amount: string;
      description: string;
      financeType: string;
    };
    let attachmentPath: string | null = null;
    let attachmentName: string | null = null;
    if (req.file) {
      const saved = saveAttachment(req.file.buffer, req.file.originalname);
      attachmentPath = saved.path;
      attachmentName = saved.name;
    }
    const id = createTransaction({
      date,
      amount: Number(amount),
      description: description ?? "",
      financeType,
      attachmentPath,
      attachmentName,
    });
    res.json({ rowIndex: id });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.put("/api/transactions/:id", upload.single("file"), (req, res) => {
  try {
    const id = Number(req.params.id);
    const { date, amount, description, financeType, keepAttachment } = req.body as {
      date: string;
      amount: string;
      description: string;
      financeType: string;
      keepAttachment?: string;
    };
    const existing = listTransactions().find((t) => t.id === id);
    if (!existing) {
      res.status(404).json({ error: "Transaction not found" });
      return;
    }
    let attachmentPath = keepAttachment === "true" ? existing.attachment_path : null;
    let attachmentName = keepAttachment === "true" ? existing.attachment_name : null;
    if (req.file) {
      const saved = saveAttachment(req.file.buffer, req.file.originalname);
      attachmentPath = saved.path;
      attachmentName = saved.name;
    }
    updateTransaction(id, {
      date,
      amount: Number(amount),
      description: description ?? "",
      financeType,
      attachmentPath,
      attachmentName,
    });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.delete("/api/transactions/:id", (req, res) => {
  try {
    deleteTransaction(Number(req.params.id));
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Loans
function mapLoan(loanId: string) {
  const loan = getLoan(loanId);
  if (!loan) return null;
  const payments = listPayments(loanId);
  const paidCount = payments.filter((p) => p.status === "paid").length;
  return {
    id: loan.id,
    name: loan.name,
    type: loan.type,
    months: loan.months,
    monthlyPayment: loan.monthly_payment,
    paidCount,
    status: paidCount === loan.months && loan.months > 0 ? "complete" : "active",
    payments: payments.map((p) => ({
      rowIndex: p.id,
      month: p.month_label,
      paymentAmount: p.payment_amount,
      principalAmount: p.principal_amount,
      interestAmount: p.interest_amount,
      remainingBalance: p.remaining_balance,
      attachedFile: p.attachment_name ?? "",
      fileName: p.attachment_name ?? "",
      fileLink: fileUrl(p.attachment_path),
      status: p.status,
    })),
  };
}

app.get("/api/loans", (_req, res) => {
  try {
    const loans = listLoans()
      .map((l) => mapLoan(l.id))
      .filter(Boolean);
    res.json(loans);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get("/api/loans/:id", (req, res) => {
  try {
    const loan = mapLoan(req.params.id);
    if (!loan) {
      res.status(404).json({ error: "Loan not found" });
      return;
    }
    res.json(loan);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post("/api/loans", (req, res) => {
  try {
    const { name, type, months, monthlyPayment } = req.body as {
      name: string;
      type: string;
      months: number;
      monthlyPayment: number;
    };
    const id = createLoan({ name, type, months, monthlyPayment });
    res.json({ id, name });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.put("/api/loans/:id", (req, res) => {
  try {
    const { name, type, months, monthlyPayment } = req.body as {
      name: string;
      type: string;
      months: number;
      monthlyPayment: number;
    };
    const id = updateLoan(req.params.id, { name, type, months, monthlyPayment });
    res.json({ id, name });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.delete("/api/loans/:id", (req, res) => {
  try {
    deleteLoan(req.params.id);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.patch("/api/loans/:loanId/payments/:paymentId/status", (req, res) => {
  try {
    const payment = getPayment(Number(req.params.paymentId));
    if (!payment || payment.loan_id !== req.params.loanId) {
      res.status(404).json({ error: "Payment not found" });
      return;
    }
    const newStatus = payment.status === "paid" ? "pending" : "paid";
    updatePaymentStatus(payment.id, newStatus);
    res.json({ status: newStatus });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post(
  "/api/loans/:loanId/payments/:paymentId/file",
  upload.single("file"),
  (req, res) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file provided" });
        return;
      }
      const payment = getPayment(Number(req.params.paymentId));
      if (!payment || payment.loan_id !== req.params.loanId) {
        res.status(404).json({ error: "Payment not found" });
        return;
      }
      const saved = saveAttachment(req.file.buffer, req.file.originalname);
      updatePaymentAttachment(payment.id, saved.path, saved.name);
      res.json({ name: saved.name, link: fileUrl(saved.path) });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  },
);

// Files
app.get("/api/files/:filename", (req, res) => {
  try {
    const filename = decodeURIComponent(req.params.filename);
    if (filename.includes("..") || filename.includes("/")) {
      res.status(400).json({ error: "Invalid file" });
      return;
    }
    res.sendFile(getAttachmentPath(filename));
  } catch {
    res.status(404).json({ error: "File not found" });
  }
});

// Export
app.get("/api/export", (_req, res) => {
  try {
    const data = exportAllData();
    const filename = `cfima-export-${new Date().toISOString().slice(0, 10)}.json`;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(JSON.stringify(data, null, 2));
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Production: serve Vite build (single service on Render)
const distPath = resolve(process.cwd(), "dist");
if (isProduction && existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(join(distPath, "index.html"));
  });
}

const PORT = Number(process.env.PORT ?? 3001);
const HOST = process.env.HOST ?? "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`CFIMA running on http://${HOST}:${PORT}`);
  if (isProduction) {
    console.log(`Data directory: ${process.env.DATA_DIR ?? "./data"}`);
  }
});
