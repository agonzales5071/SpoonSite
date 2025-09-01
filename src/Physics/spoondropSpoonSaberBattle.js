import React, { useEffect, useRef } from "react";
import Matter from "matter-js";
import './spoondrop.css';
import { Link } from 'react-router-dom';
import { createPlusScore, getSpoon } from "./util/spoonHelper";

const SpoonSaberBattle = () => {
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

    var gameWidth = width*4/5;
    var margin = (width-gameWidth)/2;
    var points = 0;
    var fric = 0.1
    var size = 100; //size var for spoon
    //mobile augmentations
    if(width < 800){
      fric = 0.03
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

    //saber colors
    let yellow = "#ffff00",
      neonGreen = "#b4ff00",
      lime = "#46ff00",
      green = "#00FF00",
      mint = "#00ff3c",
      cyan = "#00ff8c",
      sky = "#008CFF",
      blue = "#0000FF",
      purple = "#7300ff",
      magenta = "#dc00FF";
    
    let red = "#ff2727ff",
      bloodOrange = "#ff3c00ff";
      
    const CATEGORY_SPOON = 0x0002;
    const CATEGORY_ENEMY_SPOON = 0x0004;

    const enemyFilter = {
      category: CATEGORY_ENEMY_SPOON,
      mask: CATEGORY_SPOON,
    };

    const spoonFilter = {
      category: CATEGORY_SPOON,
      mask: CATEGORY_ENEMY_SPOON,
    };
    
    //gamevars init
    var gameStarted = false;
    var resettable = false;
    var ragdoll = false;
    var isPlayerMoving = false;
    var isMouseDown = false;
    var allMovements = [];
    var playerMovement;
    const spoonStart = {
      x: width/2,
      y: height/2
    }
    var force = 0.015;
    
    var saber = getSpoon(size, spoonStart.x, spoonStart.y, spoonFilter, neonGreen, "bottom")
    saber.frictionAir = fric;
    Composite.add(engine.world, saber);

    Matter.Events.on(mouseConstraint, "mousedown", function(event) {
      if(!gameStarted){startGame();}
      isMouseDown = true;  
    });

    Matter.Events.on(mouseConstraint, "mouseup", function(event){
      isMouseDown = false;
    });
    
    Matter.Events.on(engine, "collisionStart", function(event) {

    });
    Matter.Events.on(engine, "beforeUpdate", (evt) => {
      const dt = evt.delta;
      const target = mouse.position;

      if(isMouseDown){
        movePlayerToward(target, dt);
      }
      rotatePlayerToward(target, dt);
    });

function movePlayerToward(target, dtMs) {
  const current = saber.position;
  const desired = {
    x: target.x - current.x,
    y: target.y - current.y
  };

  const dist = Math.hypot(desired.x, desired.y);
  if (dist < 0.5) return; // small deadzone to stop jitter

  const speedPerSecond = 5.0; // adjust to taste
  const alpha = 1 - Math.pow(1 - 0.2, dtMs / (1000 / 60)); // ~20% catch-up per frame

  const step = {
    x: desired.x * alpha,
    y: desired.y * alpha
  };

  Matter.Body.translate(saber, step);
}

function rotatePlayerToward(target, dtMs) {
  const current = saber.angle;

  // desired angle pointing from saber -> target (adjust for your sprite orientation)
  const desired = Math.atan2(target.y - saber.position.y, target.x - saber.position.x) - Math.PI / 2;

  // shortest angular difference in [-PI, PI]
  let diff = Math.atan2(Math.sin(desired - current), Math.cos(desired - current));
  const absDiff = Math.abs(diff);

  // --- Dynamic deadzone based on distance to target (pixels) ---
  // When the target is very close to the saber, allow a larger deadzone so small mouse wiggles are ignored.
  const dist = Math.hypot(target.x - saber.position.x, target.y - saber.position.y);
  const maxDistForDeadzone = 180;     // tune: how far "near" counts
  const minDeadzone = 0.006;          // radians (~0.34°) - when target far
  const maxDeadzone = 0.04;           // radians (~2.3°) - when target very near
  const t = Math.max(0, Math.min(1, 1 - dist / maxDistForDeadzone)); // 1 when dist=0, 0 when far
  const deadzone = minDeadzone + (maxDeadzone - minDeadzone) * t;

  // --- Frame-rate aware smoothing ---
  // turningSharpness (0..1) is "how aggressive the easing is" at 60fps.
  const turningSharpness = 0.5; // increase => snappier, decrease => more floaty
  const alpha = 1 - Math.pow(1 - turningSharpness, dtMs / (1000 / 60));

  // adapt alpha slightly by diff magnitude so big turns accelerate a bit
  const adaptFactor = Math.min(1, absDiff / (Math.PI / 24) + 0.1); // scale up when diff > 7.5°
  const effectiveAlpha = alpha * adaptFactor;

  // compute step
  let step;
  if (absDiff < deadzone) {
    // If within deadzone, still *move smoothly* a little toward the goal (no snapping).
    const tinyFactor = 0.05; // very slow glide inside deadzone
    step = diff * tinyFactor;
  } else {
    step = diff * effectiveAlpha;
  }

  // --- Minimum step so tiny diffs keep moving smoothly (prevents "stuck" micro-jitter) ---
  const minStepPerSecond = 0.05; // rad/sec (tune downward for less micro-movement)
  const minStepThisFrame = minStepPerSecond * (dtMs / 1000);
  if (Math.abs(step) < minStepThisFrame && Math.abs(diff) > deadzone) {
    step = Math.sign(diff) * minStepThisFrame;
  }

  // --- Cap max angular speed per frame ---
  const maxAngularSpeedPerSecond = Math.PI * 4; // rad/sec (≈ 2 turns/sec) — tune up/down
  const maxStepThisFrame = maxAngularSpeedPerSecond * (dtMs / 1000);
  if (Math.abs(step) > maxStepThisFrame) step = Math.sign(step) * maxStepThisFrame;

  // apply rotation
  Matter.Body.setAngle(saber, current + step);
}

  function shortest(a, b) {
    return Math.atan2(Math.sin(b - a), Math.cos(b - a));
  }
        
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

export default SpoonSaberBattle;