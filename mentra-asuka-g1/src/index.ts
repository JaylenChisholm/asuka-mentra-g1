// @ts-nocheck
import { AppServer, AppSession } from "@mentra/sdk";

// --- Config helpers ---
const PKG = process.env.PACKAGE_NAME || "com.example.asuka.mentra";
const PORT = Number(process.env.PORT || "3000");
const API_KEY = process.env.MENTRAOS_API_KEY || "";
const OPENAI_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const BING_KEY = process.env.BING_API_KEY || "";
const XTTS_URL = process.env.XTTS_URL || "";
const XTTS_SPEAKER = process.env.XTTS_SPEAKER || "AsukaCalm";
const WAKE_WORD = (process.env.WAKE_WORD || "asuka").toLowerCase();
const DEFAULT_TRANSLATE_TO = (process.env.DEFAULT_TRANSLATE_TO || "off").toLowerCase();

if (!API_KEY) {
  console.error("MENTRAOS_API_KEY is required");
  process.exit(1);
}

// Simple in-memory conversation per user (replace with DB if you like)
type Msg = { role: "user" | "assistant"; text: string };
const memory = new Map<string, Msg[]>();

// --- Helpers ---
async function openAIRespond(prompt: string, history: Msg[]): Promise<string> {
  if (!OPENAI_KEY) return "I need an OpenAI API key to reply.";
  const messages = history.map((m) => ({
    role: m.role === "user" ? "user" : "assistant",
    content: [{ type: "input_text", text: m.text }],
  }));
  const body: any = {
    model: OPENAI_MODEL,
    input: [{ role: "user", content: [{ type: "input_text", text: prompt }] }],
  };
  if (messages.length) body.messages = messages;

  const resp = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    const t = await resp.text();
    return `OpenAI error (${resp.status}): ${t}`;
  }
  const json: any = await resp.json();
  // Find first output_text chunk
  const blocks = json?.output?.[json.output.length - 1]?.content || [];
  for (const c of blocks) {
    if (c.type === "output_text" && c.text) return c.text as string;
  }
  return "No text in response.";
}

async function bingSearch(query: string): Promise<{title:string; url:string; snippet:string}[]> {
  if (!BING_KEY) return [];
  const q = encodeURIComponent(query);
  const resp = await fetch(`https://api.bing.microsoft.com/v7.0/search?q=${q}&mkt=en-US`, {
    headers: { "Ocp-Apim-Subscription-Key": BING_KEY }
  });
  if (!resp.ok) return [];
  const j: any = await resp.json();
  const arr = j?.webPages?.value || [];
  return arr.slice(0, 5).map((it: any) => ({
    title: it.name, url: it.url, snippet: it.snippet || ""
  }));
}

// --- Main App ---
class AsukaMentraServer extends AppServer {
  protected async onSession(session: AppSession, sessionId: string, userId: string): Promise<void> {
    session.logger.info(`Session ${sessionId} for ${userId}`);

    // Check device capabilities
    const caps = (session as any).capabilities || {};
    session.logger.info("Capabilities", caps);

    // Greet
    session.layouts.showTextWall("ASUKA for Mentra — READY");

    // Subscribe to live transcription (speech-to-text)
    const unsubTx = session.events.onTranscription(async (data) => {
      // Show interim captions
      const caption = data.text.trim();
      if (!caption) return;

      // If translations are enabled, those will show separately (see below)
      if (data.isFinal) {
        // Wake word flow: "asuka, <request>"
        const lower = caption.toLowerCase();
        if (lower.startsWith(WAKE_WORD)) {
          const request = lower.replace(WAKE_WORD, "").trim().replace(/^,|^:/, "").trim();
          await this.handleRequest(session, userId, request || caption);
        } else {
          // Also handle a direct command like "translate to spanish: hello"
          if (lower.startsWith("search ")) {
            const q = caption.slice(7);
            const results = await bingSearch(q);
            const summary = results.map(r => `• ${r.title}\n${r.snippet}`).join("\n\n");
            session.layouts.showTextWall(summary || "No results.");
            await session.audio.speak(summary || "No results.");
          }
        }
      } else {
        // Optional: show interim small captions
        session.layouts.showTextWall(caption);
      }
    });

    // Subscribe to translation stream if configured
    if (DEFAULT_TRANSLATE_TO !== "off") {
      session.logger.info(`Default translating to: ${DEFAULT_TRANSLATE_TO}`);
    }
    const unsubTr = session.events.onTranslation((tr) => {
      if (!tr.text) return;
      // Show translated line under the source caption (simple approach: stack)
      session.layouts.showTextWall(`${tr.sourceText}\n→ ${tr.text}`);
    });

    this.addCleanupHandler(unsubTx);
    this.addCleanupHandler(unsubTr);
  }

  private async handleRequest(session: AppSession, userId: string, request: string) {
    const list = memory.get(userId) || [];
    list.push({ role: "user", text: request });
    const reply = await openAIRespond(request, list);
    list.push({ role: "assistant", text: reply });
    memory.set(userId, list);

    // Show on-glasses
    session.layouts.showTextWall(reply);

    // Speak back (prefer Mentra's TTS; XTTS sample route available if you host audio)
    try {
      await session.audio.speak(reply);
    } catch (e) {
      session.logger.error(e as any, "TTS speak failed");
    }
  }
}

new AsukaMentraServer({
  packageName: PKG,
  apiKey: API_KEY,
  port: PORT
}).start().catch((err) => {
  console.error("Server failed:", err);
});
