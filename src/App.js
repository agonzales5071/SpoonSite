/*
to start development server:
npm start
to deploy:
npm run-script build 
in terminal-
firebase deploy --only hosting 

npm run dev to start youtube proxy also
*/

import React from 'react';
import './App.css';
import HotAir from './components/Home/HotAir.js';
import ScrollToTop from './components/Common/ScrollToTop.js';
import Portfolio from "./portfolio.js";
import Socials from "./socials.js";
import SpoonDrop from "./Physics/Freeplay.js";
import LatestMic from "./latestMic.js";
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Truck from "./components/Home/Truck.js";
import SpoonshipAsteroid from './Physics/spoondropSpaceOs.js';
import SpoonDropGameSpeed from './Physics/SpeedClick.js';
import SpoonDropHomerun from './Physics/Homerun.js';
import SpoonDropMenu from './Physics/Menu.js';
import SpoonDropDescent from './Physics/Descent.js';
import SpoonDropRescue from './Physics/Rescue.js';
import SpoonDropHotSpoontato from './Physics/HotSpoontato.js';
import SpoonDropCerealShot from './Physics/CerealShot.js';
import SpoonSaberBattle from './Physics/SpoonSaberBattle.js';




class App extends React.Component {
  
  render(){
    return(
      <Router>
        <ScrollToTop />
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />}/>
            <Route path="/portfolio" element={<Portfolio/>} />
            <Route path="/socials" element={<Socials/>} />
            <Route path="/latest-mic" element={<LatestMic/>} />
            <Route path="/games" element={<SpoonDropMenu/>} />
            <Route path="/games/Freeplay" element={<SpoonDrop/>} />
            <Route path="/games/SpeedClick" element={<SpoonDropGameSpeed/>} />
            <Route path="/games/Homerun" element={<SpoonDropHomerun/>} />
            <Route path="/games/Descent" element={<SpoonDropDescent/>} />
            <Route path="/games/Rescue" element={<SpoonDropRescue/>} />
            <Route path="/games/HotSpoontato" element={<SpoonDropHotSpoontato/>} />
            <Route path="/games/CerealShot" element={<SpoonDropCerealShot/>} />
            <Route path="/games/SpoonSaberBattle" element={<SpoonSaberBattle/>} />
            <Route path="/game/SpaceOs" element={<SpoonshipAsteroid/>} />
          </Routes>
        </div>
      </Router>
    );
  }
}

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.componentsData = [
      { id: "pb", textid: "pbtext", className: "hotair", link: "/portfolio", text: "portfolio", img: "images/portfolioballoon.png" },
      { id: "sd", textid: "sdtext", className: "hotair", link: "/games", text: "mini games", img: "images/spoondropballoon2.png"},
      { id: "fm", textid: "fmtext", className: "hotair", link: "/socials", text: "find me", img: "images/findmeballoon.png"},
       ];
  }
  componentDidMount(){
    document.body.className ="body";
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0); // force scroll to top
  }
  
  // componentWillUnmount(){
  // }
  render(){
  
    return (
      <div className="App">
        <div className="paralaxmobile">
          <img src="images/sky.png" className="paralaximagemobile" data-value="1" alt="rip"/>      
          <img src="images/mountains.png" className="paralaximagemobile" data-value="2" alt="the"/>
          <img src="images/trees.png" className="paralaximagemobile" data-value="4" alt="whole"/>
          <img src="images/hills.png" className="paralaximagemobile" data-value="5" alt="aesthetic"/>
          <img src="images/grass.png" className="paralaximagemobile" data-value="6" alt="dude"/>
        </div>

        <div className="paralax">
          <img src="images/sky.png" className="paralaximage" data-value="1" alt="rip"/>      
          <img src="images/mountains.png" className="paralaximage" data-value="2" alt="the"/>
          <img src="images/trees.png" className="paralaximage" data-value="4" alt="whole"/>
          <img src="images/hills.png" className="paralaximage" data-value="5" alt="aesthetic"/>
          <img src="images/grass.png" className="paralaximage" data-value="6" alt="dude"/>
        </div>

        <div className="content">
          <title>Dropped Spoon</title>
          <h1 id="title" title="&#x1f944;">Alexander <q>DroppedSpoon</q> Gonzales</h1>
          {/* <p id="construction">currently under construction</p> */}
          {this.componentsData.map((component, index) => (
          <HotAir
            key={index}
            id={index}
            totalComponents={this.componentsData.length}
            componentData={component} // Passing the entire object with multiple attributes
          />
        ))}
          {/* <HotAir id="cr" textid="crtext" num="3" className="hotair" link="/join" text="chat room" img="images/chatballoon.png"></HotAir> */}
        </div>

        <Truck/>
      </div>
      );
    }
}

export default App;
