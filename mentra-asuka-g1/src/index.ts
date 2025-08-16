// @ts-nocheck
import express, { Request, Response } from "express";

const PKG = process.env.PACKAGE_NAME || "com.jaylenchisholm.asuka";
const PORT = Number(process.env.PORT || "3000");

const app = express();
app.use(express.json());

// Health check
app.get("/", (_req: Request, res: Response) => {
  res.type("text/plain").send("Asuka Mentra G1 server is live\napp: " + PKG + "\nservice: app-server\n");
});

// Webhook
app.post("/webhook", (req: Request, res: Response) => {
  const body = req.body || {};
  const type = body.type || body.event;
  const payload = body.payload || {};

  if (type === "ping") {
    console.log("[webhook] ping");
    return res.json({ status: "ok" });
  }

  if (type === "wake_word" || type === "wakeword") {
    const word = ((payload && payload.word) || "").toString();
    console.log('[webhook] wake_word -> "' + word + '"');
    return res.json({ status: "ok", message: "Wake word '" + word + "' received" });
  }

  if (type === "speech_input" || type === "asr_text") {
    const text = ((payload && (payload.text || payload.transcript)) || "").toString();
    console.log('[webhook] speech_input -> "' + text + '"');
    return res.json({ status: "ok", reply: 'You said: "' + text + '"' });
  }

  if (type === "end_session") {
    console.log("[webhook] end_session");
    return res.json({ status: "ok", message: "Session ended" });
  }

  console.warn("[webhook] Unknown type:", type);
  return res.status(400).json({ status: "error", message: "Unknown webhook request type" });
});

app.listen(PORT, () => {
  console.log("INFO: App server running at [http://localhost:"]http://localhost:" + PORT);
  console.log('app: "' + PKG + '"');
  console.log('service: "app-server"');
});
});
