import { defineMiddleware } from "astro:middleware";
import { getDB } from "./lib/db";
import { userFromSession, SESSION_COOKIE } from "./lib/auth";
import { pickLang, LANG_COOKIE } from "./lib/i18n";

export const onRequest = defineMiddleware(async (context, next) => {
  const locals = context.locals as any;
  locals.user = null;

  // Language: ?lang=en|uk wins and is remembered; otherwise the saved choice; Ukrainian by default.
  const fromQuery = pickLang(context.url.searchParams.get("lang"));
  const fromCookie = pickLang(context.cookies.get(LANG_COOKIE)?.value);
  locals.lang = fromQuery ?? fromCookie ?? "uk";
  if (fromQuery && fromQuery !== fromCookie) {
    context.cookies.set(LANG_COOKIE, fromQuery, {
      path: "/",
      sameSite: "lax",
      secure: context.url.protocol === "https:",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  try {
    const db = await getDB(locals);
    locals.db = db;
    locals.user = await userFromSession(db, context.cookies.get(SESSION_COOKIE)?.value);
  } catch (e) {
    locals.dbError = String((e as any)?.message || e);
  }
  return next();
});
