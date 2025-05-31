/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

const functions = require('firebase-functions');
const axios = require('axios');


exports.getLatestYouTubeVideo = functions.https.onRequest(async (req, res) => {
  const apiKey = functions.config().youtube.key; // or use Secret Manager in v2
  const playlistId = req.query.playlistId;

  if (!playlistId) {
    return res.status(400).send('Missing playlistId');
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=1&key=${apiKey}`;
    const response = await axios.get(url);
    const latestVideo = response.data.items[0];

    if (!latestVideo) {
      return res.status(404).send('No videos found');
    }

    const snippet = latestVideo.snippet;
    const videoId = snippet.resourceId.videoId;
    const title = snippet.title;
    const description = snippet.description;

    res.status(200).json({ videoId, title, description });
  } catch (error) {
    console.error('YouTube API error:', error.message);
    res.status(500).send('Internal Server Error');
  }
});
