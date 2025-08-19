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
app.use(express.static('public'));
app.use(express.json({ limit: '50mb' }));

// ===================================================================
//  API ROUTES
// ===================================================================

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    if (!GROQ_API_KEY) {
        return res.status(500).json({ error: { message: 'GROQ_API_KEY is not configured.' } });
    }
    try {
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
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama3-8b-8192',
                messages: chatMessages,
                temperature: 0.7,
                max_tokens: 1000,
            }),
        });
        if (!response.ok) {
            const errorData = await response.text();
            console.error('Groq API Error:', errorData);
            return res.status(500).json({ error: { message: 'Failed to get response from AI service.' } });
        }
        const data = await response.json();
        const aiMessage = data.choices[0]?.message?.content || 'No response received.';
        res.json({ text: aiMessage });
    } catch (error) {
        console.error('Chat endpoint error:', error);
        res.status(500).json({ error: { message: 'Internal server error.' } });
    }
});

// Research endpoint
app.post('/api/research', async (req, res) => {
    if (!SERPER_API_KEY) {
        return res.status(500).json({ error: { message: 'SERPER_API_KEY is not configured.' } });
    }
    try {
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ error: { message: 'Query is required.' } });
        }
        const searchResponse = await fetch('https://google.serper.dev/search', {
            method: 'POST',
            headers: {
                'X-API-KEY': SERPER_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ q: query, num: 5 }),
        });
        if (!searchResponse.ok) {
            return res.status(500).json({ error: { message: 'Failed to search.' } });
        }
        const searchData = await searchResponse.json();
        const results = searchData.organic?.slice(0, 3) || [];
        let searchSummary = `Here are the search results for "${query}":\n\n`;
        results.forEach((result, index) => {
            searchSummary += `${index + 1}. **${result.title}**\n`;
            searchSummary += `   ${result.snippet}\n`;
            searchSummary += `   Source: ${result.link}\n\n`;
        });
        res.json({ answer: searchSummary });
    } catch (error) {
        console.error('Research endpoint error:', error);
        res.status(500).json({ error: { message: 'Internal server error.' } });
    }
});

// Fetch URL endpoint
app.post('/api/fetch-url', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: { message: 'URL is required.' } });
        }
        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        if (!response.ok) {
            return res.status(500).json({ error: { message: 'Failed to fetch URL.' } });
        }
        const html = await response.text();
        const $ = cheerio.load(html);
        const title = $('title').text() || 'No title found';
        const content = $('p').text().substring(0, 2000) || 'No content found';
        res.json({ title, content });
    } catch (error) {
        console.error('Fetch URL endpoint error:', error);
        res.status(500).json({ error: { message: 'Internal server error.' } });
    }
});

// Generate image endpoint
app.post('/api/generate-image', async (req, res) => {
    if (!CLIPDROP_API_KEY) {
        return res.status(500).json({ error: { message: 'CLIPDROP_API_KEY is not configured.' } });
    }
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: { message: 'Prompt is required.' } });
        }
        const form = new FormData();
        form.append('prompt', prompt);
        const response = await fetch('https://clipdrop-api.co/text-to-image/v1', {
            method: 'POST',
            headers: { 'x-api-key': CLIPDROP_API_KEY },
            body: form,
        });
        if (!response.ok) {
            return res.status(500).json({ error: { message: 'Failed to generate image.' } });
        }
        const buffer = await response.buffer();
        const base64Image = buffer.toString('base64');
        res.json({ imageBase64: base64Image });
    } catch (error) {
        console.error('Generate image endpoint error:', error);
        res.status(500).json({ error: { message: 'Internal server error.' } });
    }
});

// Generate video endpoint
app.post('/api/generate-video', async (req, res) => {
    if (!IMAGINE_TOKEN) {
        return res.status(500).json({ error: { message: 'IMAGINE_TOKEN is not configured.' } });
    }
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: { message: 'Prompt is required.' } });
        }
        res.json({
            videoUrl: null,
            message: "Video generation is not yet implemented. Please add your video generation logic here."
        });
    } catch (error) {
        console.error('Generate video endpoint error:', error);
        res.status(500).json({ error: { message: 'Internal server error.' } });
    }
});

// Crypto price endpoint
app.get('/api/crypto-price', async (req, res) => {
    if (!CRYPTOCOMPARE_API_KEY) {
        return res.status(500).json({ error: { message: 'CRYPTOCOMPARE_API_KEY is not configured.' } });
    }
    try {
        const { symbol = 'BTC' } = req.query;
        const response = await fetch(
            `https://min-api.cryptocompare.com/data/price?fsym=${symbol}&tsyms=USD&api_key=${CRYPTOCOMPARE_API_KEY}`
        );
        if (!response.ok) {
            return res.status(500).json({ error: { message: 'Failed to fetch crypto price.' } });
        }
        const data = await response.json();
        res.json({
            symbol: symbol.toUpperCase(),
            price: data.USD || 'Price not available'
        });
    } catch (error) {
        console.error('Crypto price endpoint error:', error);
        res.status(500).json({ error: { message: 'Internal server error.' } });
    }
});

// Crypto top list endpoint
app.get('/api/crypto-toplist', async (req, res) => {
    if (!CRYPTOCOMPARE_API_KEY) {
        return res.status(500).json({ error: { message: 'CRYPTOCOMPARE_API_KEY is not configured.' } });
    }
    try {
        const response = await fetch(
            `https://min-api.cryptocompare.com/data/top/mktcapfull?limit=10&tsym=USD&api_key=${CRYPTOCOMPARE_API_KEY}`
        );
        if (!response.ok) {
            return res.status(500).json({ error: { message: 'Failed to fetch crypto top list.' } });
        }
        const data = await response.json();
        const topCryptos = data.Data?.map(crypto => ({
            name: crypto.CoinInfo?.FullName,
            symbol: crypto.CoinInfo?.Name,
            price: crypto.RAW?.USD?.PRICE,
            marketCap: crypto.RAW?.USD?.MKTCAP
        })) || [];
        res.json(topCryptos);
    } catch (error) {
        console.error('Crypto top list endpoint error:', error);
        res.status(500).json({ error: { message: 'Internal server error.' } });
    }
});

// ===================================================================
//  HTML PAGE SERVING
// ===================================================================

// THIS IS THE FIX:
// This new route specifically handles the initial visit to your site's root URL.
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'landing.html'));
});

// This is the catch-all route. It now only runs for requests that don't match
// an API route OR the root route we just added above.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ===================================================================
//  START THE SERVER
// ===================================================================
app.listen(PORT, () => {
    console.log(`Server is running successfully on port ${PORT}`);
});