import "dotenv/config";
import cors from "cors";
import express from "express";
import multer from "multer";
import {
  appendRow,
  deleteRow,
  deleteSheetTab,
  getSpreadsheetUrl,
  listSheetTabs,
  readSheet,
  addSheetTab,
  renameSheetTab,
  updateRow,
  uploadFile,
  writeSheetRange,
} from "./google-client.js";

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/sheets/tabs", async (_req, res) => {
  try {
    const tabs = await listSheetTabs();
    res.json(tabs);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get("/api/sheets/read", async (req, res) => {
  try {
    const tab = String(req.query.tab);
    const range = req.query.range ? String(req.query.range) : undefined;
    const data = await readSheet(tab, range);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post("/api/sheets/append", async (req, res) => {
  try {
    const { tab, values } = req.body as { tab: string; values: string[] };
    const rowIndex = await appendRow(tab, values);
    res.json({ rowIndex });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.put("/api/sheets/update", async (req, res) => {
  try {
    const { tab, rowIndex, values } = req.body as {
      tab: string;
      rowIndex: number;
      values: string[];
    };
    await updateRow(tab, rowIndex, values);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.delete("/api/sheets/row", async (req, res) => {
  try {
    const { tab, rowIndex } = req.body as { tab: string; rowIndex: number };
    await deleteRow(tab, rowIndex);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post("/api/sheets/write-range", async (req, res) => {
  try {
    const { tab, range, values } = req.body as {
      tab: string;
      range: string;
      values: string[][];
    };
    await writeSheetRange(tab, range, values);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post("/api/sheets/tab", async (req, res) => {
  try {
    const { action, name, oldName } = req.body as {
      action: "add" | "rename" | "delete";
      name: string;
      oldName?: string;
    };
    if (action === "add") await addSheetTab(name);
    else if (action === "rename" && oldName) await renameSheetTab(oldName, name);
    else if (action === "delete") await deleteSheetTab(name);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post("/api/drive/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file provided" });
      return;
    }
    const result = await uploadFile(req.file.originalname, req.file.mimetype, req.file.buffer);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get("/api/spreadsheet-url", (_req, res) => {
  try {
    res.json({ url: getSpreadsheetUrl() });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

const PORT = Number(process.env.PORT ?? 3001);
app.listen(PORT, () => {
  console.log(`CFIMA API server running on http://localhost:${PORT}`);
});
