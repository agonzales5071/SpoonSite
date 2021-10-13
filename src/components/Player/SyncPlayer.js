import React from "react";
import YouTube from "react-youtube";


function SyncPlayer({ setPlayerURL, sendURL}) {
  const [videoUrl, setVideoUrl] = React.useState("");
  let videoCode;
  if (videoUrl) {
    videoCode = videoUrl.split("v=")[1].split("&")[0];
    setPlayerURL(videoCode);
    sendURL();
  }



  const opts = {
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      autoplay: 0
    }
  };


  return (
    <div>
      <div>
        <input id="urlinput" type="text" placeholder="Video URL" />
        <button onClick={(e) => setVideoUrl(document.getElementById("urlinput").value)}>submit</button>
        <div>
          <YouTube
            videoId={videoCode}
            containerClassName="embed embed-youtube"
            opts={opts}
          />
        </div>
      </div>

    </div>
  );
}

export default SyncPlayer;