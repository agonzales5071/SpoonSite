import React from 'react';
import './App.css';
import Portfolio from "./portfolio.js";
import SpoonDrop from "./spoondrop.js"
import { BrowserRouter as Router, Route, Switch, Link} from 'react-router-dom';
import Chat from "./components/Chat/Chat.js"
import Join from "./components/Join/Join.js"

class App extends React.Component {
  render(){
    return(
      <Router>
        <div className="App">
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/portfolio" component={Portfolio} />
            <Route path="/spoondrop" component={SpoonDrop} />
            <Route path="/join" component={Join} />
            <Route path="/chat" component={Chat} />
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
          <p id="construction">currently under construction</p>
          <HotAir id="pb" textid="pbtext" num="0" className="hotair" link="/portfolio" text="portfolio" img="images/portfolioballoon.png"></HotAir>
          <HotAir id="sd" textid="sdtext" num="1" className="hotair" link="/spoondrop" text="spoon drop" img="images/spoondropballoon2.png"></HotAir>
          <HotAir id="cr" textid="crtext" num="2" className="hotair" link="/join" text="chat room" img="images/chatballoon.png"></HotAir>
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
      total: 3,
      textid: props.textid,
      num: props.num,//indexed starting at 0
      cssProperties: { '--animation-time': (Math.trunc(Math.random()*10) +15) + 's',
        '--x-float-start': (((80/4) * ((props.num*1) + 1)) + 10) + 'vw', 
        '--x-float-end':(((80/4) * ((props.num*1) + 1)) + 10 + (Math.trunc(Math.random()*6) - 2)) + 'vw',
        '--y-float-start': 60 + 'vh',
        '--y-float-end': 30 + Math.trunc(Math.random()*15) + 'vh' }
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
            cssProperties: { '--animation-time': this.state.cssProperties["--animation-time"], 
            '--x-float-start': this.state.cssProperties['--x-float-end'],
            '--y-float-start': this.state.cssProperties['--y-float-end'],
            '--x-float-end': Math.trunc(Math.random()*(80/this.state.total)) + 10 + (this.state.num*(80/this.state.total)) + 'vw',
            '--y-float-end': Math.trunc(Math.random()*50) + 10 + 'vh'}
          });
        }}
      >
        <Link to={this.state.link}><button className="balloonbutt">
          <img className="balloonimg" src={this.state.img} alt=""></img>
          <div className="balloontext" id={this.state.textid} >{this.state.text}</div></button>
        </Link>
      </div>
    );
  }
}

export default App;
