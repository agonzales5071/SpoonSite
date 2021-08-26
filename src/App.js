import React from 'react';
import logo from './logo.svg';
import './App.css';
import togglevid from "./scripts/togglevid"
import getlocation from "./scripts/locationgag"
import react from 'react';
class App extends React.Component {
  render(){
    return (
      <div className="App">
        <div className="container">
          <img src="images/sky.png" className="object" data-value="1" alt="rip"/>      
          <img src="images/mountains.png" className="object" data-value="2" alt="the"/>
          <img src="images/trees.png" className="object" data-value="4" alt="whole"/>
          <img src="images/hills.png" className="object" data-value="5" alt="aesthetic"/>
          <img src="images/grass.png" className="object" data-value="6" alt="dude"/>
        </div>

        <div className="content">
          <title>Dropped Spoon</title>
          <h1 id="title" title="&#x1f944;">Alexander <q>DroppedSpoon</q> Gonzales</h1>

          <nav>
            <a href="resume/">Resume</a> |
            <a href="spoondrop/">Spoon Drop</a>
          </nav>

          <p>lorem ipsum or whatever</p>
          <iframe id="videoplayer" title="Some of My Videos" src="https://www.youtube.com/embed/d9mLhZtSwSs" allowFullScreen={true}>
          </iframe>

          <br></br>
          <VidButton className="butt" id="next" ></VidButton>

          <button id="location" type="button" onClick={getlocation}>
            click this button to see what happens when you talk trash about me
          </button>
          <p id="locationtext"></p>
        </div>
      </div>
      );
    }
}
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
    document.getElementById('videoplayer').src = url;
    this.setState({
      vidnum: place,
    });
      // console.log("vl1:", vl1 );
      // console.log("vl2:", vl2 );

  }
  
  render(){
    return(
      <button onClick={() => this.handleClick()}>next video</button>
    );
  }

}
export default App;
