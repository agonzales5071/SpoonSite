import { useEffect, useRef, useState } from 'react'
import Matter from "matter-js";
import "./spoondrop.css";
import GameOver from './util/gameoverPopup';
import { Link } from 'react-router-dom';
import { getSpoon } from './util/spoonHelper';

const SpoonDropGameSpeed = () => {
  const boxRef = useRef(null);
  const canvasRef = useRef(null);
  const restartRef = useRef(null);
  const [playButtonText, setPlayButtonText] = useState("Play")

  const [gameOverState, setGameOverState] = useState(false);
  const [message, setMessage] = useState("Endurance test: How many spoons can you drop in 15 seconds?");
  const [scoreText, setScoreText] = useState("Click to drop a spoon in the bucket.");

  useEffect(() => {
    var width = window.innerWidth;
    var height = window.innerHeight;
    let Engine = Matter.Engine;
    let Render = Matter.Render;
    let Runner = Matter.Runner;
    let Bodies = Matter.Bodies;
    let Composite = Matter.Composite;
    let Mouse = Matter.Mouse;
    let MouseConstraint = Matter.MouseConstraint;
  
    let engine = Engine.create({});
    let runner = Runner.create({});

    let render = Render.create({
      element: boxRef.current,
      engine: engine,
      canvas: canvasRef.current,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
      },
    });

    var hatch = Bodies.rectangle(width/2, height*4/5, width/2, 50, {isStatic: true} ),
        sideL = Bodies.rectangle(width*3/4, height*1/20, 50, height*3/2, {isStatic: true}),
        sideR = Bodies.rectangle(width*1/4, height*1/20, 50, height*3/2, {isStatic: true});

    //hatch.axes = Matter.Axes.fromVertices({x: width/4, y: height*4/5})

    Composite.add(engine.world, [ hatch, sideL, sideR]);

    // add mouse control
    var mouse = Mouse.create(render.canvas),
      mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
          stiffness: 0.2,
          render: {
            visible: false
          }
        }
      });
    
    Composite.add(engine.world, mouseConstraint);
    
 
    var seconds = 1;
    var spoonCount = 0;
    var countingUp = false; 
    var allSpoons = [];
    var gameRunning = false;
    var gameStartable = true;
    var hatchPresent = true;
    Matter.Events.on(mouseConstraint, "mousedown", function(event) {
      //start timer
      //console.log("spoon count = " + spoonCount);
      //console.log("game running = " + gameRunning);
      if(!gameRunning){
        resetGame();
      }
      if (gameStartable){
        gameRunning = true;
        setGameOverState(false); // Show game over screen
        gameStartable = false;
        let timer = setInterval(function() {
          if(document.getElementById("speedclickdisplay") === null){
            clearInterval(timer);
          }
          else{
            seconds--;
            if(seconds>0){
              
                document.getElementById("speedclickdisplay").innerText = seconds;
              
            }
            // If the count down is over, write some text
            
            if (seconds < 0 && countingUp === false) {
              countingUp = true;
              let countUp = 0;
              //spoon tally
              var counter = setInterval(function(){
                if(document.getElementById("speedclickdisplay") === null){
                  clearInterval(counter);
                }
                else{
                  if(countUp < spoonCount && countingUp){
                    countUp++;
                    document.getElementById("speedclickdisplay").innerHTML = countUp;
                  }
                  if(countUp === spoonCount && countingUp){
                    countingUp = false;
                    clearInterval(counter);
                    clearInterval(timer);
                    setScoreText(spoonCount + " spoons dropped");
                    setPlayButtonText("Restart")
                    let endMessage = getPopupMessage();
                    setMessage(endMessage);
                    setTimeout(() => {
                      if(document.getElementById("speedclickdisplay").innerHTML){
                        document.getElementById("speedclickdisplay").innerHTML = "";
                      }
                      setGameOverState(true); // Show game over screen
                    }, 1100)
                  
                  }
                }
              }, 50);
              Matter.Body.setStatic(hatch, false);
              hatchPresent = false;
            }
          }
        }, 1000);
      }


      var size = 100,
      x = mouse.position.x,
      y = mouse.position.y,
      
      curSpoon = getSpoon(size, x, y, null)
      if(seconds>0){
        spoonCount++;
        allSpoons.push(curSpoon);
        Composite.add(engine.world, curSpoon);
      }

    });
    
    function resetGame(){
      spoonCount = 0;
      setGameOverState(false); // Show game over screen
      seconds = 15;
      countingUp = false;
      gameStartable = true; 
      allSpoons.forEach(element =>{
        Composite.remove(engine.world, element);
      })
      if(document.getElementById("speedclickdisplay")){
        document.getElementById("speedclickdisplay").innerText = "Time starts with your first spoon.";
      }
      if(!hatchPresent){
        hatch = Bodies.rectangle(width/2, height*4/5, width/2, 50, {isStatic: true} );
        Composite.add(engine.world, hatch);
      }
    }
    function getPopupMessage(isStart){
      if(isStart){
        return "context!"
      }
      let message;
      if(spoonCount >= 100){
        message = "WOW! You're real clicker. Respect.";
      }
      else if(spoonCount >= 50){
        message = "Now who's gonna pick all those up?";
      }
      else message = "Gotta pump up those numbers...";
      return message;
    }
      

    restartRef.current = resetGame;

    Runner.run(runner, engine)
    Render.run(render);
    setGameOverState(true); // Show game over screen
  // Cleanup on unmount
    return () => {
      Render.stop(render);
      Runner.stop(runner);
      Composite.clear(engine.world, false);
      Engine.clear(engine);
      render.canvas.remove();
      render.textures = {};
    };
  }, []);

  
    return (
      <div className="scene">
        <div>
          <GameOver message={message} scoreText={scoreText} visible={gameOverState} 
          onRestart={() => restartRef.current()} playButtonText={playButtonText} />
      </div>
        <canvas ref={canvasRef} />
        <Link to="/games"><button className='back-button'
        style={{ display: gameOverState ? "none" : "block" }}></button></Link>
        <div id="menutext">
          <p id="speedclickdisplay">Speed Click</p>
          <p id="restart"></p>
        </div>
      </div>
      )
  
}
export default SpoonDropGameSpeed;