import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";

const __dirname = dirname(fileURLToPath(import.meta.url));

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  const dbPath = resolve(process.cwd(), process.env.DATABASE_PATH ?? "./data/cfima.db");
  mkdirSync(dirname(dbPath), { recursive: true });

  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  const schema = readFileSync(resolve(__dirname, "schema.sql"), "utf8");
  db.exec(schema);

  // Lightweight migrations (SQLite): add new columns if missing.
  ensureBudgetColumns(db);
  ensureTransactionAndLoanColumns(db);
  ensureIndexes(db);

  return db;
}

function hasColumn(db: Database.Database, table: string, column: string): boolean {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  return rows.some((r) => r.name === column);
}

function addColumn(
  db: Database.Database,
  table: string,
  column: string,
  sqlTypeAndConstraints: string,
) {
  db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${sqlTypeAndConstraints}`);
}

function ensureBudgetColumns(db: Database.Database) {
  // recurring_budget_items: fixed deposit support
  if (!hasColumn(db, "recurring_budget_items", "item_type")) {
    addColumn(
      db,
      "recurring_budget_items",
      "item_type",
      "TEXT NOT NULL DEFAULT 'regular' CHECK (item_type IN ('regular', 'fixed_deposit'))",
    );
  }
  if (!hasColumn(db, "recurring_budget_items", "fixed_deposit_day")) {
    addColumn(db, "recurring_budget_items", "fixed_deposit_day", "INTEGER");
  }
  if (!hasColumn(db, "recurring_budget_items", "fixed_deposit_maturity_months")) {
    addColumn(db, "recurring_budget_items", "fixed_deposit_maturity_months", "INTEGER");
  }
  if (!hasColumn(db, "recurring_budget_items", "fixed_deposit_interest_rate")) {
    addColumn(db, "recurring_budget_items", "fixed_deposit_interest_rate", "REAL");
  }
  if (!hasColumn(db, "recurring_budget_items", "savings_bucket")) {
    addColumn(
      db,
      "recurring_budget_items",
      "savings_bucket",
      "TEXT NOT NULL DEFAULT 'savings' CHECK (savings_bucket IN ('savings', 'one_off'))",
    );
  }
  if (!hasColumn(db, "recurring_budget_items", "feature_category")) {
    addColumn(db, "recurring_budget_items", "feature_category", "TEXT");
  }

  // monthly_budget_lines: fixed deposit instances
  if (!hasColumn(db, "monthly_budget_lines", "item_type")) {
    addColumn(
      db,
      "monthly_budget_lines",
      "item_type",
      "TEXT NOT NULL DEFAULT 'regular' CHECK (item_type IN ('regular', 'fixed_deposit'))",
    );
  }
  if (!hasColumn(db, "monthly_budget_lines", "fixed_deposit_date")) {
    addColumn(db, "monthly_budget_lines", "fixed_deposit_date", "TEXT");
  }
  if (!hasColumn(db, "monthly_budget_lines", "fixed_deposit_maturity_months")) {
    addColumn(db, "monthly_budget_lines", "fixed_deposit_maturity_months", "INTEGER");
  }
  if (!hasColumn(db, "monthly_budget_lines", "fixed_deposit_interest_rate")) {
    addColumn(db, "monthly_budget_lines", "fixed_deposit_interest_rate", "REAL");
  }
  if (!hasColumn(db, "monthly_budget_lines", "savings_bucket")) {
    addColumn(
      db,
      "monthly_budget_lines",
      "savings_bucket",
      "TEXT NOT NULL DEFAULT 'savings' CHECK (savings_bucket IN ('savings', 'one_off'))",
    );
  }
  if (!hasColumn(db, "monthly_budget_lines", "feature_category")) {
    addColumn(db, "monthly_budget_lines", "feature_category", "TEXT");
  }
  if (!hasColumn(db, "monthly_budget_lines", "planned_date")) {
    addColumn(db, "monthly_budget_lines", "planned_date", "TEXT");
  }
}

function ensureTransactionAndLoanColumns(db: Database.Database) {
  // transactions: category + loan linkage
  if (!hasColumn(db, "transactions", "category")) {
    addColumn(db, "transactions", "category", "TEXT");
  }
  if (!hasColumn(db, "transactions", "loan_payment_id")) {
    addColumn(
      db,
      "transactions",
      "loan_payment_id",
      "INTEGER REFERENCES loan_payments(id) ON DELETE SET NULL",
    );
  }

  // loan_payments: optional backlink to transaction
  if (!hasColumn(db, "loan_payments", "transaction_id")) {
    addColumn(
      db,
      "loan_payments",
      "transaction_id",
      "INTEGER REFERENCES transactions(id) ON DELETE SET NULL",
    );
  }
}

function ensureIndexes(db: Database.Database) {
  // Indexes on columns added via migrations must run after ensure*Column helpers.
  if (hasColumn(db, "transactions", "loan_payment_id")) {
    db.exec(
      "CREATE INDEX IF NOT EXISTS idx_transactions_loan_payment_id ON transactions(loan_payment_id)",
    );
  }
  if (hasColumn(db, "loan_payments", "transaction_id")) {
    db.exec(
      "CREATE INDEX IF NOT EXISTS idx_loan_payments_transaction_id ON loan_payments(transaction_id)",
    );
  }
}
