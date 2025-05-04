// src/prompt/gifts.ts
export const buildGiftPrompt = (name: string, bio?: string, age?: number, followUpQuestion?: string) => {
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
  - Vary price bands (~£10, ~£25, ~£50, ~£100).
  - Provide 3 follow-up prompts (maximum 3 words each) that could help refine the gift search further.
    * Include 1-2 general refinements (e.g. "Cheaper gifts", "More unique") 
    * Include 2-3 specific prompts directly related to interests or details mentioned in the bio
    * DO NOT include follow-up prompts that are not directly related to either the bio, the previous follow-up question, the previous gift suggestions, or general refinements.
  - If a follow-up request is provided, it's CRITICALLY IMPORTANT to directly address it in your suggestions. The follow-up request should dramatically change your recommendations.
  Return both gift suggestions and follow-up questions.`.trim();

  //
  // User prompt:
  //
  // What it is:
  // Provides the specific input or question from the user.

  // Analogy:
  // Like handing the assistant a note:
  // → "Name: Alice. Bio: Loves gardening and jazz."

  // How to use it:
  // Pass in data → name, bio, context.
  // Frame tasks → "What are 3 gift ideas?"
  // When to use it:
  // For all concrete, per-request details.
  let userPrompt = `
  Name: "${name}"
  Bio: "${bio ?? 'N/A'}"
  Age: ${age ? age : 'N/A'}`;

  if (followUpQuestion) {
    userPrompt += `\n\nIMPORTANT FOLLOW-UP REQUEST: ${followUpQuestion}
    Please dramatically change your suggestions to focus specifically on this request while still considering the person's bio.`;
  }

  return { system, user: userPrompt.trim() };
};
