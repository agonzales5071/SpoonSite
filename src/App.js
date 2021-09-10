import React from 'react';
import logo from './logo.svg';
import './App.css';
import VidButton from './scripts/togglevid';
import Portfolio from "./portfolio.js";
import SpoonDrop from "./spoondrop.js"
import react from 'react';
import { BrowserRouter as Router, Route, Switch, Link} from 'react-router-dom';
// import RandomObjectMover from "./scripts/float"

class App extends React.Component {
  render(){
    return(
      <Router>
        <div className="App">
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/portfolio" component={Portfolio} />
            <Route path="/spoondrop" component={SpoonDrop} />
          </Switch>
        </div>
      </Router>
    );
  }
}


class Home extends React.Component {
  componentDidMount(){
    console.log("home mounted")
  }
  // componentWillUnmount(){
  // }
  render(){
    return (
      <div className="App">
        <div className="paralax">
          <img src="images/sky.png" className="object" data-value="1" alt="rip"/>      
          <img src="images/mountains.png" className="object" data-value="2" alt="the"/>
          <img src="images/trees.png" className="object" data-value="4" alt="whole"/>
          <img src="images/hills.png" className="object" data-value="5" alt="aesthetic"/>
          <img src="images/grass.png" className="object" data-value="6" alt="dude"/>
        </div>

        <div className="content">
          <title>Dropped Spoon</title>
          <h1 id="title" title="&#x1f944;">Alexander <q>DroppedSpoon</q> Gonzales</h1>
          <p>currently under construction</p>
          <HotAir id="pb" num="0" className="hotair" link="/portfolio" text="portfolio" img="images/portfolioballoon.png"></HotAir>
          {/* <LocationButton id="location" type="button"></LocationButton>
          <p id="locationtext"></p> */}
        </div>
      </div>
      );
    }
}

// function HotAir(props){
//   return(
//     <div className="balloon">
//       <Link to={props.link}><button className={props.cls}>
//         <img src={props.img} alt="portfolio"></img>
//         <div className="balloontext">{props.text}</div></button>
//       </Link>
//     </div>
//   );
// }
class HotAir extends React.Component{
  constructor(props){  
    super(props);  
    this.state = {
      link: props.link,
      cls: props.cls,
      img: props.img,
      text: props.text,
      total: 1,
      num: props.num,//indexed starting at 0
      cssProperties: { '--animation-time': 20 + 's',
        '--x-float-start': 40 + 'vw', '--x-float-end': 40 + 'vw',
        '--y-float-start': 60 + 'vh', '--y-float-end': 40 + 'vh' }
    }  
    //initial animation tim must be as long or longer than new time?
  }  

  render(){
    return(
      <div 
        className="balloon" 
        style={this.state.cssProperties}  
        onAnimationIteration={()=> {
          console.log(this.state.cssProperties);
          this.setState({
            ...this.state,
            cssProperties: { '--animation-time': '20s', 
            '--x-float-start': this.state.cssProperties['--x-float-end'],
            '--y-float-start': this.state.cssProperties['--y-float-end'],
            '--x-float-end': Math.trunc(Math.random()*(80/this.state.total)) + 10 + (this.state.num*(80/this.state.total)) + 'vw',
            '--y-float-end': Math.trunc(Math.random()*70) + 10 + 'vh'}
          });
        }}
      >
        <Link to={this.state.link}><button className="balloonbutt">
          <img src={this.state.img} alt=""></img>
          <div className="balloontext">{this.state.text}</div></button>
        </Link>
      </div>
    );
  }
}




// class LocationButton extends React.Component{
//   constructor(props){
//     super(props);
//     this.state = {
//       count: 0,
//       textID: "locationtext",
//       text: document.getElementById("locationtext"),
//     };
//   }
  
//   handleClick(){
//     var flag = 0;
//     const text = document.getElementById("locationtext");
//     if(flag == 0){
//       if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(this.showPosition);
//       } else {
//         text.innerHTML = "Geolocation is not supported by this browser.";
//       }
//     }
    


//   }

//   render(){
//     return(
//       <button onClick={() => this.handleClick()}>insult me</button>
//     )
//   }

//   getlocation(){
//     const text = document.getElementById("locationtext");
//     if (navigator.geolocation) {
//     navigator.geolocation.getCurrentPosition(this.showPosition);
//     } else {
//       text.innerHTML = "Geolocation is not supported by this browser.";
//     }
//   }
//   showPosition(position) {
//     const text = document.getElementById("locationtext");
//     let i = this.state.count;
//     if(i==0){
//       text.innerHTML = "That wasn't very nice of you to insult me but tbh idk what to do with your location like I did not think I would get this far... Here they are I guess?"
//       +"<br>Latitude: " + position.coords.latitude +
//       "<br>Longitude: " + position.coords.longitude;
//     }
//     else if(i==1){
//       text.innerHTML = "well don't press it again! let me think of something- hold on";
//     }
//     else if(i==2){
//       text.innerHTML = "umm...";
//     }
//     else if((i>=3 && i<=6) || i>8){
//       text.innerHTML = "...";
//     }  	
//     else if(i==7){
//       text.innerHTML = "I got nothing okay? Now leave me alone.";
//     }
//     else if(i==8){
//       text.innerHTML = "for realsies";
//     }
//     i++;
//     this.setState({
//       count: i,
//     });
//   }
// }

export default App;
