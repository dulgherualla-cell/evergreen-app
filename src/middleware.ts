import { defineMiddleware } from "astro:middleware";
import { getDB } from "./lib/db";
import { userFromSession, SESSION_COOKIE } from "./lib/auth";

export const onRequest = defineMiddleware(async (context, next) => {
  const locals = context.locals as any;
  locals.user = null;
  try {
    const db = await getDB(locals);
    locals.db = db;
    locals.user = await userFromSession(db, context.cookies.get(SESSION_COOKIE)?.value);
  } catch (e) {
    locals.dbError = String((e as any)?.message || e);
  }
  return next();
});
