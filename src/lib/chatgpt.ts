// src/lib/chatgpt.ts

const model = "gpt-4o-mini";

// src/lib/chatgpt.ts
export async function getSuggestionsForGiftee(
  gifteeName: string,
  bio?: string
): Promise<string[]> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OpenAI API key in environment variables.");
  }

  let prompt = `The giftee's name is "${gifteeName}". `;
  if (bio && bio.trim().length > 0) {
    prompt += `Here is some information about them: "${bio}". `;
  }
  prompt += `Provide three distinct, creative, one-line gift suggestions. No explanations, just the suggestions, each on a separate line.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt },
      ],
      max_tokens: 100,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenAI API error:", errorText);
    throw new Error("Error fetching suggestions from OpenAI");
  }

  const data = await response.json();
  const completionText = data.choices[0].message.content.trim();
  const suggestions = completionText
    .split("\n")
    .map((s: string) => s.trim())
    .filter(Boolean);

  return suggestions;
}
