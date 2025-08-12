import { buildGiftPrompt } from "./prompt";

const model = "gpt-5-nano";

export type Suggestion = {
  description: string;
  shortDescription: string;
  cost: string;
};

export type FollowUpQuestion = {
  text: string;
};

export type GiftSuggestionResponse = {
  suggestions: Suggestion[];
  followUpQuestions: FollowUpQuestion[];
};

// src/lib/chatgpt.ts
export async function getSuggestionsForGiftee(
  gifteeName: string,
  bio?: string,
  age?: number,
  followUpQuestion?: string
): Promise<GiftSuggestionResponse> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OpenAI API key in environment variables.");
  }

  const { system, user } = buildGiftPrompt(gifteeName, bio, age, followUpQuestion);
  console.log("system", system);
  console.log("user", user);

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
          description: "Suggest three specific gift ideas with exact product names, brands, or titles that the recipient can purchase",
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
                      description: "A specific product, including brand name, title, or exact experience (e.g. 'Kindle Paperwhite', 'Taylor Swift concert tickets', 'Le Labo Santal 33 perfume')"
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
              followUpQuestions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    text: {
                      type: "string",
                      description: "An ultra-short follow-up prompt (maximum 3 words) that can refine gift suggestions. Include both general refinements (e.g. 'Cheaper gifts', 'More unique') and bio-specific prompts based on interests mentioned in the bio"
                    }
                  },
                  required: ["text"]
                },
                description: "Three ultra-short follow-up prompts (maximum 3 words each) - a mix of general refinements and prompts specific to interests mentioned in the bio"
              }
            },
            required: ["suggestions", "followUpQuestions"],
          },
        },
      ],
      function_call: { name: "suggest_gifts" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      max_completion_tokens: 6144,
      temperature: 1.0,
    })
  });

  // Log full API response for debugging
  const responseData = await response.json();
  console.log("Full API response:", JSON.stringify(responseData, null, 2));

  // Check if response is ok and has the expected structure
  if (!response.ok) {
    console.error("API request failed:", responseData);
    throw new Error(`API request failed: ${responseData.error?.message || 'Unknown error'}`);
  }

  // Check if function_call exists in the response
  const message = responseData.choices?.[0]?.message;
  if (!message?.function_call?.arguments) {
    console.error("No function_call found in response. Full message:", message);
    console.error("Finish reason:", responseData.choices?.[0]?.finish_reason);
    throw new Error("API did not return expected function call - response may have been truncated");
  }

  const fcArgs = JSON.parse(message.function_call.arguments);

  console.log("Parsed function arguments:", JSON.stringify(fcArgs, null, 2));
  console.log("followUpQuestions array:", JSON.stringify(fcArgs.followUpQuestions, null, 2));
  console.log("followUpQuestions length:", fcArgs.followUpQuestions?.length || 0);

  if (!Array.isArray(fcArgs.suggestions) || !Array.isArray(fcArgs.followUpQuestions)) {
    console.error("Validation error: suggestions or followUpQuestions is not an array");
    throw new Error("Bad model response");
  }

  // Log the final returned data
  const result = {
    suggestions: fcArgs.suggestions as Suggestion[],
    followUpQuestions: fcArgs.followUpQuestions as FollowUpQuestion[]
  };

  console.log("Final result object:", JSON.stringify(result, null, 2));

  return result;
}
