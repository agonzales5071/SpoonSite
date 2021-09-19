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
          <h1 id="portfoliotitle" title="&#x1f944;">Portfolio</h1>

          <h2 className="partition">pRoJecTs</h2>
          <Block header="Embedded Mario Game"
          vidtitle="Embedded Mario Game Demo"
          text="Working with a partner, I recreated a classic mario game using a microcontroller, two buttons, a sliding potentiometer, and an lcd screen. The game has multiple levels with scaling difficulty."
          link="https://www.youtube.com/embed/dEKImjohaoI"/>
          <Block header="Our Green Routine"
          vidtitle="Green Routine Demo"
          text="A team and I created an Android application with the purpose of informing users recycling habits. The app was coded in Java using Android Studio and utilized various API calls along with Google Firebase for data storage. The main idea of the app is to guide users recycling habits, ie if the user does not know whether or not an item is recyclable, they can check the app."
          link="https://www.youtube.com/embed/MZ_kZLQo5pk"/>
          <Block header="Nokia Site Deployment App"
          vidtitle="Deployment Demo"
          text="A team and I created an Android application for Nokia meant to assist in the deployment process of new cell towers. The app allows the user to visualize available map data in on an area map as well as in an Augmented reality view. This allows the on-site engineer to reconcile the differences between the (sometimes incomplete) available building data and existing stuctures."
          link="https://www.youtube.com/embed/8lv1UL6npek"/>
            
          <h2 className="partition">GaMes</h2>
          <Block header="The Goo Game"
          vidtitle="Goo Game Demo"
          text="The Goo Game was created for a UT Austin run game jam. I worked on this game in a team of five and in the end we were awarded Best Game Design. You play as a heart in a pile of goo that must reach the pipe to exit each level, traversing the terrain by throwing goo that the heart can land on safely."
          link="https://www.youtube.com/embed/_uCsK6URmqc"/>
          <br></br>
          <Block header="Office Simulator"
          vidtitle="Office Simulator Demo"
          text="This game was my final project in my Unreal course at UT. In it the player must traverse a soulless office building looking for the memos that are scattered throughout. During this venture, the player must avoid the gaze of wandering coworkers, in need of a partner for small talk, that will drain the players motivation."
          link="https://www.youtube.com/embed/mmKnJ4VrQtM"/>
          
          <h2 className="partition">OTheR MedIA</h2>
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
      <iframe key={props.link} className="vidplayer" id="ds" title ={props.vidtitle} src={props.link} 
      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
      <h1 className="head">{props.header}</h1>
      <p className="explan">{props.text}</p>
      <VidButton></VidButton>
    </div>

  );
      
}




export default Portfolio;