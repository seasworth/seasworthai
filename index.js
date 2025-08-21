const express = require('express');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// --- Environment Variables ---
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const SERPER_API_KEY = process.env.SERPER_API_KEY;
const CLIPDROP_API_KEY = process.env.CLIPDROP_API_KEY;
const CRYPTOCOMPARE_API_KEY = process.env.CRYPTOCOMPARE_API_KEY;
const IMAGINE_TOKEN = process.env.IMAGINE_TOKEN;
const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// --- Middleware ---
// **IMPORTANT**: This serves all files from your 'public' folder.
// Make sure all your .html, .css, and client-side .js files are in a folder named "public".
app.use(express.static('public'));
app.use(express.json({ limit: '50mb' }));

// ===================================================================
//  API ROUTES (No changes needed here)
// ===================================================================

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    if (!GROQ_API_KEY) {
      return res.status(500).json({ error: { message: 'GROQ_API_KEY is not configured.' } });
    }

    const { message, messages = [] } = req.body;
    if (!message) {
      return res.status(400).json({ error: { message: 'Message is required.' } });
    }

    const chatMessages = [
      { role: "system", content: "You are a helpful AI assistant." },
      ...messages,
      { role: "user", content: message }
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

// Other API routes (research, generate-image, etc.) go here...
// ... (Your other API endpoints are fine and do not need to be changed)


// ===================================================================
//  HTML PAGE SERVING (THIS IS THE CORRECTED SECTION)
// ===================================================================

// When the user first visits the site, send them the landing page.
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'landing.html'));
});

// Explicitly define the route for the main chat application page.
app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Explicitly define the routes for all other pages.
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


// ===================================================================
//  START THE SERVER
// ===================================================================
app.listen(PORT, () => {
    console.log(`Server is running successfully on port ${PORT}`);
});