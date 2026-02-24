// netlify/functions/tarot-reading.mjs
// Google Gemini API - 자동 재시도 포함

export default async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const GEMINI_API_KEY = Netlify.env.get("GEMINI_API_KEY");

  if (!GEMINI_API_KEY) {
    return new Response(
      JSON.stringify({ error: "API key not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    const { system, messages } = body;
    const userMessage = messages[0]?.content || "";

    const requestBody = JSON.stringify({
      system_instruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
      generationConfig: { maxOutputTokens: 3500, temperature: 0.8 },
    });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    // 최대 3회 재시도
    let lastError = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        if (attempt > 0) {
          await new Promise((r) => setTimeout(r, 1000 * attempt));
        }

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: requestBody,
        });

        const data = await response.json();

        if (!response.ok) {
          lastError = data.error?.message || "Gemini API error";
          continue;
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        if (!text) {
          lastError = "Empty response";
          continue;
        }

        return new Response(
          JSON.stringify({ content: [{ type: "text", text }] }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      } catch (e) {
        lastError = e.message;
      }
    }

    return new Response(
      JSON.stringify({ error: lastError || "Failed after retries" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
