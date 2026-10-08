require('dotenv').config();
const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} from ${req.headers['user-agent'] || 'unknown'}`);
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Tetto-Signature');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.get('/debug', (req, res) => {
  res.json({ has_key: !!process.env.ANTHROPIC_API_KEY });
});

app.get('/api/text-summarizer', (req, res) => {
  res.json({ status: 'ok', name: 'TextSummarizer' });
});

app.post('/api/text-summarizer', async (req, res) => {
  console.log('POST body:', JSON.stringify(req.body));
  try {
    const { text } = req.body.input || req.body;
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 300,
      messages: [{ role: 'user', content: `Summarize this text in 2-3 sentences:\n\n${text}` }],
    });
    res.json({ summary: message.content[0].text });
  } catch (error) {
    console.error('ERROR:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => res.send('Text Summarizer Agent is running.'));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
