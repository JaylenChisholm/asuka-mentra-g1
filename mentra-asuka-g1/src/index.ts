import express, { Request, Response } from "express";

const app = express();
app.use(express.json());

app.post("/webhook", (req: Request, res: Response) => {
  const { type, payload } = req.body;

  switch (type) {
    case "ping":
      return res.json({ status: "ok" });

    case "wake_word":
      console.log("Wake word detected:", payload.word);
      return res.json({
        status: "ok",
        message: Wake word '${payload.word}' received
      });

    default:
      return res.json({
        status: "error",
        message: "Unknown webhook request type"
      });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(🚀 Server running on port ${PORT});
});
[3:15 PM]
// @ts-nocheck

import express, { Request, Response } from "express";

// --- Env / Config ------------------------------------------------------------
const PKG = process.env.PACKAGE_NAME  "com.jaylenchisholm.asuka";
const PORT = Number(process.env.PORT  "3000");
const MENTRA_KEY = process.env.MENTRAOS_API_KEY  "";

if (!MENTRA_KEY) {
  console.error("MENTRAOS_API_KEY is required");
  process.exit(1);
}

// --- App Server --------------------------------------------------------------
const app = express();
app.use(express.json());

// Simple root for sanity checks
app.get("/", (_req, res) => {
  res.type("text/plain").send(
    [
      "/////////////////////////////////////////////",
      "=>  Asuka Mentra G1 server is live",
      =>  app: "${PKG}",
      =>  service: "app-server",
      "/////////////////////////////////////////////",
      "",
    ].join("\n")
  );
});

// --- Webhook ---------------------------------------------------------------
// MentraOS will POST here. We accept either { type: ... } or { event: ... }.
app.post("/webhook", (req: Request, res: Response) => {
  const body = req.body  {};
  const type = body.type  body.event; // support both field names
  const payload = body.payload  {};

  // (Optional) Very light auth: allow Bearer header but don't hard-fail if missing,
  // since Mentra Console handles auth. Uncomment to enforce strictly.
  // const auth = req.header("authorization")  "";
  // if (!auth.startsWith("Bearer ")) {
  //   return res.status(401).json({ status: "error", message: "Unauthorized" });
  // }

  switch (type) {
    case "ping": {
      console.log("[webhook] ping");
      return res.json({ status: "ok" });
    }

    case "wake_word":
    case "wakeword": {
      const word = (payload?.word  "").toString();
      console.log([webhook] wake_word -> "${word}");
      // You could send an immediate UI hint back if your SDK supports it.
      return res.json({
        status: "ok",
        message: Wake word '${word}' received,
      });
    }

    case "speech_input":
    case "asr_text": {
      const text = (payload?.text  payload?.transcript  "").toString();
      console.log([webhook] speech_input -> "${text}");

      // TODO: Call your LLM / tools here and craft a reply.
      // For now we echo back a simple response payload-like shape.
      return res.json({
        status: "ok",
        reply: You said: "${text}",
      });
    }

    case "end_session": {
      console.log("[webhook] end_session");
      return res.json({ status: "ok", message: "Session ended" });
    }

    default: {
      console.warn("[webhook] Unknown type:", type, "body:", body);
      return res
        .status(400)
        .json({ status: "error", message: "Unknown webhook request type" });
    }
  }
});

// --- Start -------------------------------------------------------------------
app.listen(PORT, () => {
  console.log([${new Date().toISOString()}] INFO:  App server running at http://localhost:${PORT});
  console.log(app: "${PKG}");
  console.log(packageName: "${PKG}");
  console.log(service: "app-server");
  console.log("\n=> Your service is live \n");
});

