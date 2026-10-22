// Access to the D1 (SQLite) binding provided by Webflow Cloud.
// Astro 5 exposes it on locals.runtime.env; newer adapters use the
// `cloudflare:workers` module. Both are tried so the app survives either.

type D1 = any;

export async function getDB(locals: any): Promise<D1> {
  let env: any = null;
  try {
    env = locals?.runtime?.env ?? null;
  } catch {
    env = null;
  }
  if (!env || !env.DB) {
    try {
      const mod = "cloudflare:workers";
      const cf: any = await import(/* @vite-ignore */ mod);
      env = cf?.env ?? env;
    } catch {
      /* not running on workers */
    }
  }
  if (!env || !env.DB) {
    throw new Error("Database binding DB is not available");
  }
  return env.DB as D1;
}

export async function one<T = any>(db: D1, sql: string, ...args: any[]): Promise<T | null> {
  return ((await db.prepare(sql).bind(...args).first()) as T) ?? null;
}

export async function all<T = any>(db: D1, sql: string, ...args: any[]): Promise<T[]> {
  const r = await db.prepare(sql).bind(...args).all();
  return (r?.results ?? []) as T[];
}

export async function run(db: D1, sql: string, ...args: any[]) {
  return db.prepare(sql).bind(...args).run();
}
