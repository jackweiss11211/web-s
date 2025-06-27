const express = require('express');
const puppeteer = require('puppeteer-core');
const chromium = require('chrome-aws-lambda');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const rimraf = promisify(require('rimraf'));
const archiver = require('archiver');

const app = express();
app.use(cors());
app.use(express.json());

// Helper functions for human-like delays
const randomDelay = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
const getRandomDelay = () => randomDelay(1000, 3000);

// Helper function to create zip file
const createZip = async (files, outputName) => {
    const output = fs.createWriteStream(outputName);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
        console.log(`Archive created successfully with ${archive.pointer()} total bytes`);
    });

    archive.pipe(output);
    
    files.forEach(file => {
        archive.file(file.path, { name: file.name });
    });
    
    await archive.finalize();
    return outputName;
};

// Get browser instance helper
const getBrowser = async () => {
    return await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
    });
};

// Google search endpoint
app.post('/api/search', async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) return res.status(400).json({ error: 'Query is required' });

        const timestamp = Date.now();
        const outputDir = `./search_results_${timestamp}`;
        fs.mkdirSync(outputDir, { recursive: true });

        const browser = await getBrowser();
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });

        // Rest of your existing search endpoint code...
        // [Previous search endpoint code here]


        await browser.close();
        res.json({ message: 'Search completed successfully' });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Failed to perform search', details: error.message });
    }
});

// Video download endpoint
app.post('/api/video', async (req, res) => {
    try {
        const { videoUrl } = req.body;
        if (!videoUrl) return res.status(400).json({ error: 'Video URL is required' });

        const browser = await getBrowser();
        const page = await browser.newPage();
        
        // Rest of your existing video endpoint code...
        // [Previous video endpoint code here]


        await browser.close();
        res.json({ message: 'Video processing completed' });
    } catch (error) {
        console.error('Video processing error:', error);
        res.status(500).json({ error: 'Failed to process video', details: error.message });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
