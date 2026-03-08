
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = async (req, res) => {
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

    let parsed;
    try {
      parsed = JSON.parse(output);
    } catch (err) {
      return res.status(500).json({
        error: "AI returned invalid JSON",
        rawOutput: output,
      });
    }

    return res.status(200).json(parsed);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to clean scope",
      details: error.message,
    });
  }
};
