import React, { useState } from 'react';

const VideoWithThumbnail = ({
  videoId,
  title,
  containerStyle = {},
  thumbnailStyle = {},
  iframeStyle = {},
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  const defaultDimensions = {
    width: '100%',
    height: '315px',
  };
  
  return (
    <div style={{ maxWidth: '560px', margin: 'auto', ...containerStyle }}>
      {!isPlaying ? (
        <div
          onClick={() => setIsPlaying(true)}
          style={{
            position: 'relative',
            cursor: 'pointer',
            display: 'inline-block',
            width: '100%',
            ...thumbnailStyle,
          }}
        >
          <img
            src={thumbnailUrl}
            alt={`Thumbnail of ${title}`}
            style={{
                display: 'block',
                ...defaultDimensions,
                ...thumbnailStyle,
            }}
            />
          {/* Play button overlay */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              transform: 'translateY(-30px)',
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              fontSize: '60px',
              color: 'white',
              textShadow: '0 0 10px black',
              pointerEvents: 'none',
            }}
          >
            ▶
          </div>
        </div>
      ) : (
        <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{
            ...defaultDimensions,
            ...iframeStyle,
        }}
        />
      )}
    </div>
  );
};

export default VideoWithThumbnail;
