const express = require('express');
const path = require('path');
const FormData = require('form-data');
require('dotenv').config();

const app = express();
// Render will set the PORT environment variable. For local testing, it will use 3000.
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
// This serves all the files in your 'public' folder (index.html, css, etc.)
app.use(express.static('public'));
// This allows the server to read JSON from incoming requests
app.use(express.json({ limit: '50mb' }));


// ===================================================================
//  API ROUTES
// ===================================================================

// Note: All routes now start with '/api/'
app.post('/api/chat', async (req, res) => {
    if (!GROQ_API_KEY) return res.status(500).json({ error: { message: 'GROQ_API_KEY is not configured.' } });
    // ... Your full, original chat logic goes here ...
    res.json({ text: "This is a response from the chat endpoint." }); // Placeholder for your logic
});

app.post('/api/research', async (req, res) => {
    // ... Your full, original research logic goes here ...
    res.json({ answer: "Research results." }); // Placeholder
});

app.post('/api/fetch-url', async (req, res) => {
    // ... Your full, original fetch-url logic goes here ...
    res.json({ title: "Page Title", content: "Page content..." }); // Placeholder
});

app.post('/api/generate-image', async (req, res) => {
    // ... Your full, original generate-image logic goes here ...
    res.json({ imageBase64: "base64_string_here" }); // Placeholder
});

app.post('/api/generate-video', async (req, res) => {
    // ... Your full, original generate-video logic goes here ...
    res.json({ videoUrl: "http://example.com/video.mp4" }); // Placeholder
});

app.get('/api/crypto-price', async (req, res) => {
    // ... Your full, original crypto-price logic goes here ...
    res.json({ symbol: "BTC", price: "..." }); // Placeholder
});

app.get('/api/crypto-toplist', async (req, res) => {
    // ... Your full, original crypto-toplist logic goes here ...
    res.json([{ name: "Bitcoin", symbol: "BTC" }]); // Placeholder
});


// ===================================================================
//  HTML PAGE SERVING
// ===================================================================
// This is a catch-all route. Any request that doesn't match an API route
// will be sent the main index.html file. This is essential for
// Single-Page Applications (SPAs) where the routing is handled on the client-side.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// ===================================================================
//  START THE SERVER
// ===================================================================
app.listen(PORT, () => {
    console.log(`Server is running successfully on port ${PORT}`);
});