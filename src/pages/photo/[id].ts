import type { APIRoute } from "astro";
import { one } from "../../lib/db";
import { canSeePhoto, isPhotoId } from "../../lib/photos";

const nope = (status: number) => new Response(null, { status, headers: { "cache-control": "no-store" } });

// Serve a wish photo to its owner, or to their Santa once names are drawn.
export const GET: APIRoute = async ({ params, locals }) => {
  const l = locals as any;
  const id = String(params.id || "");
  if (!l.user) return nope(401);
  if (!l.db || !isPhotoId(id)) return nope(404);
  const p = await one<any>(l.db, "SELECT group_code, user_id, mime, data FROM photos WHERE id = ?", id);
  if (!p || !(await canSeePhoto(l.db, l.user.id, p))) return nope(404);
  const body = p.data instanceof Uint8Array ? p.data : new Uint8Array(p.data);
  return new Response(body, {
    headers: {
      "content-type": p.mime,
      "cache-control": "private, max-age=31536000, immutable",
      "x-content-type-options": "nosniff",
      "content-disposition": "inline",
    },
  });
};
