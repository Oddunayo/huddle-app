# Huddle Backend (NestJS)

Group 7 — Agile Practicum. Owner: Gideon.

Thin backend service covering what's actually left after the Firebase migration:
Firebase Auth + Firestore handle login/signup and messaging, so this service
is a deployable health check + a place for privileged/admin-only logic.

## What's here

- `GET /health` — returns `200 OK`. Keeps Render's free tier awake and gives
  demo/monitoring evidence of a live backend.
- `GET /admin/status` — confirms the Firebase Admin SDK initialized correctly.
- `src/firebase/` — Firebase Admin SDK wiring, credentials loaded from env vars
  (never from a committed file).

## Setup

\`\`\`bash
npm install
cp .env.example .env
# fill in the three FIREBASE_* values from the service account Ejim provided
npm run start:dev
\`\`\`

Visit `http://localhost:3000/health` — should return `{"status":"ok",...}`.

## ⚠️ About the Firebase service account key

Treat the private key as a live secret:
- It goes in `.env` locally (already gitignored) and as Environment Variables
  on Render — never as a committed JSON file.
- If a raw key was ever pasted into Slack/chat, rotate it in
  Firebase Console → Project Settings → Service Accounts → Generate new
  private key, then update `.env` / Render with the new one.

## Deploying to Render

1. Push to the shared repo (this repo — frontend + backend together).
2. In Render: New → Web Service → connect the repo.
3. Build command: `npm install && npm run build`
4. Start command: `npm run start:prod`
5. Add Environment Variables: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`,
   `FIREBASE_PRIVATE_KEY` (paste with the `\n` sequences intact).
6. Once deployed, confirm `https://<your-render-url>/health` returns 200 —
   that's the demoable evidence for Friday.