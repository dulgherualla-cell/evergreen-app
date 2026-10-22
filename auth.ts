import { one, run } from "./db";

const ITER = 100000; // PBKDF2 iterations (Workers cap is 100k)
export const SESSION_COOKIE = "ss_session";
const SESSION_DAYS = 30;

function b64(buf: ArrayBuffer | Uint8Array) {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}
function unb64(s: string) {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function hex(bytes: Uint8Array) {
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function derive(password: string, salt: Uint8Array) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: ITER }, key, 256);
  return new Uint8Array(bits);
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(password, salt);
  return { hash: b64(hash), salt: b64(salt) };
}

export async function verifyPassword(password: string, hash: string, salt: string) {
  const got = await derive(password, unb64(salt));
  const want = unb64(hash);
  if (got.length !== want.length) return false;
  let diff = 0;
  for (let i = 0; i < got.length; i++) diff |= got[i] ^ want[i];
  return diff === 0;
}

export function newId() {
  return hex(crypto.getRandomValues(new Uint8Array(12)));
}

export async function createSession(db: any, userId: string, cookies: any, secure: boolean) {
  const token = hex(crypto.getRandomValues(new Uint8Array(32)));
  const expires = Date.now() + SESSION_DAYS * 86400000;
  await run(db, "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)", token, userId, expires);
  cookies.set(SESSION_COOKIE, token, {
    path: "/",
    httpOnly: true,
    secure,
    sameSite: "lax",
    maxAge: SESSION_DAYS * 86400,
  });
}

export async function userFromSession(db: any, token: string | undefined) {
  if (!token || !/^[0-9a-f]{64}$/.test(token)) return null;
  const row = await one<any>(
    db,
    `SELECT u.id, u.email, u.name, u.avatar_icon, u.avatar_color, s.expires_at
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token = ?`,
    token
  );
  if (!row) return null;
  if (row.expires_at < Date.now()) {
    await run(db, "DELETE FROM sessions WHERE token = ?", token);
    return null;
  }
  return { id: row.id, email: row.email, name: row.name, avatar_icon: row.avatar_icon, avatar_color: row.avatar_color };
}

export async function destroySession(db: any, token: string | undefined, cookies: any) {
  if (token) await run(db, "DELETE FROM sessions WHERE token = ?", token);
  cookies.delete(SESSION_COOKIE, { path: "/" });
}
