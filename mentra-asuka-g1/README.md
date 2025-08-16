# Asuka Mentra — MentraOS app for Even G1

A TypeScript starter built on **@mentra/sdk** that runs on MentraOS and targets **Even Realities G1** (and other compatible glasses). It does:

- Wake word (“asuka” by default) + live captioning
- Chat via **OpenAI Responses API**
- Text-to-speech reply via **MentraOS AudioManager** (or optional XTTS URL)
- On‑glasses translation stream
- Simple web search tool (Bing API; shows result snippets on glasses)
- Device-aware layouts (fallbacks if no speaker/display)

Docs & references:
- MentraOS Quickstart / Build from Scratch, Layouts, Events, Permissions, Audio.  
  See docs: getting started, voice activation, layouts, events, settings, audio. 
- Even G1 device page + demo app repo for low‑level reference.

## 0) Prereqs

- Node 18+ (or Bun), TypeScript 5+
- MentraOS app installed on your phone and paired to the Even G1
- An internet‑reachable URL (ngrok or deploy to Railway/Ubuntu)

## 1) Install

```bash
cd mentra-asuka-g1
bun install   # or: npm install / pnpm install
```

## 2) Configure

Copy `.env.example` → `.env` and fill values:
```
PORT=3000
PACKAGE_NAME=com.jaylen.asuka.mentra
MENTRAOS_API_KEY=your_key_from_console
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
BING_API_KEY= # optional
# Optional XTTS path (app will prefer Mentra's built-in TTS if this is empty)
XTTS_URL=
XTTS_SPEAKER=AsukaCalm
WAKE_WORD=asuka
DEFAULT_TRANSLATE_TO=off   # e.g. 'spanish' to force auto-translate captions
```

## 3) Register the app in Mentra Console

- Go to console.mentra.glass, create the app, set **Public URL** to your ngrok/host URL.
- Add **MICROPHONE** permission (for transcriptions/translation). Add **AUDIO** if present.  
- Grab the API key and paste into `.env`.

## 4) Run

```bash
bun run dev         # or: npm run dev
# expose the port, e.g.
ngrok http --url=<YOUR_STATIC_DOMAIN> 3000
```
Open the MentraOS app on your phone → restart the app session.

## 5) What it does

- Shows “READY” when session connects.
- Live captions appear as you speak.
- Say the wake word (default “asuka”), then your request. Finalized text triggers:
  - Send to OpenAI with brief session memory.
  - Show the reply on‑glasses (Text Wall).
  - Speak the reply via Mentra audio (or XTTS if configured).
- If `DEFAULT_TRANSLATE_TO` is a language (e.g., “spanish”), translation stream will be shown under the source caption.

## 6) Deploy

Use Railway/Ubuntu guides from MentraOS docs, then set the app’s Public URL accordingly.

---

## Notes

- Audio routes via phone by default; to route to glasses with speakers, pair them as an audio device in phone Bluetooth settings (separate from Mentra pairing).
- Spotify control can be added via Spotify Web API (user OAuth) or the phone’s App Remote—this starter stubs commands to keep it focused.
- Replace overlay styling with your own layouts later (e.g., small captions vs full wall).

