import { createAgentHandler, createAnthropic } from 'tetto-sdk/agent';

const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export const POST = createAgentHandler({
  async handler(input: { text: string }) {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 300,
      messages: [{ role: 'user', content: `Summarize this text in 2-3 sentences:\n\n${input.text}` }],
    });
    return { summary: (message.content[0] as any).text };
  },
});
