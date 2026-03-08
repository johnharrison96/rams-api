const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { scopeText } = req.body || {};

  if (!scopeText || !scopeText.trim()) {
    return res.status(400).json({ error: "Scope text required" });
  }

  try {

    const prompt = `
Clean and structure the following construction scope of works.

Return valid JSON only in this format:

{
 "cleanedScopeSummary": "string",
 "scopeItems": ["string"],
 "excludedItems": ["string"],
 "assumptions": ["string"]
}

Scope text:
${scopeText}
`;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt
    });

    const output = response.output_text;

    const parsed = JSON.parse(output);

    return res.status(200).json(parsed);

  } catch (error) {

    return res.status(500).json({
      error: "Scope cleaning failed",
      details: error.message
    });

  }
};
