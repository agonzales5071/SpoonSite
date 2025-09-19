import './latestMic.css';
import VideoWithThumbnail from './components/Common/VideoPlayer';
import useIsMobile from './components/Common/IsMobile';
import React, { useEffect, useState } from 'react';
import {Link} from 'react-router-dom';
import axios from 'axios';

const YouTubePlaylistLatestVideo = ({ playlistId }) => {
  
  const [videoData, setVideoData] = useState(null);

  useEffect(() => {
    const isLocal = window.location.hostname === 'localhost';
    const baseUrl = isLocal
      ? 'http://localhost:4000/api'
      : 'https://getlatestyoutubevideo-wvmbijgnea-uc.a.run.app';

    const fetchLatestVideo = async () => {
      try {
        const res = await axios.get(`${baseUrl}/latest-video`,
          { params: { playlistId } }
        );
        setVideoData(res.data);
      } catch (error) {
        console.error('Error fetching video:', error);
      }
    };

    fetchLatestVideo();
  }, [playlistId]);
  const isMobile = useIsMobile();
  console.log("is mobile? " + isMobile);

  var thumbnailStyle = {
    width: '100%',
    height: 'auto',
    aspectRatio: '9 / 16',
    borderRadius: '12px',
    objectFit: 'cover',
    display: 'block',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
  };
  var iframeStyle = {
    width: '100%',
    height: '100%',
    aspectRatio: '9 / 16',
    borderRadius: '12px',
    objectFit: 'cover',
    display: 'block',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
  };
  if(!isMobile){  
    thumbnailStyle = {
      width: '100%',
      height: 'auto',
      aspectRatio: '16 / 9',
      borderRadius: '12px',
      objectFit: 'cover',
      display: 'block',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    };
  }

  return videoData ? (
    <div className="poster-wrapper">
      <div className="poster-container">
        <h1 className="poster-subtitle">{videoData.title}</h1>
        <div className="video-frame">
          <VideoWithThumbnail thumbnailStyle={thumbnailStyle} iframeStyle={iframeStyle} 
          videoId={videoData.videoId} title={videoData.title} />
        </div>
        <p className="poster-description">{videoData.description}</p>
      </div>
    </div>
  ) : 
  (
    <p id="mic-loading">Loading…</p>
  );
};


class LatestMic extends React.Component {
  componentDidMount() {
    document.body.classList.add("body-mic");
    document.documentElement.classList.add("body-mic");
    document.getElementById("root")?.classList.add("body-mic");
    console.log("latest-mic page mounted");
    }
  
    componentWillUnmount() {
      document.body.classList.remove("body-mic");
      document.documentElement.classList.remove("body-mic");
      document.getElementById("root")?.classList.remove("body-mic");
    }
    render(){
        return (
          <div className="App" style={{ position: "relative", minHeight: "100vh", overflow: "visible" }}>
            <Link to="/"><button className='back-button-mic'></button></Link>
            <YouTubePlaylistLatestVideo playlistId="PLeY5IujjY3J1EP8Ogq2DkkGAAUiFRyp-G" />
          </div>
        );
    }
}


export default LatestMic;