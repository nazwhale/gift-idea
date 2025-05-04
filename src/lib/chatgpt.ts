import { buildGiftPrompt } from "./prompt";

const model = "gpt-4.1-nano";

// src/lib/chatgpt.ts
export async function getSuggestionsForGiftee(
  gifteeName: string,
  bio?: string
): Promise<string[]> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OpenAI API key in environment variables.");
  }

  const { system, user } = buildGiftPrompt(gifteeName, bio);

  // The API call to the chatgpt API
  const url = "https://api.openai.com/v1/chat/completions";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model,
      functions: [
        {
          name: "suggest_gifts",
          description: "Suggest three distinct one-line gift ideas",
          parameters: {
            type: "object",
            properties: {
              suggestions: {
                type: "array",
                items: { type: "string" },
              },
            },
            required: ["suggestions"],
          },
        },
      ],
      function_call: { name: "suggest_gifts" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      max_tokens: 200,
      temperature: 0.9,
    })
  });


  const fcArgs = JSON.parse(
    response.ok ? (await response.json()).choices[0].message.function_call.arguments : "{}"
  );
  if (!Array.isArray(fcArgs.suggestions))
    throw new Error("Bad model response");

  return fcArgs.suggestions as string[];
}
