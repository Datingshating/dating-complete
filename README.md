# VibeText — Text-first Dating App (mono-repo)

Tech: Node/Express + PostgreSQL (server) and React + Vite (client).

## Quick start

1) Create a PostgreSQL database and set `server/.env`:

```
DATABASE_URL=postgres://user:pass@localhost:5432/vibetext
PORT=8080
CORS_ORIGIN=http://localhost:5173
WHATSAPP_NUMBER=+919631126841
```

2) Apply schema:

- Open `server/src/schema.sql` in your SQL client and run it against your database.

3) Run server:

- If npm is not working on your system, install Node LTS + npm first.
- Then from `server/`, install and start: `npm i && npm run dev`

4) Run client:

- From `client/`, `npm i` and `npm run dev`. Set `client/.env` with:

```
VITE_API_URL=http://localhost:8080
```

## Features implemented

- Registration form (text-only profile, phone, Instagram, WhatsApp, etc.)
- Manual admin review list and one-click approve that generates login credentials
- Credential login, feed of other approved profiles, send short requests
- Accept request to create matches and chat between matched users
- WhatsApp link endpoint for payments (opens WhatsApp to chat)

## Notes

- No photos/swipes by design. Emphasis on bio, hobbies, experiences.
- Payment is out-of-band via WhatsApp; store purchases if you want to track packs.
- Add rate limiting, auth tokens, and validation before production.

