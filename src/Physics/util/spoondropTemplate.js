import React, { useEffect, useRef } from "react";
import Matter from "matter-js";
import './spoondrop.css';
import { Link } from 'react-router-dom';

const SpoonDropTemplate = () => {
  const boxRef = useRef(null);
  const canvasRef = useRef(null);
  
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

    var gameWidth = width;
    var leftMargin = (width-gameWidth)/2;
    var points = 0;
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
    

    var gameStarted = false;
    var resettable = false;

    Matter.Events.on(mouseConstraint, "mousedown", function(event) {
      restartGame();
      resettable = false;
      startGame();      
    });

    Matter.Events.on(mouseConstraint, "mouseup", function(event){
      
    });
    
    Matter.Events.on(engine, "collisionStart", function(event) {

    });

    
    function startGame() {
    }
    function restartGame(){
      if (resettable === true){
        //cleanup and reset
      }
    }
    function gameOver() {
      gameStarted = false;
      resettable = true;
      //set text
      //leaderboards
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

    Runner.run(runner, engine)
    Render.run(render);
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
      <canvas ref={canvasRef} />
      <Link to="/spoondropMenu"><button className='back-button' onClick={console.log("button pressed")}></button></Link>
      <div id="menutext">
        <p id="dropper">instructions</p>
        <p id="descenttut"className="droppertext">do it!</p>
      </div>
    </div>
  )
  
  
};

export default SpoonDropTemplate;