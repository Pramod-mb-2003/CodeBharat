import { NextResponse } from "next/server";

const MODEL = "gemini-2.5-flash";
const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;

export async function POST(req: Request) {
  try {
    const { standard } = await req.json();

    if (!standard) {
      return NextResponse.json(
        { error: "Standard is required" },
        { status: 400 }
      );
    }

    const prompt = `
Generate exactly 8 psychometric MCQ questions for Standard ${standard}.
Each question must have exactly 6 options.
Detect interest in Sports, Science, Mathematics, English, Social Science, Art & Craft.

Return ONLY valid JSON:
{
  "questions": [
    { "q": "text", "options": ["A","B","C","D","E","F"] }
  ]
}
NO explanations. NO markdown. NO reasoning. NO notes. Just JSON.
`;

    const response = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 4096,   // BIGGER LIMIT
          responseMimeType: "application/json" // FORCE JSON
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ]
      }),
    });

    const data = await response.json();
    console.log("RAW MODEL OUTPUT:", JSON.stringify(data, null, 2));

    // Gemini now sends JSON directly in text:
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      if (data?.candidates?.[0]?.finishReason === 'SAFETY') {
        return NextResponse.json(
          { error: "Content blocked due to safety settings.", raw: data },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Model did not return usable JSON", raw: data },
        { status: 502 }
      );
    }

    try {
        const parsed = JSON.parse(text);
        if (!parsed.questions) {
            return NextResponse.json(
                { error: "JSON missing questions", raw: parsed },
                { status: 500 }
            );
        }
        return NextResponse.json(parsed);
    } catch(e) {
        console.error("Failed to parse JSON:", text);
        return NextResponse.json(
            { error: "Failed to parse JSON response from model", raw: text },
            { status: 500 }
        );
    }

  } catch (err: any) {
    console.error("ERROR:", err);
    return NextResponse.json(
      { error: "Server failed", details: err.message, body: await req.text().catch(() => '') },
      { status: 500 }
    );
  }
}
