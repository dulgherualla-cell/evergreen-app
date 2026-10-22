import { defineConfig } from "astro/config";

// Webflow Cloud sets the base path (mount), assets prefix, Cloudflare adapter
// and server output at build time. Only app-specific options live here.
export default defineConfig({
  output: "server",
  devToolbar: { enabled: false },
  // Requests reach the app through Webflow's proxy, so the Origin header may not
  // match the internal request URL. Forms are protected by SameSite=Lax cookies.
  security: { checkOrigin: false },
});
