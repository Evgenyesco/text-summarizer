require('dotenv').config();
const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
app.use(express.json());

// CORS — чтобы Tetto мог делать запросы
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Tetto-Signature');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.get('/debug', (req, res) => {
  res.json({
    has_key: !!process.env.ANTHROPIC_API_KEY,
    key_length: (process.env.ANTHROPIC_API_KEY || '').length,
  });
});

// GET на /api/text-summarizer — для проверки от Tetto
app.get('/api/text-summarizer', (req, res) => {
  res.json({
    status: 'ok',
    name: 'TextSummarizer',
    description: 'Summarizes long text into 2-3 concise sentences using Claude AI',
    input_schema: { text: 'string' },
    output_schema: { summary: 'string' },
  });
});

// POST — основная логика
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
