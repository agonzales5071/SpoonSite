// youtube-proxy.js
const express = require('express');
const axios = require('axios');
const cors = require('cors'); 
require('dotenv').config(); // For using .env file

const app = express();
app.use(cors({ origin: 'http://localhost:3000' }));
const PORT = 4000;

app.get('/api/latest-video', async (req, res) => {
  const { playlistId } = req.query;
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!playlistId) {
    return res.status(400).json({ error: 'Missing playlistId' });
  }

  try {
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/playlistItems`,
      {
        params: {
          part: 'snippet',
          playlistId,
          maxResults: 1,
          key: apiKey,
        },
      }
    );

    const latest = response.data.items[0];
    if (!latest) return res.status(404).json({ error: 'No video found' });

    const { videoId } = latest.snippet.resourceId;
    const { title, description } = latest.snippet;

    res.json({ videoId, title, description });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch video' });
  }
});

app.listen(PORT, () => {
  console.log(`YouTube proxy server running on http://localhost:${PORT}`);
});
