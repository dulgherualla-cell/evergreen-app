# Evergreen Secret Santa app

The logged-in part of the Evergreen Secret Santa site: sign-up and sign-in, the cabinet, groups, the questionnaire and the draw. It runs on **Webflow Cloud** at `/app` next to the Webflow landing page.

## Stack

- Astro (server output). Webflow Cloud adds the Cloudflare adapter, the base path and the asset prefix at build time.
- SQLite (Cloudflare D1) through the `DB` binding in `wrangler.json`. Migrations in `migrations/` are applied automatically on deploy.

## Pages

| Path | What it does |
| --- | --- |
| `/app/signup`, `/app/signin` | Account with email and password (PBKDF2-SHA256, 100k iterations). Session in an HttpOnly cookie. |
| `/app/cabinet` | "Я організатор" and "Я учасник" tabs |
| `/app/create` | New group with a 6-character code |
| `/app/join?code=XXXXXX` | Join a group by code |
| `/app/group/XXXXXX` | Organizer: members, invitations, draw, reset, delete. Participant: avatar, questionnaire, their recipient's card after the draw. |

## Privacy rules enforced on the server

- Only the giver can see who they drew. The organizer can't see the pairs.
- A participant's answers and delivery address are shown only to themselves and, after the draw, to their Santa.
- The organizer sees only whether each questionnaire is filled in, plus the "Питання до організаторів" field.

## Local development

```bash
npm install
npm run db:apply:local
npm run preview
```

## Not included yet

- Email verification and password reset need an email-sending service such as Resend or Postmark.
- Google sign-in needs an OAuth client.
