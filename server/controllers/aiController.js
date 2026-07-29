const POLISH_INSTRUCTIONS =
  "You are a chat draft editor. Correct grammar, spelling, and punctuation while preserving the writer's meaning, tone, language, formatting, line breaks, emojis, and intentional informal phrasing. Return only the corrected message. Do not add explanations, quotation marks, or markdown.";

const getGeminiApiKey = () =>
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  process.env.OPENAI_API_KEY;

const getGeminiModel = () => process.env.GEMINI_MODEL || "gemini-flash-latest";

const extractGeminiText = (response) =>
  (response.candidates?.[0]?.content?.parts || [])
    .filter((part) => typeof part.text === "string" && !part.thought)
    .map((part) => part.text)
    .join("")
    .trim();

const isSameDay = (a, b) =>
  a?.getFullYear() === b?.getFullYear() &&
  a?.getMonth() === b?.getMonth() &&
  a?.getDate() === b?.getDate();

const normalizeInput = (text) =>
  text.replace(/[\r\u2028\u2029]+/g, "\n").trim();

const estimateTokenCount = (text) =>
  text.trim().split(/\s+/).filter(Boolean).length;

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

const AI_MAX_INPUT_CHARS = 2000;
const AI_MIN_INPUT_CHARS = 5;
const AI_DAILY_REQUEST_LIMIT = 20;
const AI_DAILY_CHAR_LIMIT = 10000;
const AI_MAX_OUTPUT_TOKENS = 500;

const enforceAiQuota = (user, inputChars) => {
  const now = new Date();
  if (!isSameDay(user.aiUsage?.date, now)) {
    user.aiUsage = { date: now, requests: 0, characters: 0, tokens: 0 };
  }

  if (user.aiUsage.requests >= AI_DAILY_REQUEST_LIMIT) {
    return "You have reached your daily AI polish request limit. Try again tomorrow.";
  }

  if (user.aiUsage.characters + inputChars > AI_DAILY_CHAR_LIMIT) {
    return "You have reached your daily AI polish character quota. Try again tomorrow.";
  }

  return null;
};

export const polishMessage = async (req, res) => {
  const rawText = typeof req.body?.text === "string" ? req.body.text : "";
  const text = normalizeInput(rawText);
  const apiKey = getGeminiApiKey();
  const model = getGeminiModel();

  if (!text) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Write a message before using AI polish.",
      });
  }

  if (text.length < AI_MIN_INPUT_CHARS) {
    return res
      .status(400)
      .json({
        success: false,
        message: "AI polish requires a longer draft to analyze.",
      });
  }

  if (text.length > AI_MAX_INPUT_CHARS) {
    return res
      .status(400)
      .json({
        success: false,
        message: `AI polish supports drafts up to ${AI_MAX_INPUT_CHARS} characters.`,
      });
  }

  if (!apiKey) {
    return res
      .status(503)
      .json({
        success: false,
        message:
          "AI polish is not configured yet. Set GEMINI_API_KEY in server/.env.",
      });
  }

  const quotaError = enforceAiQuota(req.user, text.length);
  if (quotaError) {
    return res.status(429).json({ success: false, message: quotaError });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: POLISH_INSTRUCTIONS }] },
        contents: [{ role: "user", parts: [{ text }] }],
        generationConfig: {
          maxOutputTokens: AI_MAX_OUTPUT_TOKENS,
          temperature: 0.2,
        },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.warn("AI polish external failure:", data);
      return res.status(response.status).json({
        success: false,
        message: geminiErrorMessage(data, response.status),
      });
    }

    const polishedText = extractGeminiText(data);
    if (!polishedText) {
      console.warn("AI polish returned no text:", data);
      return res
        .status(502)
        .json({
          success: false,
          message: "AI polish returned an empty response. Please try again.",
        });
    }

    req.user.aiUsage.requests += 1;
    req.user.aiUsage.characters += text.length;
    req.user.aiUsage.tokens += estimateTokenCount(text) + AI_MAX_OUTPUT_TOKENS;
    req.user.aiUsage.date = new Date();
    await req.user.save();

    console.info(`AI polish used by ${req.user.email} (${req.user._id})`, {
      requests: req.user.aiUsage.requests,
      characters: req.user.aiUsage.characters,
    });

    return res.json({ success: true, text: polishedText });
  } catch (error) {
    console.error("AI polish request failed:", error);
    return res
      .status(502)
      .json({
        success: false,
        message: "AI polish is temporarily unavailable. Please try again.",
      });
  }
};
