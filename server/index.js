import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/api/generate", async (req, res) => {
  try {
    const { productName, brand, category, audience, features, tone, keywords } = req.body;

    if (!productName || !features) {
      return res.status(400).json({ error: "productName and features are required" });
    }

    // Use OpenAI Responses API (recommended for new projects).
    // Docs show `client.responses.create({ model, input, instructions })`
    // :contentReference[oaicite:0]{index=0}
    const instructions = `
You are an ecommerce copywriter.
Return JSON only with keys:
seo_title, product_description, bullet_benefits (array of 5), meta_description, tags (array of 8), alt_text
Rules:
- Keep tone: ${tone || "professional"}
- Include keywords naturally: ${keywords || "none"}
- No emojis.
- Product description 120-180 words.
- Meta description 140-155 characters.
`;

    const input = `
Product:
- Name: ${productName}
- Brand: ${brand || "N/A"}
- Category: ${category || "N/A"}
- Audience: ${audience || "N/A"}
- Features/Notes: ${features}
`;

    const response = await client.responses.create({
      model: "gpt-5.2",
      reasoning: { effort: "low" },
      instructions,
      input
    });

    // The SDK provides `output_text` (docs)
    // :contentReference[oaicite:1]{index=1}
    const text = response.output_text?.trim() || "";

    // Try parse JSON safely
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      return res.status(200).json({
        warning: "Model did not return valid JSON. Returning raw text.",
        raw: text
      });
    }

    return res.json(json);
  } catch (err) {
    return res.status(500).json({ error: err?.message || "Server error" });
  }
});

app.get("/health", (_, res) => res.json({ ok: true }));

const port = process.env.PORT || 5050;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
