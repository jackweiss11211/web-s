async function handleSearch() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) {
        alert('Please enter a search query');
        return;
    }

    try {
        const response = await fetch('/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
        });

        if (!response.ok) {
            throw new Error('Search failed');
        }

        // The response will trigger a download automatically
        console.log('Search results downloaded successfully');
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to process search. Please try again.');
    }
}

async function handleWebsite() {
    const url = document.getElementById('urlInput').value.trim();
    if (!url) {
        alert('Please enter a website URL');
        return;
    }

    try {
        const response = await fetch('/api/website', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url }),
        });

        if (!response.ok) {
            throw new Error('Website capture failed');
        }

        // The response will trigger a download automatically
        console.log('Website capture downloaded successfully');
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to capture website. Please try again.');
    }
}

async function handleVideo() {
    const videoUrl = document.getElementById('videoInput').value.trim();
    if (!videoUrl) {
        alert('Please enter a video URL');
        return;
    }

    try {
        const response = await fetch('/api/video', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ videoUrl }),
        });

        if (!response.ok) {
            throw new Error('Video download failed');
        }

        // The response will trigger a download automatically
        console.log('Video downloaded successfully');
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to download video. Please try again.');
    }
}
