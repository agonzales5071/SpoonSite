import React, { useEffect, useRef } from "react";
import Matter from "matter-js";
import './spoondrop.css';
import { Link } from 'react-router-dom';
import { createPlusScore, getRandomInt, getSpoon } from "./util/spoonHelper";

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

    const backgroundColor = '#14151f';

    var gameWidth = width*4/5;
    var marginX = (width-gameWidth)/2;
    var gameHeight = height*4/5;
    var marginY = (height-gameHeight)/2
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
    const lightSideColors = new Map([
      ['yellow', '#ffff00'],
      ['neonGreen', '#b4ff00'],
      ['lime', '#46ff00'],
      ['green', '#00FF00'],
      ['mint', '#00ff3c'],
      ['cyan', '#00ff8c'],
      ['sky', '#008CFF'],
      ['blue', '#0000FF'],
      ['purple', '#7300ff'],
      ['magenta', '#dc00FF']
    ])
    const darkSideColors = new Map([
      ['red', '#ff2727ff'],
      ['bloodOrange', '#ff3c00ff'],
      ])
      
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
    
    var saber = getSpoon(size, spoonStart.x, spoonStart.y, spoonFilter, getRandomLightSideColor(), "bottom");
    saber.label = 'playerSaber'
    saber.isSensor = true;
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
      console.log("colision")
       event.pairs.forEach(pair => {
        saberClash(pair, true);
      });
    });

    const particleCooldown = 4;
    Matter.Events.on(engine, "collisionActive", function(event) {
      event.pairs.forEach(pair => {
        saberClash(pair, false)
      });
    });

    function saberClash(pair, isInitialCollision){
        const { bodyA, bodyB } = pair;
        const bodies = [bodyA, bodyB];
        var collision = pair.collision;

        if (bodyA.parent.label === 'playerSaber' || bodyB.parent.label === 'playerSaber') {
          attacks.forEach(attack => {
            if (attack.hitbox && bodies.includes(attack.hitbox) && collision.supports.length > 0) {
              // ✅ Saber clashed with hitbox
              var collisionPoint = collision.supports[0]; 

              //increment score once
              if(isInitialCollision && !attack.beenHit){
                createPlusScore(attack.initialPosition.x, attack.initialPosition.y-size/2, 100, engine.world, []);
                spawnClashParticles(collisionPoint.x, collisionPoint.y);
                points += 100;
                attack.beenHit = true;
              }

              //spawn particles while collision active
              if(attack.particleTracker && attack.particleTracker % particleCooldown === 0){
                spawnClashParticles(collisionPoint.x, collisionPoint.y);
              }
              attack.particleTracker += 1;
              //removeAttack(attack);
            }
          });
        }
    }

    let particles = [];

    function spawnClashParticles(x, y, count = 4) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 5 + Math.random() * 5;

        const particle = Matter.Bodies.circle(x, y, 2, {
          restitution: 0.6,
          friction: 0.05,
          render: { fillStyle: "white" }
        });

        Matter.Body.setVelocity(particle, {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed
        });

        Composite.add(engine.world, particle);

        // Auto-remove after a short time
        setTimeout(() => Composite.remove(engine.world, particle), 200);
      }
    }
    
    const attackGrowthSpeed = 1.01;
    Matter.Events.on(engine, 'afterUpdate', function() {
      // Apply scaling to the body
      stepAttacks();  
      redrawPlayer();
    });
    function stepAttacks(){
      attacks.forEach(attack => {
        if (attack.size < size) {
          attack.size *= attackGrowthSpeed;
          let oldBody = attack.body;
          let newBody = getSpoon(attack.size, attack.initialPosition.x, attack.initialPosition.y, spoonFilter, darkSideColors.get('bloodOrange'));
          newBody.isSensor = true;
          Composite.add(engine.world, newBody); 
          Composite.remove(engine.world, oldBody);
          attack.body = newBody;
        }
        else{
          startCollisionTimer(attack)
        }
      });
    }
    var collidableAttacks = []; //TODO
    function startCollisionTimer(attack) {
      if (attack.collidable) return; // prevent duplicates
      attack.collidable = true;

      const perfectHitbox = Bodies.circle(
        attack.initialPosition.x,
        attack.initialPosition.y,
        size / 5,
        {
          isSensor: true,
          render: { fillStyle: "rgba(255,255,255,0.5)" },
          collisionFilter: enemyFilter
        }
      );
      attack.hitbox = perfectHitbox;
      Composite.add(engine.world, perfectHitbox);

      // Give the player a limited window to clash
      attack.timeout = setTimeout(() => {
        removeAttack(attack);
      }, 300); // 300ms clash window
    }
    function removeAttack(attack) {
      if (attack.timeout) clearTimeout(attack.timeout);
      if (attack.outer) Composite.remove(engine.world, attack.outer);
      if (attack.inner) Composite.remove(engine.world, attack.inner);
      if (attack.body) Composite.remove(engine.world, attack.body);
      if (attack.hitbox) Composite.remove(engine.world, attack.hitbox);

      attacks = attacks.filter(a => a !== attack);
    }
    Matter.Events.on(engine, "beforeUpdate", (evt) => {
      const dt = evt.delta;
      const target = mouse.position;
      
      if(isMouseDown){
        movePlayerToward(target, dt);
      }
      rotatePlayerToward(target, dt);
    });
    function redrawPlayer(){
      Composite.remove(engine.world, saber);
      Composite.add(engine.world, saber);
    }

    function movePlayerToward(target, dtMs) {
      const current = saber.position;
      const desired = {
        x: target.x - current.x,
        y: target.y - current.y
      };

      const dist = Math.hypot(desired.x, desired.y);
      if (dist < 0.5) return; // small deadzone to stop jitter
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
      const maxAngularSpeedPerSecond = Math.PI * 6; // rad/sec (≈ 3 turns/sec) — tune up/down
      const maxStepThisFrame = maxAngularSpeedPerSecond * (dtMs / 1000);
      if (Math.abs(step) > maxStepThisFrame) step = Math.sign(step) * maxStepThisFrame;

      // apply rotation
      Matter.Body.setAngle(saber, current + step);
    }
    var spawnEnemies;
    var tracker = 0;
    var initialSpeed = 30;
    var speed = initialSpeed;

    function startEnemy(){
      
      const tutEl = document.getElementById("descenttut");
      if (tutEl) tutEl.innerHTML = "";

      spawnEnemies = setInterval(() => {
        if (document.getElementById("dropper") === null) {
          clearInterval(spawnEnemies);
          return;
        }
        //detectDroppedSpoons()
        if(doSpawnCheck()){
          spawnEnemy();
        }
        if(gameStarted){
          //setText();
        }
      }, 100);
    }
        //handles increasing speed of game spawns
    //returns true if spawn should occur
    function doSpawnCheck() {
      let doSpawn = false;
      //speed change for cereal drops
      //after 12 it's close to max speed
      if (tracker % (3 * speed) === 0 && speed > 25) {
        speed = speed - 5;
        tracker = 0;
      }
      //more gradual speed change to top speed
      else if (tracker % (3 * speed) === 0 && speed > 10) {
        speed--;
        tracker = 0;
      }
      if (tracker % speed === 0) {
        doSpawn = true;
      }
      tracker++;
      return doSpawn; 
    }
    var attacks = [];
    function spawnEnemy(){
      const innerFactor = 0.98; //size of inner spoon
      const initialSizeFactor = 0.1;
      let enemyX = Math.random()*gameWidth+marginX;
      let enemyY = Math.random()*gameHeight+marginY;
      let evilOuter = getSpoon(size, enemyX, enemyY, spoonFilter, darkSideColors.get('bloodOrange'));
      let evilInner = getSpoon(size*innerFactor, enemyX, enemyY, spoonFilter, backgroundColor);
      
      Composite.add(engine.world, evilOuter)
      Composite.add(engine.world, evilInner)
      let attack = {
        outer: evilOuter,
        inner: evilInner,
        body: getSpoon(size*initialSizeFactor, enemyX, enemyY, spoonFilter, darkSideColors.get('bloodOrange')), 
        size: initialSizeFactor*size,
        color: darkSideColors.get('bloodOrange'),
        initialPosition: {x: enemyX, y: enemyY},
        collidable: false,
        hitbox: null,
        timeout: null,
        beenHit: false,
        particleTracker: 1
      }
      attacks.push(attack)
      Composite.add(engine.world, attack.body)
      

    }

    function getRandomLightSideColor(){
      const colorValuesArray = [...lightSideColors.values()];
      return colorValuesArray[getRandomInt(colorValuesArray.length)];
    }
    function getRandomDarkSideColor(){
      
    }
        
    function startGame() {
      if (gameStarted === false) {

        gameStarted = true;
        startEnemy();
      }
    }
    function restartGame() {
      if (resettable === true) {
        points = 0;
        resettable = false;
        tracker = 0;
        speed = initialSpeed;
        //removes spoons from previous game if applicable
        // if(deadSpoons.length > 0){
        //   deadSpoons.forEach((element) => {
        //     Composite.remove(engine.world, element);
        //   });
        //   deadSpoons.splice(0, deadSpoons.length);
        // }
        startGame();
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