const POLISH_INSTRUCTIONS =
    "You are a chat draft editor. Correct grammar, spelling, and punctuation while preserving the writer's meaning, tone, language, formatting, line breaks, emojis, and intentional informal phrasing. Return only the corrected message. Do not add explanations, quotation marks, or markdown.";

const getGeminiApiKey = () =>
    process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.OPENAI_API_KEY;

const getGeminiModel = () => process.env.GEMINI_MODEL || "gemini-flash-latest";

const extractGeminiText = (response) =>
    (response.candidates?.[0]?.content?.parts || [])
        .filter((part) => typeof part.text === "string" && !part.thought)
        .map((part) => part.text)
        .join("")
        .trim();

const geminiErrorMessage = (data, status) => {
    const message = data?.error?.message || "AI polish could not be completed.";
    if (status === 429 || data?.error?.status === "RESOURCE_EXHAUSTED") {
        return "Google AI quota exceeded. Check billing or try again later.";
    }
    if (status === 401 || status === 403) {
        return "Google AI API key is invalid or not authorized for Gemini.";
    }
    return message;
};

export const polishMessage = async (req, res) => {
    const text = typeof req.body?.text === "string" ? req.body.text : "";
    const apiKey = getGeminiApiKey();
    const model = getGeminiModel();

    if (!text.trim()) return res.status(400).json({ success: false, message: "Write a message before using AI polish." });
    if (text.length > 2000) return res.status(400).json({ success: false, message: "AI polish supports drafts up to 2,000 characters." });
    if (!apiKey) return res.status(503).json({ success: false, message: "AI polish is not configured yet. Set GEMINI_API_KEY in server/.env." });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                systemInstruction: { parts: [{ text: POLISH_INSTRUCTIONS }] },
                contents: [{ role: "user", parts: [{ text }] }],
                generationConfig: {
                    maxOutputTokens: 500,
                    temperature: 0.2,
                },
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            return res.status(response.status).json({
                success: false,
                message: geminiErrorMessage(data, response.status),
            });
        }

        const polishedText = extractGeminiText(data);
        if (!polishedText) {
            return res.status(502).json({ success: false, message: "AI polish returned an empty response. Please try again." });
        }

        return res.json({ success: true, text: polishedText });
    } catch (error) {
        console.error("AI polish request failed:", error.message);
        return res.status(502).json({ success: false, message: "AI polish is temporarily unavailable. Please try again." });
    }
};
