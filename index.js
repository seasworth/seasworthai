const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

app.use(express.static('public'));
app.use(express.json({ limit: '50mb' }));

// Chat endpoint with debug logging
app.post('/api/chat', async (req, res) => {
  // Debug log incoming data for every POST
  console.log('\n=== /api/chat DEBUG ===');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('Body type:', typeof req.body);
  console.log('Received "message":', req.body?.message);
  console.log('======================\n');
  try {
    if (!GROQ_API_KEY) {
      return res.status(500).json({ error: { message: 'GROQ_API_KEY is not configured.' } });
    }

    const { message, messages = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: { message: 'Message is required.' }, received: req.body });
    }

    const chatMessages = [
      { role: 'system', content: 'You are a helpful AI assistant.' },
      ...messages,
      { role: 'user', content: message }
    ];

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: chatMessages,
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      return res.status(500).json({ error: { message: 'Failed to get response from AI service.' } });
    }

    const data = await response.json();
    res.json({ text: data.choices[0]?.message?.content || 'No response.' });
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: { message: 'Internal server error.' } });
  }
});

// HTML page serving
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'landing.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/support.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'support.html'));
});

app.get('/access.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'access.html'));
});

app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/dev-portal.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dev-portal.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running successfully on port ${PORT}`);
});
