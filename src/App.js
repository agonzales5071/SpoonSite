import React from 'react';
import logo from './logo.svg';
import './App.css';

class App extends React.Component {
  render(){
    return (
      <div className="App">
        <div class="container">
          <img src="images/sky.png" class="object" data-value="1" alt="rip"/>      
          <img src="images/mountains.png" class="object" data-value="2" alt="the"/>
          <img src="images/trees.png" class="object" data-value="4" alt="whole"/>
          <img src="images/hills.png" class="object" data-value="5" alt="aesthetic"/>
          <img src="images/grass.png" class="object" data-value="6" alt="dude"/>
        </div>

        <div className="content">
          <title>Dropped Spoon</title>
          <h1 id="title" title="&#x1f944;">Alexander <q>DroppedSpoon</q> Gonzales</h1>

          <nav>
            <a href="resume/">Resume</a> |
            <a href="spoondrop/">Spoon Drop</a>
          </nav>

          <p>lorem ipsum or whatever</p>
          <iframe id="videoplayer" title="Some of My Videos" src="https://www.youtube.com/embed/d9mLhZtSwSs" allowfullscreen="true">
          </iframe>

          <br></br>
          <button id="next" type="button" onclick="togglevid()">next video</button>

          <button id="location" type="button" onclick="getlocation()">
            click this button to see what happens when you talk trash about me
          </button>
          <p id="locationtext"></p>
        </div>
      </div>
      );
    }
}
export default App;
