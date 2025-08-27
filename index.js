const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

app.use(express.static('public'));
app.use(express.json({ limit: '50mb' }));

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    if (!GROQ_API_KEY) {
      return res.status(500).json({ error: { message: 'GROQ_API_KEY is not configured on the server.' } });
    }

    const { message, messages = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: { message: 'A message is required in the request body.' }, received: req.body });
    }

    const chatMessages = [
      { role: 'system', content: 'You are a helpful AI assistant.' },
      ...messages.map(msg => ({ role: msg.role, content: msg.content })),
      { role: 'user', content: message }
    ];

    // ================== FIXED CODE BLOCK START ==================
    // The URL `GROQ_API_URL` and the `Authorization` header were added.
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
    // =================== FIXED CODE BLOCK END ===================

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error from Groq API:", errorText);
      return res.status(response.status).json({ error: { message: `Failed to get a valid response from the AI service. Details: ${errorText}` } });
    }

    const data = await response.json();
    const botResponse = data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    res.json({ text: botResponse });

  } catch (error) {
    console.error('An error occurred in the /api/chat endpoint:', error);
    res.status(500).json({ error: { message: 'An internal server error occurred.' } });
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});