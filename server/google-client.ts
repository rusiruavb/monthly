import { Readable } from "node:stream";
import { google } from "googleapis";
import type { drive_v3, sheets_v4 } from "googleapis";
import { loadServiceAccountCredentials } from "./credentials.js";

const DRIVE_SHARED_OPTS = {
  supportsAllDrives: true,
  supportsTeamDrives: true,
} as const;

function getAuth() {
  const credentials = loadServiceAccountCredentials();
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

/** Drive auth: optional impersonation (Workspace) or drive.file for Shared Drive folders. */
function getDriveAuth() {
  const credentials = loadServiceAccountCredentials();
  const subject = process.env.GOOGLE_DRIVE_IMPERSONATE_USER?.trim();
  return new google.auth.GoogleAuth({
    credentials,
    scopes: subject
      ? ["https://www.googleapis.com/auth/drive"]
      : ["https://www.googleapis.com/auth/drive.file"],
    clientOptions: subject ? { subject } : undefined,
  });
}

function getSpreadsheetId(): string {
  const id = process.env.GOOGLE_SPREADSHEET_ID;
  if (!id) throw new Error("GOOGLE_SPREADSHEET_ID is not set");
  return id;
}

function getDriveFolderId(): string {
  const id = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!id) throw new Error("GOOGLE_DRIVE_FOLDER_ID is not set");
  return id;
}

async function getSheets(): Promise<sheets_v4.Sheets> {
  const auth = getAuth();
  return google.sheets({ version: "v4", auth });
}

async function getDrive(): Promise<drive_v3.Drive> {
  const auth = getDriveAuth();
  return google.drive({ version: "v3", auth });
}

function formatDriveUploadError(error: unknown): Error {
  const message = error instanceof Error ? error.message : String(error);
  if (!message.includes("storage quota")) return error instanceof Error ? error : new Error(message);

  const impersonate = process.env.GOOGLE_DRIVE_IMPERSONATE_USER?.trim();
  if (impersonate) {
    return new Error(
      `Drive upload failed for impersonated user "${impersonate}". ` +
        "Check domain-wide delegation for the service account and that the folder ID is valid.",
    );
  }

  return new Error(
    "Service accounts cannot store files in a personal My Drive folder. Use one of:\n" +
      "1. Shared drive: create a Shared drive (Google Workspace), add the service account as " +
      "Content manager, put attachments in a folder there, set GOOGLE_DRIVE_FOLDER_ID to that folder ID.\n" +
      "2. Workspace impersonation: set GOOGLE_DRIVE_IMPERSONATE_USER to your workspace email, " +
      "enable domain-wide delegation for the service account, and use a folder in that user's Drive.",
  );
}

export async function listSheetTabs(): Promise<string[]> {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.get({ spreadsheetId: getSpreadsheetId() });
  return res.data.sheets?.map((s) => s.properties?.title ?? "").filter(Boolean) ?? [];
}

export async function readSheet(tab: string, range?: string): Promise<string[][]> {
  const sheets = await getSheets();
  const fullRange = range ? `'${tab}'!${range}` : `'${tab}'`;
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: getSpreadsheetId(),
    range: fullRange,
  });
  return (res.data.values as string[][]) ?? [];
}

export async function appendRow(tab: string, values: string[]): Promise<number> {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.append({
    spreadsheetId: getSpreadsheetId(),
    range: `'${tab}'`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [values] },
  });
  const updatedRange = res.data.updates?.updatedRange ?? "";
  const match = updatedRange.match(/!A(\d+)/);
  return match ? Number.parseInt(match[1], 10) : 0;
}

export async function updateRow(
  tab: string,
  rowIndex: number,
  values: string[],
): Promise<void> {
  const sheets = await getSheets();
  const endCol = String.fromCharCode(64 + values.length);
  await sheets.spreadsheets.values.update({
    spreadsheetId: getSpreadsheetId(),
    range: `'${tab}'!A${rowIndex}:${endCol}${rowIndex}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [values] },
  });
}

export async function writeSheetRange(
  tab: string,
  range: string,
  values: string[][],
): Promise<void> {
  const sheets = await getSheets();
  await sheets.spreadsheets.values.update({
    spreadsheetId: getSpreadsheetId(),
    range: `'${tab}'!${range}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });
}

export async function deleteRow(tab: string, rowIndex: number): Promise<void> {
  const sheets = await getSheets();
  const spreadsheetId = getSpreadsheetId();
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = meta.data.sheets?.find((s) => s.properties?.title === tab);
  const sheetId = sheet?.properties?.sheetId;
  if (sheetId === undefined) throw new Error(`Sheet tab not found: ${tab}`);

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: rowIndex - 1,
              endIndex: rowIndex,
            },
          },
        },
      ],
    },
  });
}

export async function addSheetTab(name: string): Promise<void> {
  const sheets = await getSheets();
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: getSpreadsheetId(),
    requestBody: {
      requests: [{ addSheet: { properties: { title: name } } }],
    },
  });
}

export async function renameSheetTab(oldName: string, newName: string): Promise<void> {
  const sheets = await getSheets();
  const spreadsheetId = getSpreadsheetId();
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = meta.data.sheets?.find((s) => s.properties?.title === oldName);
  const sheetId = sheet?.properties?.sheetId;
  if (sheetId === undefined) throw new Error(`Sheet tab not found: ${oldName}`);

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          updateSheetProperties: {
            properties: { sheetId, title: newName },
            fields: "title",
          },
        },
      ],
    },
  });
}

export async function deleteSheetTab(name: string): Promise<void> {
  const sheets = await getSheets();
  const spreadsheetId = getSpreadsheetId();
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = meta.data.sheets?.find((s) => s.properties?.title === name);
  const sheetId = sheet?.properties?.sheetId;
  if (sheetId === undefined) throw new Error(`Sheet tab not found: ${name}`);

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{ deleteSheet: { sheetId } }],
    },
  });
}

export async function uploadFile(
  name: string,
  mimeType: string,
  buffer: Buffer,
): Promise<{ name: string; link: string }> {
  const drive = await getDrive();
  const driveOpts = DRIVE_SHARED_OPTS;

  try {
    const res = await drive.files.create({
      ...driveOpts,
      requestBody: {
        name,
        parents: [getDriveFolderId()],
      },
      media: { mimeType, body: Readable.from(buffer) },
      fields: "id, name, webViewLink",
    });

    const fileId = res.data.id;
    if (!fileId) throw new Error("Failed to upload file");

    await drive.permissions.create({
      ...driveOpts,
      fileId,
      requestBody: { role: "reader", type: "anyone" },
    });

    const file = await drive.files.get({
      ...driveOpts,
      fileId,
      fields: "webViewLink, name",
    });

    return {
      name: file.data.name ?? name,
      link: file.data.webViewLink ?? "",
    };
  } catch (error) {
    throw formatDriveUploadError(error);
  }
}

export function getSpreadsheetUrl(): string {
  return `https://docs.google.com/spreadsheets/d/${getSpreadsheetId()}`;
}
