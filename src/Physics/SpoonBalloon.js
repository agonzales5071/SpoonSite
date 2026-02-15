import React, { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import './spoondrop.css';
import GameOver from "./util/gameoverPopup";
import { Link } from 'react-router-dom';
import { spoonFilter, getSpoonBalloon, getRandomInt, getAngleBetween, createDefined2DVector } from "./util/spoonHelper";

const SpoonBalloon = () => {
  const boxRef = useRef(null);
  const canvasRef = useRef(null);
  const restartRef = useRef(null);
  const [playButtonText, setPlayButtonText] = useState("Play")

  const [gameOverState, setGameOverState] = useState(false);
  const [message, setMessage] = useState("if the balloon touches the ground you die (death not implemented yet).");
  const [scoreText, setScoreText] = useState("Tap to bump balloon, hold to blow.");
  
  useEffect( () => {

    var isMobile = false;
    var width = window.innerWidth;
    var height = window.innerHeight;
    let Engine = Matter.Engine;
    let Render = Matter.Render;
    let Runner = Matter.Runner;
    let Bodies = Matter.Bodies;
    let Body = Matter.Body;
    let Composite = Matter.Composite;
    let Mouse = Matter.Mouse;
    let MouseConstraint = Matter.MouseConstraint;
  
    let engine = Engine.create({});
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

    // var gameWidth = width;
    // var leftMargin = (width-gameWidth)/2;
    // var points = 0;
    var size = 100; //size var for spoon
    //mobile augmentations
    if(width < 800){
      isMobile = true;
      size = 50;
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
    var player = getSpoonBalloon(size, width/2, height/2, spoonFilter, "silver");
    // player.isSleeping = true;
    Composite.add(engine.world, player);
    

    var gameStarted = false;
    var resettable = false;
    var isMouseDown = false;
    var blowing = false;
    const maxVelocity = 5

    Matter.Events.on(engine, 'beforeUpdate', function() {
      const g = engine.gravity;
      const gravityForce = g.y * g.scale;
      let gravCancel = gameStarted ? 0.9 : 1;
      // for each balloon spoon
      Body.applyForce(player, player.position, {
        x: 0,
        y: -player.mass * gravityForce * gravCancel
      });
      let blowForce = player.mass * gravityForce * gravCancel / 6;
      let forceVector = createDefined2DVector(blowForce, getAngleBetween(player, mouse) - Math.PI/2)
      if(blowing){
        createHand(player, "#d1d1d15a", 50);
        Body.applyForce(player, player.position, {
        x: forceVector.x,
        y: forceVector.y
      });
      }
      //cap velocity
      if(Math.abs(player.velocity.x) > maxVelocity || Math.abs(player.velocity.y) > maxVelocity){
        let sign = player.velocity.x >= 0 ? 1 : -1
        player.frictionAir = 0.1;
        player.velocity.x = maxVelocity*sign;
        console.log("max x hit")
      }
      else{player.frictionAir = 0.01 }
    });
    var blowingTimeout;
    Matter.Events.on(mouseConstraint, "mousedown", function(event) {
      if(!isMouseDown){
        isMouseDown = true;
        blowingTimeout = setTimeout(() => {blowing = true}, 200)  
      }
    });

    Matter.Events.on(mouseConstraint, "mouseup", function(event){
      isMouseDown = false;
      if(!blowing){
        let bumpForce = isMobile ? 0.02 : 0.1; 
        let forceVector = createDefined2DVector(bumpForce, getAngleBetween(player, mouse) - Math.PI/2)
        applyBump(player, forceVector.x, forceVector.y);
        createHand(player);
      }
      blowing = false;
      clearTimeout(blowingTimeout);
    });
    
    Matter.Events.on(engine, "collisionStart", function(event) {

    });

    function applyBump(player, xForce, yForce){
      Body.applyForce(player, player.position,{
        x: xForce,
        y: yForce
      });
    }
    function createHand(player, color = "#fbd633", timeout = 400){
      let angle = getAngleBetween(player, mouse);
      const handOffset = size*3/5 

      const handX = player.position.x + Math.cos(angle) * handOffset;
      const handY = player.position.y + Math.sin(angle) * handOffset;
      let chamfer = isMobile ? 6 : 10;
      let hand = Bodies.rectangle(handX, handY - size/3,
         size*2/4, size*1/5, {isSensor: true, isStatic: true, render: {fillStyle: color}, chamfer: { radius: chamfer }});
      Body.rotate(hand, angle + Math.PI/2);
      Composite.add(engine.world, hand);
      setTimeout(() => {
        Composite.remove(engine.world, hand);
      }, timeout)
    }

    function initialBump(){
      let xForce = (getRandomInt(10)-4.5)/50//cool variable name
      xForce = isMobile ? xForce/7 : xForce;
      let yForce = isMobile ? -0.015 : -0.08;
      applyBump(player, xForce, yForce)
    }
    
    function startGame() {
      if (gameStarted === false) {
        setGameOverState(false); // Show game over screen
        gameStarted = true;
        initialBump();
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
    // function gameOver() {
    //   setScoreText(points);
    //   let endMessage = getPopupMessage()
    //   setMessage(endMessage)        
    //   gameStarted = false;
    //   resettable = true;
    //   //set text
    //   //leaderboards
    //   setTimeout(() => {
    //     setGameOverState(true); // Show game over screen
    //   }, 1100)
    // }

    // function doPointIncrement(spoon, cerealPos) {
    //   //points+= 10*(spoonState.cerealHits+1);
    //   //createPlusScore(cerealPos.x, cerealPos.y, spoonState.cerealHits*10)
    // }
    // function setText() {
    //   const dropperEl = document.getElementById("dropper");
    //   //point tracking messages
    //   if(points >= 2500){
    //     if (dropperEl) dropperEl.innerHTML = "Whoa! " + points + " points";
    //   }
    //   else if(points >= 1000){
    //     if (dropperEl) dropperEl.innerHTML = "Nice! " + points + " points"; 
    //   }
    //   else{
    //     if (dropperEl) dropperEl.innerHTML = points + " points";
    //   }
    //   //if (dropperEl && debug) dropperEl.innerHTML = "Whoa! " + points + " points. Speed = " + speed;
    // }
    // function getPopupMessage(isStart){
    //   if(isStart){
    //     return "context!"
    //   }
    //   let message;
    //   if(points >= 2500){
    //     message = "great";
    //   }
    //   else message = "good";
    //   return message;
    // }
      
    function startRestart(){
      if(!gameStarted && !resettable){startGame()}
      else{
        restartGame();
      }
      setPlayButtonText("Restart")
      setMessage("")
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

export default SpoonBalloon;