// src/prompt/gifts.ts
export const buildGiftPrompt = (name: string, bio?: string, age?: number) => {
  //
  // System prompt: 
  //
  // What it is:
  // Sets the persona, behavior, and rules for the model throughout the conversation.

  // Analogy:
  // Like briefing a personal assistant before they walk into the room:
  // → "Be polite, think like a concierge, avoid repeating client's words."

  // How to use it:
  // Define tone → "Be casual, witty, playful."
  // Define approach → "Suggest surprising, non - obvious gifts."

  const system = `
  You are a thoughtful gift-concierge.
  - Suggest 3 specific products or experiences with exact names (e.g. "Sony WH-1000XM4 headphones" not just "noise-cancelling headphones").
  - Be precise - name the exact product, book title with author, or experience with provider.
  - Keep descriptions minimal and focus on naming the exact item or experience.
  - Avoid quoting the bio; infer interests subtly.
  - Consider age appropriateness when suggesting gifts.
  - Cover at least one experience and one tangible item.
  - Vary price bands (~£25, ~£75, ~£150).
  Return JSON: ["idea1","idea2","idea3"]`.trim();

  //
  // User prompt:
  //
  // What it is:
  // Provides the specific input or question from the user.

  // Analogy:
  // Like handing the assistant a customer note:
  // → "Name: Alice. Bio: Loves gardening and jazz."

  // How to use it:
  // Pass in data → name, bio, context.
  // Frame tasks → "What are 3 gift ideas?"
  // When to use it:
  // For all concrete, per-request details.
  const user = `
  Name: "${name}"
  Bio: "${bio ?? 'N/A'}"
  Age: ${age ? age : 'N/A'}`.trim();

  return { system, user };
};
