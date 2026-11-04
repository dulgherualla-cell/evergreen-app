import type { APIRoute } from "astro";
import { one, run } from "../../lib/db";
import { getGroup } from "../../lib/groups";
import { u } from "../../lib/util";
import { MAX_BYTES, MAX_STORED, newPhotoId, sniffImage } from "../../lib/photos";

const json = (status: number, body: any) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

// Upload one photo for the questionnaire. Body: the image bytes. Query: ?g=GROUPCODE
export const POST: APIRoute = async ({ request, locals, url }) => {
  const l = locals as any;
  if (!l.user) return json(401, { error: "auth" });
  if (!l.db) return json(503, { error: "db" });
  const db = l.db;
  const code = String(url.searchParams.get("g") || "").toUpperCase();
  const g = await getGroup(db, code);
  if (!g) return json(404, { error: "group" });
  const member = await one(db, "SELECT 1 AS ok FROM members WHERE group_code = ? AND user_id = ?", code, l.user.id);
  if (!member) return json(403, { error: "member" });

  const len = Number(request.headers.get("content-length") || 0);
  if (len > MAX_BYTES) return json(413, { error: "size" });
  const buf = await request.arrayBuffer();
  const bytes = new Uint8Array(buf);
  if (!bytes.length || bytes.length > MAX_BYTES) return json(413, { error: "size" });
  const mime = sniffImage(bytes);
  if (!mime) return json(415, { error: "type" });

  const cnt = await one<any>(db, "SELECT COUNT(*) AS n FROM photos WHERE group_code = ? AND user_id = ?", code, l.user.id);
  if ((cnt?.n ?? 0) >= MAX_STORED) return json(429, { error: "many" });

  const id = newPhotoId();
  await run(db, "INSERT INTO photos (id, group_code, user_id, mime, data, created_at) VALUES (?, ?, ?, ?, ?, ?)", id, code, l.user.id, mime, buf, Date.now());
  return json(200, { id, url: u(`/photo/${id}`) });
};
