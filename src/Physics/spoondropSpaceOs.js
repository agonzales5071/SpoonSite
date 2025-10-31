import React, { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import './spoondrop.css';
import { Link } from 'react-router-dom';
import GameOver from './util/gameoverPopup.js'
import { createDefined2DVector, getSpoon, getSpoonShip, rotatePlayerToward, spoonFilter } from "./util/spoonHelper.js";

const SpoonshipAsteroid = () => {
  const boxRef = useRef(null);
  const canvasRef = useRef(null);
  const restartRef = useRef(null);
  const [playButtonText, setPlayButtonText] = useState("Play")

  const [gameOverState, setGameOverState] = useState(false);
  const [message, setMessage] = useState("");
  const [scoreText, setScoreText] = useState("");
  
  useEffect( () => {

    var isMobile = false;
    var width = window.innerWidth;
    var height = window.innerHeight;
    let Engine = Matter.Engine;
    let Render = Matter.Render;
    let Runner = Matter.Runner;
    let Bodies = Matter.Bodies;
    let Vector = Matter.Vector;
    let Body = Matter.Body;
    let Composite = Matter.Composite;
    let Mouse = Matter.Mouse;
    let MouseConstraint = Matter.MouseConstraint;
  
    let engine = Engine.create({gravity: {y: 0}});
    let runner = Runner.create({});

    var render = Render.create({
      element: boxRef.current,
      engine: engine,
      canvas: canvasRef.current,
      options: {
        width: window.innerWidth,
        height: window.innerHeight+window.innerHeight,
        wireframes: false
      }
    });

    var gameWidth = width;
    var leftMargin = (width-gameWidth)/2;
    var points = 0;
    var size = 100; //size var for spoon
    var maxThrustForce = 0.04;
    var screenWrapOffset = 50;
    var playerFriction = 0.003;
    var minPowerPercentage = 0.2;
    var powerPercentage = minPowerPercentage;
    var chargeUp = true; 
    //mobile augmentations
    if(width < 800){
      isMobile = true;
      size = 50;
      maxThrustForce = 0.01;
      screenWrapOffset = 25;
    }

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
    let playerShip = getSpoonShip(size, width/2, height/2, spoonFilter, "white")
    playerShip.frictionAir = playerFriction;
    Composite.add(engine.world, playerShip);

    var gameStarted = false;
    var resettable = false;
    var isCharging = false;
    Matter.Events.on(mouseConstraint, "mousedown", function(event) {
      isCharging = true;

    });

    Matter.Events.on(mouseConstraint, "mouseup", function(event){
      isCharging = false;
      applyThrust();
      spaceForce(playerShip)
    });
    Matter.Events.on(engine, "beforeUpdate", (evt) => {
      const dt = evt.delta;
      const target = mouse.position;
      chargeShot();
      
      rotatePlayerToward(target, dt, playerShip, false, true);
      
    });
    Matter.Events.on(engine, "afterUpdate", (evt) => {
      redrawPlayer()
      offScreenCheck();
    });
    
    Matter.Events.on(engine, "collisionStart", function(event) {

    });
    function applyThrust(){
      spaceForce(playerShip, false)
      shootSpoon(playerShip.angle);
    }
    function shootSpoon(angle, shotSize = size/4){
      let shotSpoon = getSpoon(shotSize, playerShip.position.x, playerShip.position.y, spoonFilter, "#FF0000");
      shotSpoon.frictionAir = 0;
      Body.setAngle(shotSpoon, angle + Math.PI);
      Matter.Composite.add(engine.world, shotSpoon);
      spaceForce(shotSpoon, true);
      Body.setAngularVelocity(shotSpoon, 0);
      Body.setAngularSpeed(shotSpoon, 0);
      Body.setAngle(shotSpoon, angle + Math.PI);
      resetCharge();
    }
    function resetCharge(){
      powerPercentage = minPowerPercentage;
      //probably need to delete visualization here
    }
    function chargeShot(){
      console.log("powerPercentage = " + powerPercentage);
      if(isCharging){
        if(chargeUp){
          if(powerPercentage < 1){
            powerPercentage += 0.01;
          }
          else{
            chargeUp = false;
          }
        }
        if(!chargeUp){
          if(powerPercentage > minPowerPercentage){
            powerPercentage -= 0.01;
          }
          else{
            chargeUp = true;
          }
        }
        visualizeCharge();
      }
    }
    function visualizeCharge(){
      //TODO create rectangle on top of spoon

    }
    function spaceForce(body, thruster){
      let angle = body.angle;
      let force = thruster ? maxThrustForce/4 : maxThrustForce;
      Body.applyForce(body, body.position, createDefined2DVector(force, angle));
    }
    function redrawPlayer(){
      Composite.remove(engine.world, playerShip);
      Composite.add(engine.world, playerShip);
    }
    function screenWrapX(body){
      let y = body.position.y;
      let offset = screenWrapOffset - 1;
      let wrapTo = body.position.x < 0 ? width + offset : -offset;
      Composite.remove(engine.world, body);
      Body.setPosition(body, Vector.create(wrapTo, y)) 
    }
    function screenWrapY(body){
      let x = body.position.x;
      let offset = screenWrapOffset - 1;
      let wrapTo = body.position.y < 0 ? height + offset : -offset;
      Composite.remove(engine.world, body);
      Body.setPosition(body, Vector.create(x, wrapTo)) 
    }
    function offScreenCheck(){
      let y = playerShip.position.y;
      let x = playerShip.position.x;
      if(y < -screenWrapOffset || y > height + screenWrapOffset){
        screenWrapY(playerShip);
      }
      if(x < -screenWrapOffset || x > width + screenWrapOffset){
        screenWrapX(playerShip);
      }
    }

    
    function startGame() {
      if (gameStarted === false) {
        setGameOverState(false); // Show game over screen
        gameStarted = true;
        // startEnemy();
      }
    }
    function restartGame(){
      if (resettable === true){
        //cleanup and reset
        resettable = false
        setScoreText(0);            // reset score
      }
    }
    function gameOver() {
      setScoreText(points);
      let endMessage = getPopupMessage()
      setMessage(endMessage)        
      gameStarted = false;
      resettable = true;
      //set text
      //leaderboards
      setTimeout(() => {
        setGameOverState(true); // Show game over screen
      }, 1100)
    }

    function doPointIncrement(spoon, cerealPos) {
      //points+= 10*(spoonState.cerealHits+1);
      //createPlusScore(cerealPos.x, cerealPos.y, spoonState.cerealHits*10)
    }
    function setText() {
      const dropperEl = document.getElementById("dropper");
      //point tracking messages
      if(points >= 2500){
        if (dropperEl) dropperEl.innerHTML = "Whoa! " + points + " points";
      }
      else if(points >= 1000){
        if (dropperEl) dropperEl.innerHTML = "Nice! " + points + " points"; 
      }
      else{
        if (dropperEl) dropperEl.innerHTML = points + " points";
      }
      //if (dropperEl && debug) dropperEl.innerHTML = "Whoa! " + points + " points. Speed = " + speed;
    }
    function getPopupMessage(isStart){
      if(isStart){
        return "context!"
      }
      let message;
      if(points >= 2500){
        message = "great";
      }
      else message = "good";
      return message;
    }
      
    function startRestart(){
      if(!gameStarted && !resettable){startGame()}
      else{
        restartGame();
      }
      setPlayButtonText("Restart")
    }
    restartRef.current = startRestart;

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
    <div className="notscene">
      <div>
          <GameOver message={message} scoreText={scoreText} visible={gameOverState} 
          onRestart={() => restartRef.current()} playButtonText={playButtonText} />
      </div>
      <canvas ref={canvasRef} />
      <Link to="/spoondropMenu">
        <button className='back-button' style={{ display: gameOverState ? "none" : "block" }}/>
      </Link>
      <div id="menutext">
        <p id="dropper">instructions</p>
        <p id="descenttut"className="droppertext">do it!</p>
      </div>
    </div>
  )
  
  
};

export default SpoonshipAsteroid;