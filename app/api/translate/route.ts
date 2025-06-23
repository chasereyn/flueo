import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { phrase } = await req.json();
  if (!phrase || typeof phrase !== "string") {
    return NextResponse.json({ error: "Missing or invalid phrase" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
  }

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-2024-08-06",
        messages: [
          { role: "system", content: "You are an AI for Flueo, a Spanish learning app with a spaced repetition flashcard system. Users can request: 1) translations of paragraphs, 2) sentence pairs for specific words or phrases, or 3) sentences generated from vocabulary. All flashcards must be phrases or full sentences, never single words. For paragraph translations: Split the paragraph into sentences, translate each into Spanish, and return each pair.\n- For sentence pair requests (e.g., 'create sentence pairs for word X'): Generate at least 3 sentence pairs using the word/phrase in context.\n- For vocabulary-based sentences: Create sentences using the provided words/phrases, ensuring they are full sentences.\n- If the input is ambiguous, assume the user wants sentence pairs.\n- Always ensure translations are accurate and natural.\n- If the input is a single word, generate sentence pairs using it in context, not just the word alone" },
          { role: "user", content: phrase },
        ],
        max_tokens: 100,
        temperature: 0.3,
        response_format: {
            type: "json_schema",
            json_schema: {
                name: "translation_response",
                strict: true,
                schema: {
                    type: "object",
                    properties: {
                        translations: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    english: {
                                        type: "string",
                                    },
                                    spanish: {
                                        type: "string",
                                    },
                                },
                                required: ["english", "spanish"],
                                additionalProperties: false,
                            }
                        },
                        count: {
                            type: "number",
                        },
                    },
                    required: ["translations", "count"],
                    additionalProperties: false,
                },
            },
        },
      }),
    });

    if (!openaiRes.ok) {
      const error = await openaiRes.text();
      return NextResponse.json({ error: `OpenAI error: ${error}` }, { status: 500 });
    }

    const data = await openaiRes.json();
    const translation = data.choices?.[0]?.message?.content?.trim();
    if (!translation) {
      return NextResponse.json({ error: "No translation returned" }, { status: 500 });
    }
    return NextResponse.json({ translation });
  } catch {
    return NextResponse.json({ error: "Failed to fetch translation" }, { status: 500 });
  }
} 