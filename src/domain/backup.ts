import { backupSchema, stateSchema, type State } from "../types/model";
export const MAX_BACKUP_BYTES = 10 * 1024 * 1024;
export function encodeBackup(data: State): string {
  return JSON.stringify(
    {
      version: 1,
      exportedAt: new Date().toISOString(),
      data: stateSchema.parse(data),
    },
    null,
    2,
  );
}
export function decodeBackup(text: string): State {
  if (text.length > MAX_BACKUP_BYTES)
    throw new Error("Záloha je príliš veľká (limit 10 MB).");
  return backupSchema.parse(JSON.parse(text)).data;
}
