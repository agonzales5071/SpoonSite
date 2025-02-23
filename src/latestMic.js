import './latestMic.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const YouTubePlaylistLatestVideo = ({ playlistId }) => {
  const [latestVideo, setLatestVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_KEY = ''; // Replace with your API key
  const MAX_RESULTS = 1; // Limit to 1 latest video

  useEffect(() => {
    const fetchLatestVideo = async () => {
      try {
        const response = await axios.get(
          `https://www.googleapis.com/youtube/v3/playlistItems`, {
            params: {
              part: 'snippet',
              playlistId: playlistId,
              maxResults: MAX_RESULTS,
              key: API_KEY,
            }
          });
        
        const latestVideoData = response.data.items[0].snippet;
        setLatestVideo(latestVideoData);
      } catch (err) {
        setError('Failed to load video');
      } finally {
        setLoading(false);
      }
    };

    fetchLatestVideo();
  }, [playlistId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="video-container">
      {latestVideo && (
        <div className="video-wrapper">
          <h2>{latestVideo.title}</h2>
          <p>{latestVideo.description}</p>
          <iframe
            className="latest-video"
            src={`https://www.youtube.com/embed/${latestVideo.resourceId.videoId}`}
            title={latestVideo.title}
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}
    </div>
  );
};

class LatestMic extends React.Component {
    componentDidMount(){
      document.body.className="body-mic"; // Or set the class
      console.log("portfolio mounted");
    }
    componentWillUnmount(){
      document.body.className ="body";
    }
    render(){
        return (
            <YouTubePlaylistLatestVideo playlistId="PLeY5IujjY3J1EP8Ogq2DkkGAAUiFRyp-G" />
        );
    }
}


export default LatestMic;