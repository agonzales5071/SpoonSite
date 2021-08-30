import React from 'react';
import './App.css';

class Portfolio extends React.Component {
  render(){
    return (
      <div className="App">

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

          {/* <LocationButton id="location" type="button"></LocationButton>
          <p id="locationtext"></p> */}
        </div>
      </div>
      );
    }
}
export default SpoonDrop;