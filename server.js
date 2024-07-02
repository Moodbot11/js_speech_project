const express = require('express');
const path = require('path');
require('dotenv').config(); // Ensure this loads environment variables from .env

const app = express();
const port = 8080;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/config', (req, res) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.error('API key not found in environment variables');
        res.status(500).json({ error: 'API key not found' });
        return;
    }
    res.json({ openaiApiKey: apiKey });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
