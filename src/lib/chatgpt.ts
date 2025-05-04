import { buildGiftPrompt } from "./prompt";

const model = "gpt-4.1-nano";

export type Suggestion = {
  description: string;
  shortDescription: string;
  cost: string;
};

// src/lib/chatgpt.ts
export async function getSuggestionsForGiftee(
  gifteeName: string,
  bio?: string
): Promise<Suggestion[]> {
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
          description: "Suggest three distinct gift ideas with description and cost level",
          parameters: {
            type: "object",
            properties: {
              suggestions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    description: {
                      type: "string",
                      description: "A one-line description of the gift"
                    },
                    shortDescription: {
                      type: "string",
                      description: "A very short title/category for the gift (3 words or less)"
                    },
                    cost: {
                      type: "string",
                      enum: ["£", "££", "£££"],
                      description: "The cost level of the gift: £ for low cost, ££ for medium, £££ for high"
                    }
                  },
                  required: ["description", "shortDescription", "cost"]
                }
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

  return fcArgs.suggestions as Suggestion[];
}
