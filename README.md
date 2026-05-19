# CFIMA — Personal Finance Management

Track income & expenses, manage loans, and view monthly summaries — synced with **Google Sheets** and **Google Drive**.

## Stack

- React 19 + Vite + TypeScript (strict)
- Tailwind CSS + shadcn/ui
- React Router, TanStack Query, React Hook Form + Zod
- Express API proxy for Google Sheets/Drive (service account)

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Configure Google Cloud:

- Create a service account with Sheets & Drive API access
- Share your spreadsheet with the service account email (Editor)
- Set credentials path, `GOOGLE_SPREADSHEET_ID`, and `GOOGLE_DRIVE_FOLDER_ID` in `.env` (see `.env.example`)

**Drive attachments (required for file upload):** Service accounts cannot use storage in a personal **My Drive** folder. Pick one:

- **Shared drive (recommended):** In Google Workspace, create a [Shared drive](https://developers.google.com/workspace/drive/api/guides/about-shareddrives), add the service account as **Content manager**, create an attachments folder inside it, and set `GOOGLE_DRIVE_FOLDER_ID` to that folder’s ID (from the folder URL).
- **Impersonation (Workspace):** Enable [domain-wide delegation](https://developers.google.com/identity/protocols/oauth2/service-account#delegatingauthority) for the service account, grant Drive scope in Admin Console, set `GOOGLE_DRIVE_IMPERSONATE_USER` to your workspace email, and use a folder ID from that user’s Drive.

4. Run development (Vite + API server):

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173).

## Routes

| Path | Description |
|------|-------------|
| `/income-expense` | Income & expense tracking (default) |
| `/loans` | Loan card grid |
| `/loans/:loanId` | Loan payment breakdown |
| `/summary` | Monthly charts & summary |

## Sheet structure

- **Income_Expense** tab: `date`, `amount`, `description`, `finance type`, `google drive link`
- **One tab per loan** with metadata rows + payment schedule
