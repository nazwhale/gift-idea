// src/prompt/gifts.ts
export const buildGiftPrompt = (name: string, bio?: string) => {
    const system = `
  You are a thoughtful gift-concierge.
  - Suggest 3 realistic gift ideas.
  - Avoid quoting the bio; infer interests subtly.
  - Cover at least one experience and one tangible item.
  - Vary price bands (~£25, ~£75, ~£150).
  Return JSON: ["idea1","idea2","idea3"]`.trim();

    const user = `
  Name: "${name}"
  Bio: "${bio ?? 'N/A'}"`.trim();

    return { system, user };
};
