//this should toggle the video in the player when pressed
import React from 'react';

class VidButton extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      //these are videos suffixes that I want to append to youtube url
      vids: ['d9mLhZtSwSs', 't4l5JIRyx6Q', 'HZCxGwv6jIw', 'PD-g54MVZlc', 'w4i1hxabOmc'],
      vidnum: 0,
    };
  }
  handleClick(){
    let vl = this.state.vids;
    let place = this.state.vidnum;
    if(place === 0){
      place = vl.length - 1;
    }
    else{
      place--;
    }
    let newVidId = vl[place];
    let frame = null;
    let replaceId = 'ds';
    let url = "https://www.youtube.com/embed/" + newVidId;
    if( document.getElementById(replaceId) === null){
      replaceId = 'dsi'
      url = "https://img.youtube.com/vi/" + newVidId + "/hqdefault.jpg"
    }
    
    frame = document.getElementById(replaceId).cloneNode();
    frame.src = url;
    document.getElementById(replaceId).parentNode.replaceChild(frame, document.getElementById(replaceId));
    this.setState({
      vidnum: place,
    });
  }
  
  render(){
    return(
      <button className="vidButton" onClick={() => this.handleClick()}>next video</button>
    );
  }

}
export default VidButton;