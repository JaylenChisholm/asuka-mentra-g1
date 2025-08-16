import express, { Request, Response } from "express";

// --- Env / Config ------------------------------------------------------------
const PKG = process.env.PACKAGE_NAME || "com.jaylenchisholm.asuka";
const PORT = Number(process.env.PORT || "3000");

// --- App Server --------------------------------------------------------------
const app = express();
app.use(express.json());

// Root test
app.get("/", (_req, res) => {
  res.type("text/plain").send(
    [
      "/////////////////////////////////////////////",
      "=>  Asuka Mentra G1 server is live",
      `=>  app: "${PKG}"`,
      `=>  service: "app-server"`,
      "/////////////////////////////////////////////",
      "",
    ].join("\n")
  );
});

// --- Webhook ---------------------------------------------------------------
app.post("/webhook", (req: Request, res: Response) => {
  const body = req.body || {};
  const type = body.type || body.event;
  const payload = body.payload || {};

  switch (type) {
    case "ping": {
      console.log("[webhook] ping");
      return res.json({ status: "ok" });
    }

    case "wake_word": {
      const word = (payload.word || "").toString();
      console.log(`[webhook] wake_word -> "${word}"`);
      return res.json({
        status: "ok",
        message: `Wake word '${word}' received`,
      });
    }

    case "speech_input": {
      const text = (payload.text || payload.transcript || "").toString();
      console.log(`[webhook] speech_input -> "${text}"`);
      return res.json({
        status: "ok",
        reply: `You said: "${text}"`,
      });
    }

    case "end_session": {
      console.log("[webhook] end_session");
      return res.json({ status: "ok", message: "Session ended" });
    }

    default: {
      console.warn("[webhook] Unknown type:", type);
      return res
        .status(400)
        .json({ status: "error", message: "Unknown webhook request type" });
    }
  }
});

// --- Start -------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(
    `[${new Date().toISOString()}] INFO: App server running at [http://localhost:${PORT}`]http://localhost:${PORT}`
  );
  console.log(`app: "${PKG}"`);
  console.log(`service: "app-server"`);
});
