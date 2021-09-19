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
    var vidId = vl[place];
    var url = "https://www.youtube.com/embed/" + vidId;
    var frame = document.getElementById('ds').cloneNode();
    frame.src = url;
    document.getElementById('ds').parentNode.replaceChild(frame, document.getElementById('ds'));
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