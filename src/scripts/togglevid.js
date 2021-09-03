//this should toggle the video in the player when pressed
import React from 'react';

class VidButton extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      //these are videos suffixes that I want to append to youtube url
      vids: ['d9mLhZtSwSs', 't4l5JIRyx6Q', 'HZCxGwv6jIw', 'PD-g54MVZlc'],
      vidnum: 0,
    };
  }
  handleClick(){
    let vl = this.state.vids;
    let place = this.state.vidnum;
    if(place == 0){
      place = vl.length - 1;
    }
    else{
      place--;
    }
    var vidId = vl[place];
    var url = "https://www.youtube.com/embed/" + vidId;
    document.getElementById('ds').src = url;
    this.setState({
      vidnum: place,
    });
      // console.log("vl1:", vl1 );
      // console.log("vl2:", vl2 );
  }
  
  render(){
    return(
      <button className="vidButton" onClick={() => this.handleClick()}>next video</button>
    );
  }

}
export default VidButton;