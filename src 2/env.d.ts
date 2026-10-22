/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    user: { id: string; email: string; name: string; avatar_icon: string | null; avatar_color: string | null } | null;
    db: any;
    dbError?: string;
    lang: "uk" | "en";
    runtime?: any;
  }
}
