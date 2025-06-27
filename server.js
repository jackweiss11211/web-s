const express = require('express');
const puppeteer = require('puppeteer-core');
const chromium = require('chrome-aws-lambda');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
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

// Google search endpoint
app.post('/api/search', async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) return res.status(400).json({ error: 'Query is required' });

        const timestamp = Date.now();
        const outputDir = `./search_results_${timestamp}`;
        fs.mkdirSync(outputDir, { recursive: true });

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });

        // Human-like navigation
        await page.goto('https://www.google.com', { waitUntil: 'networkidle0' });
        await page.waitForTimeout(getRandomDelay());

        await page.type('input[name="q"]', query, { delay: randomDelay(50, 150) });
        await page.waitForTimeout(getRandomDelay());
        await page.keyboard.press('Enter');
        await page.waitForTimeout(getRandomDelay());

        // Take screenshot
        const screenshotPath = path.join(outputDir, 'google_search.png');
        await page.screenshot({ path: screenshotPath });

        // Get HTML
        const htmlPath = path.join(outputDir, 'google_search.html');
        const html = await page.content();
        fs.writeFileSync(htmlPath, html);

        await browser.close();

        // Create zip file
        const zipPath = await createZip([
            { path: screenshotPath, name: 'google_search.png' },
            { path: htmlPath, name: 'google_search.html' }
        ], `search_results_${timestamp}.zip`);

        res.download(zipPath, () => {
            // Clean up files after download
            rimraf(outputDir);
            rimraf(zipPath);
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

// Website capture endpoint
app.post('/api/website', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) return res.status(400).json({ error: 'URL is required' });

        const timestamp = Date.now();
        const outputDir = `./website_capture_${timestamp}`;
        fs.mkdirSync(outputDir, { recursive: true });

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });

        // Human-like navigation
        await page.goto(url, { waitUntil: 'networkidle0' });
        await page.waitForTimeout(getRandomDelay());

        // Take screenshot
        const screenshotPath = path.join(outputDir, 'website.png');
        await page.screenshot({ path: screenshotPath });

        // Get HTML
        const htmlPath = path.join(outputDir, 'website.html');
        const html = await page.content();
        fs.writeFileSync(htmlPath, html);

        await browser.close();

        // Create zip file
        const zipPath = await createZip([
            { path: screenshotPath, name: 'website.png' },
            { path: htmlPath, name: 'website.html' }
        ], `website_capture_${timestamp}.zip`);

        res.download(zipPath, () => {
            // Clean up files after download
            rimraf(outputDir);
            rimraf(zipPath);
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

// Video download endpoint
app.post('/api/video', async (req, res) => {
    try {
        const { videoUrl } = req.body;
        if (!videoUrl) return res.status(400).json({ error: 'Video URL is required' });

        const timestamp = Date.now();
        const outputDir = `./video_download_${timestamp}`;
        fs.mkdirSync(outputDir, { recursive: true });

        // Download video using Puppeteer
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });

        // Human-like navigation
        await page.goto(videoUrl, { waitUntil: 'networkidle0' });
        await page.waitForTimeout(getRandomDelay());

        // Get video element and download
        const videoPath = path.join(outputDir, 'video.mp4');
        const videoElement = await page.$('video');
        if (videoElement) {
            const videoSrc = await page.evaluate(el => el.src, videoElement);
            const response = await fetch(videoSrc);
            const buffer = await response.buffer();
            fs.writeFileSync(videoPath, buffer);
        }

        await browser.close();

        // Create zip file
        const zipPath = await createZip([
            { path: videoPath, name: 'video.mp4' }
        ], `video_download_${timestamp}.zip`);

        res.download(zipPath, () => {
            // Clean up files after download
            rimraf(outputDir);
            rimraf(zipPath);
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

// Serve static files
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
