# Monthly — Personal Finance Management

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

## Desktop app (Electron, fully offline)

Monthly can be packaged as a **fully offline** desktop app (macOS/Windows/Linux) using Electron. In production, Electron starts the local Express server on `127.0.0.1` and opens a window to it; SQLite + attachments are stored on-device under the OS user data directory.

### Dev (desktop)

```bash
pnpm dev:desktop
```

This runs:
- Vite dev server (`http://localhost:5173`)
- Express API server (`http://localhost:3001`)
- Electron pointed at the Vite dev server

### Build (desktop)

```bash
pnpm build:desktop
```

Build outputs:
- `dist/` (Vite UI)
- `dist-server/` (compiled Express server)
- `dist-electron/` (Electron main/preload)

### Package installers

```bash
pnpm dist
```

Artifacts are written to `release/`.

## Data storage

All data lives under `./data/` (configurable via `DATA_DIR` and `DATABASE_PATH`):

| Path | Contents |
|------|----------|
| `data/cfima.db` | SQLite database (transactions, loans, payments) |
| `data/attachments/` | Uploaded receipt and payment files |

No Google account or internet connection is required after install.

### Desktop data location

In the Electron desktop build, data is stored under Electron’s per-user app data directory:
- **SQLite DB**: `<userData>/data/cfima.db`
- **Attachments**: `<userData>/data/attachments/`

## Export / download

Use **Download data** in the sidebar (or mobile header) to export everything as a JSON file (`monthly-export-YYYY-MM-DD.json`). Individual loans can also export CSV from the loan actions menu.

## Desktop smoke test checklist

- **Fresh install**: app launches; DB is created under `<userData>/data/cfima.db`
- **CRUD**: create/edit/delete a transaction; create a loan; create a budget month
- **Attachments**: upload a receipt/payment file; verify it’s readable via the UI
- **Export**: use Download data (`/api/export`) and confirm JSON downloads
- **Offline**: disable network and confirm the app still works (everything is local)

## Routes

| Path | Description |
|------|-------------|
| `/monthly` | Monthly planning (with Ledger tab) |
| `/loans` | Loan card grid |
| `/loans/:loanId` | Loan payment breakdown |
| `/summary` | Monthly charts & summary |

## Deploy on Render

Monthly runs as **one Web Service**: Express serves the API and the built React app. SQLite and attachments live on a **persistent disk** so data survives redeploys.

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
