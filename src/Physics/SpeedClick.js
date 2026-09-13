import { useEffect, } from 'react'
import Matter from "matter-js";
import "./spoondrop.css";
import { swapDocBody, useGameState, MAX_HEIGHT, MAX_WIDTH, getSpoon } from './util/spoonHelper';
import { createMatterEngine } from "./util/createMatterEngine";
import { GameShell } from "./util/GameShell";

const SpoonDropGameSpeed = () => {
  const gameKey = "speedClick";
  const flavor = "Endurance test: How many spoons can you drop in 15 seconds?" ;
  const instructions = "Click to drop a spoon in the bucket.";
  const gameState = useGameState(flavor, instructions, gameKey);
  const { canvasRef, setCanvasHeight, restartRef, setPlayButtonText,
    setGameOverState, setMessage, setScoreText, recordScore } = gameState;
  const textElementID = "dropper";
  useEffect(() => swapDocBody(), []);
  useEffect(() => {
    const width = Math.min(window.innerWidth, MAX_WIDTH);
    const height = Math.min(window.innerHeight, MAX_HEIGHT);
    setCanvasHeight(height);
    let Bodies = Matter.Bodies;
    let Composite = Matter.Composite;
    let Mouse = Matter.Mouse;
    let MouseConstraint = Matter.MouseConstraint;
  
    const { engine, render, start, cleanup } = createMatterEngine(canvasRef, width, height);

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
          if(document.getElementById(textElementID) === null){
            clearInterval(timer);
          }
          else{
            seconds--;
            if(seconds>0){
              
                document.getElementById(textElementID).innerText = seconds;
              
            }
            // If the count down is over, write some text
            
            if (seconds < 0 && countingUp === false) {
              countingUp = true;
              let countUp = 0;
              //spoon tally
              var counter = setInterval(function(){
                if(document.getElementById(textElementID) === null){
                  clearInterval(counter);
                }
                else{
                  if(countUp < spoonCount && countingUp){
                    countUp++;
                    document.getElementById(textElementID).innerHTML = countUp;
                  }
                  if(countUp === spoonCount && countingUp){
                    countingUp = false;
                    clearInterval(counter);
                    clearInterval(timer);
                    recordScore(spoonCount);
                    setScoreText(spoonCount + " spoons dropped");
                    setPlayButtonText("Restart")
                    let endMessage = getPopupMessage();
                    setMessage(endMessage);
                    setTimeout(() => {
                      if(document.getElementById(textElementID).innerHTML){
                        document.getElementById(textElementID).innerHTML = "";
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


      var size = width > 800 ? 100 : 50;
      var x = mouse.position.x,
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
      if(document.getElementById(textElementID)){
        document.getElementById(textElementID).innerText = "Time starts with your first spoon.";
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

    start();
    setGameOverState(true); // Show game over screen
  // Cleanup on unmount
    return cleanup;
  }, [canvasRef, restartRef, setCanvasHeight, setGameOverState, setMessage, setPlayButtonText, setScoreText, recordScore]);

  
    return (
      <GameShell gameName="Rescue" canvasRef={canvasRef} gameState={gameState} />
    )
  
}
export default SpoonDropGameSpeed;