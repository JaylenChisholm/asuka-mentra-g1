# Deploy Kit — Asuka Mentra (Even G1)

This kit gives you three quick deployment paths:

## A) Render.com (quickest)
1. Create a new **Web Service** on Render connected to this folder.
2. Render will pick up `render.yaml`.
3. Set environment variables in Render dashboard:
   - `MENTRAOS_API_KEY`, `PACKAGE_NAME`, `OPENAI_API_KEY`
   - Optional: `BING_API_KEY`, `XTTS_URL`, `XTTS_SPEAKER`, `WAKE_WORD`, `DEFAULT_TRANSLATE_TO`
4. Deploy. Copy public URL into Mentra Console → Public URL.

## B) Docker (self-host)
```bash
docker compose up -d --build
ngrok http 3000
```
Paste ngrok URL into Mentra Console.

## C) Railway
```bash
railway up
```
Set env vars, copy URL into Mentra Console.

---

## Local quick-run
```bash
cd mentra-asuka-g1
npm ci
npm run build
node dist/index.js
ngrok http 3000
```

---

### Mentra Console checklist
- Package name matches `.env` / your app entry.
- Permissions: **MICROPHONE** (and **AUDIO**, if applicable).
- Public URL set to your deployed URL.
