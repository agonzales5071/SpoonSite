import React, { useEffect, useRef } from "react";
import Matter from "matter-js";
import './spoondrop.css';
import { Link } from 'react-router-dom';
import { createPlusScore, getRandomInt, getSpoon, getSpoonWithHilt, getDualSidedSaber, drawHUD, createRandom2DVector } from "./util/spoonHelper";
//TODO: Scoring, double sided dark side saber, hilt, weak hitboxes, lives, add hilt to cosmetic filter
const SpoonSaberBattle = () => {
  const boxRef = useRef(null);
  const canvasRef = useRef(null);
  const hudRef = useRef(null);
  
  useEffect( () => {

    var isMobile = false;
    var width = window.innerWidth;
    var height = window.innerHeight;
    let Engine = Matter.Engine;
    let Render = Matter.Render;
    let Runner = Matter.Runner;
    let Bodies = Matter.Bodies;
    let Body = Matter.Body;
    let Vector = Matter.Vector;
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
    const hudCanvas = hudRef.current;
    if (hudCanvas) {
      hudCanvas.width = window.innerWidth;
      hudCanvas.height = window.innerHeight;
    }

    const backgroundColor = '#14151f';

    var gameWidth = width*4/5;
    var marginX = (width-gameWidth)/2;
    var gameHeight = height*4/5;
    var marginY = (height-gameHeight)/2
    var points = 0;
    var fric = 0.1
    let lives = 3;
    var size = 100; //size var for spoon
    var ragDoll = false;
    var isPlayerDarkSide = window.location.href.includes("DarthPlayer");
    // var isPlayerDarkSide = false;

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
    const CATEGORY_NOTHING = 0x0000;

    const enemyFilter = {
      category: CATEGORY_ENEMY_SPOON,
      mask: CATEGORY_SPOON,
    };

    const cosmeticFilter = {
      mask: CATEGORY_NOTHING
    }

    const spoonFilter = {
      category: CATEGORY_SPOON,
      mask: CATEGORY_ENEMY_SPOON,
    };
    
    //gamevars init
    var gameStarted = false;
    var resettable = false;
    var isMouseDown = false;
    const spoonStart = {
      x: width/2,
      y: height/2
    }
    function selectSide(){
      let mousePos = mouse.position;
      isPlayerDarkSide = mousePos.x > width/2 ? true : false;
    }
    function initializePlayer(){
      Composite.remove(engine.world, saber);
      selectSide()
      ragDoll = false;
      lives = 3;
      playerColor = getRandomSaberColor(isPlayerDarkSide);
      saber = getSpoonWithHilt(size, spoonStart.x, spoonStart.y, spoonFilter, playerColor);
      if(isPlayerDarkSide){saber = getDualSidedSaber(size*4/5, spoonStart.x, spoonStart.y, spoonFilter, playerColor);}
      saber.label = 'playerSaber'
      saber.isSensor = true;
      saber.frictionAir = fric;
      Composite.add(engine.world, saber);
    }
    let playerColor = getRandomSaberColor(isPlayerDarkSide);
    var saber = getSpoonWithHilt(size, spoonStart.x, spoonStart.y, spoonFilter, playerColor);
    if(isPlayerDarkSide){saber = getDualSidedSaber(size*4/5, spoonStart.x, spoonStart.y, spoonFilter, playerColor);}
    saber.label = 'playerSaber'
    saber.isSensor = true;
    saber.frictionAir = fric;
    Composite.add(engine.world, saber);
    // Composite.add(engine.world, saber2);

    Matter.Events.on(mouseConstraint, "mousedown", function(event) {
      if(resettable){restartGame()}
      else if(!gameStarted){startGame()}
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
    let scoreMult = 1;
    let scoreMultGain = 0.1;
    let scorePerfect = 150;
    let scoreWeak = 100;
    if(isPlayerDarkSide){
      scorePerfect *= (2/3);
      scoreWeak *= (2/3)
    }
    function saberClash(pair, isCollisionStart){
        const { bodyA, bodyB } = pair;
        const bodies = [bodyA, bodyB];
        var collision = pair.collision;

        if ((bodyA.parent.label === 'playerSaber' || bodyB.parent.label === 'playerSaber') &&
          (bodyA.label !== 'hilt' && bodyB.label !== 'hilt')) {
          attacks.forEach(attack => {
            if (attack.hitbox && collision.supports.length > 0) {
              // ✅ Saber clashed with hitbox
              var collisionPoint = collision.supports[0]; 
              //increment score once
              handlePoints(isCollisionStart, attack, bodies, collisionPoint)

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
    function getPointsScored(attack, bodies){
      let scoreGain = scoreWeak * scoreMult;
      if(bodies.includes(attack.hitbox)){
        attack.beenPerfectHit = true;
        scoreGain = scorePerfect * scoreMult;
        scoreMult += scoreMultGain;
      }
      return Math.trunc(scoreGain);
    }
    //dark side 2 hit check
    function checkValidHit(attack, bodyA, bodyB){
      let validHit = false;
      if(bodyA.label === "topSpoon" || bodyB.label === "topSpoon"){
        if(!attack.beenHit){
          validHit = true;
          attack.beenHit = true;
        }
      }
      if(bodyA.label === "bottomSpoon" || bodyB.label === "bottomSpoon"){
        if(!attack.beenHitSecondSide){
          validHit = true;
          attack.beenHitSecondSide = true
        }
      }
      return validHit;
    }
    function spawnClashParticles(x, y, count = 4) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = isMobile ? (2.5 + Math.random() * 2.5) : (5 + Math.random() * 5);
        let radius  = isMobile ? 1.5 : 2

        const particle = Matter.Bodies.circle(x, y, radius, {
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
          let newBody = getSpoonWithHilt(attack.size, attack.initialPosition.x, attack.initialPosition.y, cosmeticFilter, attack.color, "middle");
          Body.setAngle(newBody, attack.angle)
          newBody.isStatic = true;
          newBody.isSensor = true;
          Composite.add(engine.world, newBody); 
          Composite.remove(engine.world, oldBody);
          attack.body = newBody;
        }
        else{
          
          if (attack.outer) Composite.remove(engine.world, attack.outer);
          if (attack.inner) Composite.remove(engine.world, attack.inner);
          startCollisionTimer(attack)
        }
      });
    }
    function startCollisionTimer(attack) {
      if (attack.collided) return; // prevent duplicates
      attack.collided = true;

      const perfectHitbox = Bodies.circle(
        attack.initialPosition.x,
        attack.initialPosition.y,
        size / 5,
        {
          isSensor: true,
          render: { fillStyle: "rgba(255, 255, 255, 0.01)" },
          collisionFilter: enemyFilter
        }
      );
      Body.setCentre(perfectHitbox,Vector.create(attack.initialPosition.x, attack.initialPosition.y - size/10), false)
      Body.setAngle(perfectHitbox, attack.angle);
      attack.hitbox = perfectHitbox;
      Composite.add(engine.world, perfectHitbox);
      
      attack.weakHitboxTimeout = setTimeout(() => {
        attack.body.collisionFilter.mask = enemyFilter.mask;
        attack.body.collisionFilter.category = enemyFilter.category;
      }, 50);
      // Give the player a limited window to clash
      attack.timeout = setTimeout(() => {
        removeAttack(attack);
      }, 300); // 300ms clash window
    }
    function removeAttack(attack) {
      if(!attack.beenPerfectHit) {scoreMult = 1; }
      if (attack.timeout) clearTimeout(attack.timeout);
      if (attack.weakHitboxTimeout) clearTimeout(attack.weakHitboxTimeout);
      if (attack.outer) Composite.remove(engine.world, attack.outer);
      if (attack.inner) Composite.remove(engine.world, attack.inner);
      if (attack.body) Composite.remove(engine.world, attack.body);
      if (attack.hitbox) Composite.remove(engine.world, attack.hitbox);
      
      if(gameStarted && !(attack.beenHit || attack.beenHitSecondSide)){
        lives = Math.max(0, lives - 1);
        if(lives <= 0) {
          gameOver();
        }
      }
      attacks = attacks.filter(a => a !== attack);
    }
    Matter.Events.on(engine, "beforeUpdate", (evt) => {
      const dt = evt.delta;
      const target = mouse.position;
      if(!ragDoll){
        if(isMouseDown){
          movePlayerToward(target, dt);
        }
        rotatePlayerToward(target, dt);
      }
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
      let angleAdjustment = isPlayerDarkSide ? 0 : Math.PI/2;
      // desired angle pointing from saber -> target (adjust for your sprite orientation)
      const desired = Math.atan2(target.y - saber.position.y, target.x - saber.position.x) - angleAdjustment;

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
          setText();
        }
      }, 100);
    }
        //handles increasing speed of game spawns
    //returns true if spawn should occur
    function doSpawnCheck() {
      if(!gameStarted){
        return false;
      }
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
    const attackAngleRange = 1.5*Math.PI;
    function spawnEnemy(){
      const innerFactor = 0.98; //size of inner spoon
      const initialSizeFactor = 0.1;
      const color = getRandomSaberColor(!isPlayerDarkSide);
      const angle = Math.random()*attackAngleRange - attackAngleRange/2 
      let enemyX = Math.random()*gameWidth+marginX;
      let enemyY = Math.random()*gameHeight+marginY;
      let evilOuter = getSpoon(size, enemyX, enemyY, cosmeticFilter, color);
      let evilInner = getSpoon(size*innerFactor, enemyX, enemyY, cosmeticFilter, backgroundColor);
      Body.setAngle(evilOuter, angle);
      Body.setAngle(evilInner, angle);
      Composite.add(engine.world, evilOuter)
      Composite.add(engine.world, evilInner)
      let attack = {
        outer: evilOuter,
        inner: evilInner,
        body: getSpoonWithHilt(size*initialSizeFactor, enemyX, enemyY, cosmeticFilter, color), 
        size: initialSizeFactor*size,
        color: color,
        initialPosition: {x: enemyX, y: enemyY},
        collided: false,
        hitbox: null,
        timeout: null,
        weakHitboxTimeout: null,
        beenHit: false,
        beenHitSecondSide: false, //only for dark side dual sided saber
        beenPerfectHit: false,
        particleTracker: 1,
        angle: angle
      }
      attacks.push(attack)
      Composite.add(engine.world, attack.body)
    }

    function getRandomSaberColor(isDarkSide){
      var colorValuesArray = [...lightSideColors.values()];
      if(isDarkSide){
        colorValuesArray = [...darkSideColors.values()];
      }
      return colorValuesArray[getRandomInt(colorValuesArray.length)];
    }
        
    function startGame() {
      if (gameStarted === false) {
        gameStarted = true;
        startEnemy();
      }
    }
    function restartGame() {
      if (resettable === true) {
        initializePlayer();
        points = 0;
        resettable = false;
        tracker = 0;
        speed = initialSpeed;
        startGame();
      }
    }
    function gameOver() {
      gameStarted = false;
      resettable = true;
      deathAnimation();
      attacks.forEach(attack => {
        removeAttack(attack);
      });
      let pointType = isPlayerDarkSide ? " padawans slain" : " points"
      const tutEl = document.getElementById("descenttut");
      if (tutEl) tutEl.innerHTML = "Click or tap to play again. Left for light side, Right for dark.";
      const dropperEl = document.getElementById("dropper");
      if(points >= 2500){
        if (dropperEl) dropperEl.innerHTML = "Heck yeah! " + points + pointType;
      }
      else if (dropperEl) dropperEl.innerHTML = "Good battle. " + points + pointType;
      //leaderboards
    }

    function handlePoints(isCollisionStart, attack, bodies, collisionPoint, color = "#FFFFFF") {
      let bodyA = bodies[0];
      let bodyB = bodies[1];
      if(isPlayerDarkSide){//darkside can hit twice
        if(isCollisionStart && (!attack.beenHit || !attack.beenHitSecondSide)){  
          if(checkValidHit(attack, bodyA, bodyB)){
            let scoreGain = getPointsScored(attack, bodies);
            if(attack.beenPerfectHit){color = "#3df13d"}
            if(scoreMult > 2) {color = "rainbow"}
            let offset = !attack.beenHit || !attack.beenHitSecondSide ? size/10 : size/2;
            createPlusScore(attack.initialPosition.x, attack.initialPosition.y-offset, scoreGain, engine.world, true, color);
            spawnClashParticles(collisionPoint.x, collisionPoint.y);
            points += scoreGain;
          }
        }
      }
      else if(isCollisionStart && !attack.beenHit){
        let scoreGain = getPointsScored(attack, bodies);
        if(attack.beenPerfectHit){color = "#3df13dff"}
        if(scoreMult > 2) {color = "rainbow"}
        createPlusScore(attack.initialPosition.x, attack.initialPosition.y-size/2, scoreGain, engine.world, true, color);
        spawnClashParticles(collisionPoint.x, collisionPoint.y);
        points += scoreGain;
        attack.beenHit = true;
      }
    }
    function deathAnimation(){
      ragDoll = true;
      let magnitude = isMobile ? .15 : 2.5
      let angularVel = isMobile ? Math.random()*80-40 : Math.random()*150-75;
      Body.applyForce(saber, saber.position, createRandom2DVector(magnitude));
      Body.setAngularVelocity(saber, angularVel)
    }

    function setText() {
      const dropperEl = document.getElementById("dropper");
      //point tracking messages
      if(points >= 10000){
        if (dropperEl){
          if(isPlayerDarkSide){
            dropperEl.innerHTML = "Muahaha! " + points + " padawans slain";
          }
          else {
            dropperEl.innerHTML = "Whoa! " + points + " points";
          }
        } 
      }
      else if(points >= 5000){
        if (dropperEl){
          if(isPlayerDarkSide){
            dropperEl.innerHTML = "Very good. " + points + " padawans slain";
          }
          else {
            dropperEl.innerHTML = "Nice! " + points + " points";
          } 
        }
      }
      else{
        if (dropperEl){
          if(isPlayerDarkSide){
            dropperEl.innerHTML = "Do it. " + points + " padawans slain";
          }
          else {
            dropperEl.innerHTML = points + " points";
          } 
        }
      }
      //if (dropperEl && debug) dropperEl.innerHTML = "Whoa! " + points + " points. Speed = " + speed;
    }

    Runner.run(runner, engine)
    Render.run(render);
    drawHUD(() => lives, () => gameStarted, hudRef, () => playerColor);
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
      <canvas ref={hudRef} className="hud" style={{ position: "absolute", top: 0, left: 0, zIndex: 1, pointerEvents: "none" }} />
      <Link to="/spoondropMenu"><button className='back-button' onClick={console.log("button pressed")}></button></Link>
      <div id="menutext">
        <p id="dropper">The sith are attacking!</p>
        <p id="descenttut"className="droppertext">Use your spoon saber to block attacks.</p>
      </div>
    </div>
  )
  
  
};

export default SpoonSaberBattle;