const {onRequest} = require("firebase-functions/v2/https");
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const {defineSecret} = require("firebase-functions/params");

const YOUTUBE_API_KEY = defineSecret("YOUTUBE_API_KEY");

const app = express();
app.use(cors({origin: "https://www.droppedspoon.net"}));

console.log("Function initializing...");
app.get("/latest-video", async (req, res) => {
  console.log("Received request");
  const apiKey = process.env.YOUTUBE_API_KEY; // use Secret Manager or .env
  console.log("Accessed API Key");
  const playlistId = req.query.playlistId;
  if (!playlistId) {
    return res.status(400).send("Missing playlistId");
  }

  try {
    console.log("within try");
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=1&key=${apiKey}`;
    console.log("playlistId:", playlistId); // log the incoming param
    console.log("YouTube API URL:", url); // log the final URL

    const response = await axios.get(url);
    const latestVideo = response.data.items[0];
    if (!latestVideo) {
      return res.status(404).send("No videos found");
    }

    const {title, description, resourceId} = latestVideo.snippet;
    res.status(200).json({videoId: resourceId.videoId, title, description});
  } catch (error) {
    console.error("YouTube API error:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

exports.getLatestYouTubeVideo = onRequest(
    {
      region: "us-central1",
      timeoutSeconds: 60,
      memory: "256MiB",
      secrets: [YOUTUBE_API_KEY],
    },
    app,
);
