import express from "express";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 10000;

if (!process.env.OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY is not configured.");
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.json({ limit: "1mb" }));
app.use(express.static(__dirname));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "zed-ai" });
});

app.post("/api/chat", async (req, res) => {
  try {
    const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";

    if (!message) {
      return res.status(400).json({ error: "Please enter a message." });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "Zed AI is not configured yet. Add OPENAI_API_KEY in Render." });
    }

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.5",
      instructions:
        "You are Zed AI, a helpful, friendly AI assistant. Give clear, practical answers. When relevant, understand that the user may be in Zambia and use Zambian context, currency (ZMW/Kwacha), and everyday examples. Do not claim to be a human.",
      input: message
    });

    res.json({ reply: response.output_text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Zed AI could not complete the request. Please try again." });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Zed AI running on port ${port}`);
});
