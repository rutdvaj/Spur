import { GoogleGenerativeAI } from "@google/generative-ai";
import { STORE_FAQ } from "../domain/storeFaq";

/* ------------------------------------------------------------------ */
/* Gemini Client */
/* ------------------------------------------------------------------ */

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || ""
);

/* ------------------------------------------------------------------ */
/* System Prompt */
/* ------------------------------------------------------------------ */

const SYSTEM_PROMPT = `
You are a helpful customer support assistant for an e-commerce store.

Use the store policies below ONLY when the user's question is about
shipping, returns, cancellations, or support availability.

If the user greets you, thanks you, or asks something unrelated to store
policies, respond naturally and conversationally.

If you are unsure, ask a clarifying question instead of guessing.

Store policies:
- Shipping: ${STORE_FAQ.shipping}
- Returns: ${STORE_FAQ.returns}
- Support hours: ${STORE_FAQ.supportHours}
`;

/* ------------------------------------------------------------------ */
/* Types */
/* ------------------------------------------------------------------ */

type HistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

/* ------------------------------------------------------------------ */
/* Generate Reply */
/* ------------------------------------------------------------------ */

export async function generateReply(
  history: HistoryMessage[]
): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  // ✅ Model you actually have access to
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  /**
   * Gemini does NOT support a native "system" role.
   * We inject the system prompt as the first user message.
   */
  const contents = [
    {
      role: "user",
      parts: [{ text: SYSTEM_PROMPT }],
    },
    ...history.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    })),
  ];

  try {
    const result = await model.generateContent({
      contents,
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 300,
      },
    });

    const text = result.response.text();

    if (!text || !text.trim()) {
      return "I’m not sure how to respond to that yet. Could you rephrase?";
    }

    return text;
  } catch (error: any) {
    const errorMessage = error?.message || "";

    console.error("Gemini LLM error:", errorMessage);

    /* -------------------------------------------------------------- */
    /* Quota / Rate Limit Handling                                    */
    /* -------------------------------------------------------------- */

    if (
      errorMessage.includes("429") ||
      errorMessage.includes("Too Many Requests") ||
      errorMessage.includes("Quota exceeded")
    ) {
      return (
        "⚠️ You’ve reached the message limit for now.\n\n" +
        "Please wait a short while and try again, or come back later."
      );
    }

    /* -------------------------------------------------------------- */
    /* Generic Failure                                                */
    /* -------------------------------------------------------------- */

    return (
      "Sorry — I’m having trouble responding right now.\n" +
      "Please try again in a moment."
    );
  }
}
