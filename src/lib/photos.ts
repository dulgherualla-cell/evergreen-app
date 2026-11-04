import { all, one } from "./db";

export const MAX_PHOTOS = 6; // per questionnaire
export const MAX_STORED = 30; // uploaded but not yet saved, per member and group
export const MAX_BYTES = 1_500_000; // the browser shrinks photos well below this

export const isPhotoId = (s: string) => /^[a-f0-9]{32}$/.test(s);

export function newPhotoId() {
  const b = crypto.getRandomValues(new Uint8Array(16));
  return [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

/** Detect the image type from its first bytes; anything else is refused. */
export function sniffImage(b: Uint8Array): string | null {
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b.length > 12 && b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return "image/webp";
  return null;
}

/** Keep only ids that really belong to this member in this group, in the given order. */
export async function ownedPhotoIds(db: any, code: string, userId: string, ids: string[]) {
  const wanted = [...new Set(ids.filter(isPhotoId))].slice(0, MAX_PHOTOS);
  if (!wanted.length) return [];
  const rows = await all<any>(db, "SELECT id FROM photos WHERE group_code = ? AND user_id = ?", code, userId);
  const have = new Set(rows.map((r) => r.id));
  return wanted.filter((id) => have.has(id));
}

/** Remove photos this member uploaded but did not keep in the saved questionnaire. */
export async function dropUnusedPhotos(db: any, code: string, userId: string, keep: string[]) {
  if (!keep.length) return db.prepare("DELETE FROM photos WHERE group_code = ? AND user_id = ?").bind(code, userId).run();
  const marks = keep.map(() => "?").join(",");
  return db
    .prepare(`DELETE FROM photos WHERE group_code = ? AND user_id = ? AND id NOT IN (${marks})`)
    .bind(code, userId, ...keep)
    .run();
}

/** A photo is visible to the member who added it and to their Santa after the draw. */
export async function canSeePhoto(db: any, viewerId: string, photo: { group_code: string; user_id: string }) {
  if (photo.user_id === viewerId) return true;
  const p = await one(db, "SELECT 1 AS ok FROM pairs WHERE group_code = ? AND giver_id = ? AND receiver_id = ?", photo.group_code, viewerId, photo.user_id);
  return !!p;
}
