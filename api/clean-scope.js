const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { scopeText } = req.body || {};

  if (!scopeText || !scopeText.trim()) {
    return res.status(400).json({ error: "Scope text required" });
  }

  try {
    const prompt = `
You are an expert UK construction assistant.

Clean and structure the following scope of works.

Return valid JSON only in this exact format:
{
  "cleanedScopeSummary": "string",
  "scopeItems": ["string"],
  "excludedItems": ["string"],
  "assumptions": ["string"]
}

Rules:
- Remove tender fluff such as labour, plant, materials, overheads, profit, attendance and similar wording where it does not describe actual work.
- Split bundled descriptions into clear work items.
- Use concise UK construction wording.
- Exclude items marked "by others", "excluded", or "client supply".
- Do not return anything except valid JSON.

Scope text:
${scopeText}
`;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const output = response.output_text;
    const parsed = JSON.parse(output);

    return res.status(200).json(parsed);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to clean scope",
      details: error.message,
    });
  }
}
