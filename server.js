require('dotenv').config();
const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
app.use(express.json());

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.get('/debug', (req, res) => {
  res.json({
    has_key: !!process.env.ANTHROPIC_API_KEY,
    key_length: (process.env.ANTHROPIC_API_KEY || '').length,
  });
});

app.post('/api/text-summarizer', async (req, res) => {
  try {
    const { text } = req.body.input || req.body;
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 300,
      messages: [{ role: 'user', content: `Summarize this text in 2-3 sentences:\n\n${text}` }],
    });
    res.json({ summary: message.content[0].text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => res.send('Text Summarizer Agent is running.'));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
