const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

const port = process.env.PORT || 3000;

const distPath = path.join(__dirname, 'dist');

// Simple request logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// IMPORTANT: Do NOT handle anything starting with /api-server
// This allows cPanel to route those requests to the backend app
app.use('/api-server', (req, res, next) => {
    // Just pass through, don't serve index.html or return 404
    next();
});

// Serve static files from 'dist'
app.use(express.static(distPath));

// Support for React Router (Single Page App)
app.get('*', (req, res) => {
    // If it's a request for an asset that wasn't found, don't send index.html
    if (req.url.includes('/assets/') || req.url.includes('.')) {
        return res.status(404).send(`Not found: ${req.url}`);
    }

    // If it's an api-server request that reached here, it means the backend app didn't catch it.
    if (req.url.startsWith('/api-server')) {
        return res.status(404).json({
            message: "API request reached frontend server. Backend app might not be running or mapped correctly.",
            url: req.url
        });
    }
    res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
    console.log(`Frontend server running on port ${port}`);
});
