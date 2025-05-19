/*
to start development server:
npm start
to deploy:
npm run-script build 
in terminal-
firebase deploy --only hosting 
to reauthorize gh account:


*/

import React from 'react';
import './App.css';
import HotAir from './components/Home/HotAir.js';
import Portfolio from "./portfolio.js";
import Socials from "./socials.js";
import SpoonDrop from "./Physics/spoondrop.js"
import LatestMic from "./latestMic.js"
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Chat from "./components/Chat/Chat.js"
import Join from "./components/Join/Join.js"
import Truck from "./components/Home/Truck.js"
import SpoonDropGameSpeed from './Physics/spoondropGameSpeed';
import SpoonDropHomerun from './Physics/spoondropHomerun';
import SpoonDropMenu from './Physics/spoondropMenu';
import SpoonDropDescent from './Physics/spoondropDescent';



class App extends React.Component {
  
  render(){
    return(
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />}/>
            <Route path="/portfolio" element={<Portfolio/>} />
            <Route path="/spoondrop" element={<SpoonDrop/>} />
            <Route path="/socials" element={<Socials/>} />
            <Route path="/latest-mic" element={<LatestMic/>} />
            <Route path="/spoondropgamespeed" element={<SpoonDropGameSpeed/>} />
            <Route path="/spoondrophomerun" element={<SpoonDropHomerun/>} />
            <Route path="/spoondropMenu" element={<SpoonDropMenu/>} />
            <Route path="/spoondropDescent" element={<SpoonDropDescent/>} />
            <Route path="/join" component={Join} />
            <Route path="/chat" component={Chat} />
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
      { id: "sd", textid: "sdtext", className: "hotair", link: "/spoondropMenu", text: "spoon drop", img: "images/spoondropballoon2.png"},
      { id: "fm", textid: "fmtext", className: "hotair", link: "/socials", text: "find me", img: "images/findmeballoon.png"},
       ];
  }
  componentDidMount(){
    document.body.className ="body";
    console.log("home mounted")
    console.log("OS = " + getOS())
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
          {/* <HotAir id="pb" textid="pbtext" num="1" className="hotair" link="/portfolio" text="portfolio" img="images/portfolioballoon.png"></HotAir>
          <HotAir id="sd" textid="sdtext" num="2" className="hotair" link="/spoondropMenu" text="spoon drop" img="images/spoondropballoon2.png"></HotAir>
          <HotAir id="fm" textid="fmtext" num="3" className="hotair" link="/socials" text="find me" img="images/findmeballoon.png"></HotAir> */}
          {/* <HotAir id="cr" textid="crtext" num="3" className="hotair" link="/join" text="chat room" img="images/chatballoon.png"></HotAir> */}
        </div>

        <Truck/>
      </div>
      );
    }
}

function getOS() {
  var userAgent = window.navigator.userAgent,
      platform = window.navigator?.userAgentData?.platform ?? window.navigator.platform,
      macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
      windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
      iosPlatforms = ['iPhone', 'iPad', 'iPod'],
      os = null;

  if (macosPlatforms.indexOf(platform) !== -1) {
    os = 'Mac OS';
  } else if (iosPlatforms.indexOf(platform) !== -1) {
    os = 'iOS';
  } else if (windowsPlatforms.indexOf(platform) !== -1) {
    os = 'Windows';
  } else if (/Android/.test(userAgent)) {
    os = 'Android';
  } else if (!os && /Linux/.test(platform)) {
    os = 'Linux';
  }

  return os;
}

export default App;
