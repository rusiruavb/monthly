# CFIMA — Personal Finance Management

Track income & expenses, manage loans, and view monthly summaries — stored locally in **SQLite** on your device.

## Stack

- React 19 + Vite + TypeScript (strict)
- Tailwind CSS + shadcn/ui
- React Router, TanStack Query, React Hook Form + Zod
- Express API + SQLite (`better-sqlite3`)

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Copy environment variables (optional — defaults work for local dev):

```bash
cp .env.example .env
```

3. Run development (Vite + API server):

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173).

## Data storage

All data lives under `./data/` (configurable via `DATA_DIR` and `DATABASE_PATH`):

| Path | Contents |
|------|----------|
| `data/cfima.db` | SQLite database (transactions, loans, payments) |
| `data/attachments/` | Uploaded receipt and payment files |

No Google account or internet connection is required after install.

## Export / download

Use **Download data** in the sidebar (or mobile header) to export everything as a JSON file (`cfima-export-YYYY-MM-DD.json`). Individual loans can also export CSV from the loan actions menu.

## Routes

| Path | Description |
|------|-------------|
| `/income-expense` | Income & expense tracking (default) |
| `/loans` | Loan card grid |
| `/loans/:loanId` | Loan payment breakdown |
| `/summary` | Monthly charts & summary |

## Deploy on Render

CFIMA runs as **one Web Service**: Express serves the API and the built React app. SQLite and attachments live on a **persistent disk** so data survives redeploys.

### Requirements

- [Render](https://render.com) account
- **Starter plan (or higher)** for the web service — a **persistent disk** is required (`render.yaml` mounts 1 GB at `/var/data`)
- The free web tier uses ephemeral disk; **data is lost on redeploy** — not suitable for production

### Option A — Blueprint (recommended)

1. Push this repo to GitHub.
2. In Render: **New → Blueprint** → connect the repo.
3. Render applies [`render.yaml`](render.yaml).
4. Set `CLIENT_URL` to your service URL, e.g. `https://cfima.onrender.com` (Render also sets `RENDER_EXTERNAL_URL`).
5. Deploy.

### Option B — Manual Web Service

| Setting | Value |
|---------|--------|
| **Build command** | `pnpm install && pnpm build` |
| **Start command** | `pnpm start` |
| **Health check** | `/api/health` |

**Environment variables:**

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `DATA_DIR` | `/var/data` |
| `DATABASE_PATH` | `/var/data/cfima.db` |
| `CLIENT_URL` | `https://<your-service>.onrender.com` |

**Disk:** add a persistent disk, mount path `/var/data`, size 1 GB (or more).

### After deploy

- Open `https://<your-service>.onrender.com`
- Use **Download data** regularly for backups (disk is durable, but backups are still wise)

### Local production smoke test

```bash
pnpm build
NODE_ENV=production DATA_DIR=./data DATABASE_PATH=./data/cfima.db pnpm start
# open http://localhost:3001
```

## Upgrading from Google Sheets version

If you previously used the Google OAuth version, delete the old database and start fresh:

```bash
rm -rf ./data
```

Then run `pnpm dev` again.
