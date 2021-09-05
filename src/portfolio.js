import React from 'react';
import './portfolio.css';
import VidButton from './scripts/togglevid'

class Portfolio extends React.Component {
  componentDidMount(){
    //document.body.style.backgroundColor = "darkslategrey"// Set the style
    document.body.className="body-component-a" // Or set the class
    console.log("portfolio mounted")
  }
  componentWillUnmount(){
    document.body.className ="body"
  }
  render(){
    return (
      <div className="App">

        <div id="shapegroup">
          <div className="shapes" id="rotateleftshape"></div>
          <div className="shapes" id="rotaterightshape"></div>
          <div className="shapes"></div>
          <div className="shapes" id="horizontalshape"></div>
          <div className="shapes" id="verticalshape"></div>
        </div>

        <div className="content">
          <title>Dropped Spoon</title>
          <h1 id="title" title="&#x1f944;">Alexander <q>DroppedSpoon</q> Gonzales</h1>

          <h2 className="partition">Projects</h2>
          <Block header="Test"
          vidtitle="vidtitle"
          text="Lorem ipsum or whatever 2"
            link="https://www.youtube.com/embed/mmKnJ4VrQtM"/>

          <h2 className="partition">Games</h2>
          <Block header="The Goo Game"
          vidtitle="Goo Game Demo"
          text="The Goo Game was created for a UT Austin run game jam. I worked on this game in a team of five and in the end we were awarded Best Game Design. You play as a heart in a pile of goo that must reach the pipe to exit each level, traversing the terrain by throwing goo that the heart can land on safely."
            link="https://www.youtube.com/embed/mmKnJ4VrQtM"/>
          <br></br>
          <Block header="Office Simulator"
          vidtitle="Office Simulator Demo"
          text="This game was my final project in my Unreal course at UT. In it the player must traverse a soulless office building looking for the memos that are scattered throughout. During this venture, the player must avoid the gaze of wandering coworkers, in need of a partner for small talk, that will drain the players motivation."
          link="https://www.youtube.com/embed/mmKnJ4VrQtM"/>
          
          <h2 className="partition">Other Media</h2>
          <ButtonBlock header="Sketch Comedy"
          vidtitle="My Youtube Channel"
          text="In my free time I enjoy writing, directing, and acting in comedy sketches that I upload to my youtube. I think they're funny... click the button to see more!"
          link="https://www.youtube.com/embed/d9mLhZtSwSs"/>
          <br></br>
          <Block header="Super Heroes Anonymous"
          vidtitle="Short Film"
          text="Super Heroes Anonymous is an experimental short film I starred in, written, directed, and filmed my friend, Neil Potnis. The heroes in this short film are down on their luck because of a system that failed them, but that does not stop them from trying to do good. PG-13 Explicit Language"
          link="https://www.youtube.com/embed/UHwKtsTr7VM"/>
          <br></br>
        </div>
      </div>
      );
    }
}

function Block(props){

  return(
    <div className="block">
      <iframe className="vidplayer" title={props.vidtitle} src={props.link} allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
      <h1 className="head">{props.header}</h1>
      <p className="explan">{props.text}</p>
    </div>

  );
      
}

function ButtonBlock(props){

  return(
    <div className="block">
      <iframe className="vidplayer" id="ds" title ={props.vidtitle} src={props.link}></iframe>
      <h1 className="head">{props.header}</h1>
      <p className="explan">{props.text}</p>
      <VidButton></VidButton>
    </div>

  );
      
}




export default Portfolio;