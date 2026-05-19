import { mkdirSync, existsSync } from "node:fs";
import { writeFileSync, unlinkSync } from "node:fs";
import { join, resolve } from "node:path";
import { randomUUID } from "node:crypto";

export function getAttachmentsDir(): string {
  const base = resolve(process.cwd(), process.env.DATA_DIR ?? "./data");
  const dir = join(base, "attachments");
  mkdirSync(dir, { recursive: true });
  return dir;
}

export function saveAttachment(buffer: Buffer, originalName: string): {
  path: string;
  name: string;
} {
  const safeName = originalName.replace(/[^\w.\-()+ ]/g, "_");
  const filename = `${randomUUID()}-${safeName}`;
  const fullPath = join(getAttachmentsDir(), filename);
  writeFileSync(fullPath, buffer);
  return { path: filename, name: originalName };
}

export function deleteAttachment(filename: string | null | undefined): void {
  if (!filename) return;
  const fullPath = join(getAttachmentsDir(), filename);
  if (existsSync(fullPath)) unlinkSync(fullPath);
}

export function getAttachmentPath(filename: string): string {
  return join(getAttachmentsDir(), filename);
}
