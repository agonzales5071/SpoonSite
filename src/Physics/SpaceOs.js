import React, { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import './spoondrop.css';
import { Link } from 'react-router-dom';
import GameOver from './util/gameoverPopup.js'
import {BACKGROUND_COLOR, cosmeticFilter, createDefined2DVector, enemyFilter, getAngleBetweenPos, getExclamationPoint, getLoop, getRandomInt, getSpoon, getSpoonShip, rotatePlayerToward, spoonFilter } from "./util/spoonHelper.js";

const SpoonshipAsteroid = () => {
  const boxRef = useRef(null);
  const canvasRef = useRef(null);
  const restartRef = useRef(null);
  const [playButtonText, setPlayButtonText] = useState("Play")

  const [gameOverState, setGameOverState] = useState(false);
  const [message, setMessage] = useState("You are the pilot of a SpoonShip (trademark pending). tap to shoot, hold to charge.");
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
    var marginV = height/6;
    var marginH = gameWidth/6;
    // var points = 0;
    var size = 50; //size var for spoon
    var maxThrustForce = 0.02;
    var playerScreenWrapOffset = size/2;
    var defaultScreenWrapOffset = 50;
    var playerFriction = 0.003;
    var minPowerPercentage = 0.2;
    var powerPercentage = minPowerPercentage;
    var chargeUp = true; 
    var primaryShipColor = "white";
    var secondaryShipColor = "red";
    var fullChargeColor = "#f14ae3ff"
    var chargeThreshold1 = 0.5;
    var chargeThreshold2 = 0.85;
    var chargeIncrement = 0.01;
    var boundaryLabel = "bounds";
    // const blackHoleLabel = "blackHole"
    var captureHole = null;
    var needProjectileOOBCheck = false;
    var holeOn = false;
    const blackHoleDefaultTimeout = 15;
    //mobile augmentations
    if(width < 800){
      isMobile = true;
      size = 30;
      maxThrustForce = 0.005;
      playerScreenWrapOffset = 15;
    }

    // add mouse control
    var mouse = Mouse.create(render.canvas),
      mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
          stiffness: 0,
          render: {
            visible: false
          },
          isSensor: true
        }
      });
      // --- Keyboard handling lives here too ---
    function handleKey(e) {
      if (e.code === "e"){
        console.log("e pressed")
        spawnAsteroid();
      }
      if (e.code === "Space") {
        spawnAsteroid();
        if(holeOn){
          eraseBlackHoles();
          holeOn = false;
        }
        else{
          summonBlackHole();
          holeOn = true;
        }
      }
    }

    window.addEventListener("keydown", handleKey);

    function createBoundingBox(){
      Composite.add(engine.world, [
        // walls
        Bodies.rectangle(width/2, height+size, width*2, size*2, { 
         isSensor: true, isStatic: true, collisionFilter:enemyFilter, label: boundaryLabel}),
        Bodies.rectangle(width/2, -size, width*2, size*2, { 
         isSensor: true, isStatic: true, collisionFilter:enemyFilter, label: boundaryLabel}),
        Bodies.rectangle(-size, height/2, size*2, height*2, { 
         isSensor: true, isStatic: true, collisionFilter:enemyFilter, label: boundaryLabel}),
        Bodies.rectangle(width+size, 0, size*2, height*2, { 
         isSensor: true, isStatic: true, collisionFilter:enemyFilter, label: boundaryLabel})
      ]);
    }
    createBoundingBox();
    Composite.add(engine.world, mouseConstraint);
    let playerShip = getSpoonShip(size, width/2, height/2, spoonFilter, primaryShipColor, secondaryShipColor)
    playerShip.frictionAir = playerFriction;
    Composite.add(engine.world, playerShip);
    let playerCaptureTimer = 0;
    const captureTime = 1000; // ms player must stay inside to be captured
    let playerCaptured = false;
    var gameStarted = false;
    var resettable = false;
    var isCharging = false;
    var projectiles = [];
    var asteroids = [];
    Matter.Events.on(mouseConstraint, "mousedown", function(event) {
      isCharging = true;
    });

    Matter.Events.on(mouseConstraint, "mouseup", function(event){
      isCharging = false;
      applyThrust();
      // asteroids.forEach(asteroid => {
      //   explodeAsteroid(asteroid);
      // });
    });
    Matter.Events.on(engine, "beforeUpdate", (evt) => {
      const dt = evt.delta;  // ms between frames
      const target = mouse.position;
      chargeShot();
      activeBlackHoles.forEach(hole => {
        gravitationalPull(hole);
        doCaptureLogic(hole, dt)
      });
      if(captureHole){
        stickToHole(captureHole.body);
      }
      else if (playerCaptured){
        releasePlayer()
      }
      rotatePlayerToward(target, dt, playerShip, false, true);
      
    });
    Matter.Events.on(engine, "afterUpdate", (evt) => {
      redrawPlayer();
      offScreenCheck(playerShip, playerScreenWrapOffset);
      if(needProjectileOOBCheck){
        offScreenCheckProjectiles();
      }
      offScreenCheckAsteroids();
    });
    
    Matter.Events.on(engine, "collisionStart", function(event) {
      event.pairs.forEach(pair => {
        collisionLogic(pair, true);
      });
    });
    Matter.Events.on(engine, "collisionEnd", function(event) {
      event.pairs.forEach(pair => {
        collisionLogic(pair, false);
      });
    });
    function collisionLogic(pair, isStart){
      var { bodyA, bodyB } = pair;
      bodyA = bodyA.parent;
      bodyB = bodyB.parent;
      if(bodyA.label.includes("bounds")){ boundaryCheck(bodyA, bodyB, isStart)}
      else if(bodyB.label.includes("bounds")){ boundaryCheck(bodyB, bodyA, isStart)}
      else if(!isStart){return;}
      //TODO Asteroid hit by projectile code. make unique identifiers for asteroids that will be given to it's children so that one asteroid can only be
      if(bodyA.label.includes("asteroid")){ hitAsteroid(bodyA, bodyB)}
      else if(bodyB.label.includes("asteroid")){ hitAsteroid(bodyB, bodyA)}
      //hit by a single shot once 
    }
    function boundaryCheck(bounds, otherBody, isStart){
      //projectile met bounds so we check if it can wrap or destroy it
      projectiles.forEach( p => {
        if(p.body && p.body === otherBody.parent){
          if(p.isLive === true && isStart){
            p.isOOB = true;
            needProjectileOOBCheck = true;
          }
          if(p.isLive && !isStart){
            //projectile is coming back into gameview
            p.isOOB = false;
          }
        }
      });
      //may need to do same for asteroids
    }

    function hitAsteroid(asteroid, otherBody){
      if(otherBody.parent === playerShip){
        gameOver();
        //deathAnimation()
        explodeAsteroid(asteroid)

      }
      projectiles.forEach( p => {
        if(p.body && p.body === otherBody.parent){
          if(checkIfVulnerable(asteroid, otherBody)){
            explodeAsteroid(asteroid);
            demoteProjectile(p);
          }
        }
      });
    }
    function checkIfVulnerable(asteroid){
      let vulnerable = !asteroid.hasBeenHit;
      if(vulnerable){
        asteroid.hasBeenHit = true;
      }
      return vulnerable;
    }
    function checkPlayerInHole(player, holeObject) {
      let holeBody = holeObject.body;
      const dx = player.position.x - holeBody.position.x;
      const dy = player.position.y - holeBody.position.y;
      const dist = Math.sqrt(dx*dx + dy*dy);

      const pullRadius = holeBody.circleRadius * 3; // tune as needed

      return dist < pullRadius;
    }
    function doCaptureLogic(holeObject, dt){
      const inHole = checkPlayerInHole(playerShip, holeObject);
      //reset hole shrink
      
      if (!playerCaptured) {
        if (inHole) {
          playerCaptureTimer += dt;

          if (playerCaptureTimer >= captureTime) {
            capturePlayer(playerShip, holeObject);
          }
        } else {
          playerCaptureTimer = 0; // reset if they leave
        }
      }
    }
    
    function capturePlayer(player, holeObject) {
      playerCaptured = true;
      Body.setVelocity(player, { x: 0, y: 0 });
      captureHole = holeObject;
      if(holeObject.shrinking){
        resetShrinkCosmetics(holeObject);
      }
    }

    function stickToHole(holeBody) {
      if (playerCaptured) {
        const dx = holeBody.position.x - playerShip.position.x;
        const dy = holeBody.position.y - playerShip.position.y;
        Body.translate(playerShip, {x: dx,y: dy})
      }
    }
    function releasePlayer() {
      playerCaptured = false;
      playerCaptureTimer = 0;
    }

    function demoteProjectile(p){
      if(p.pierceLeft > 0){
        p.pierceLeft = p.pierceLeft - 1;
      }
      else{destroyProjectile(p)}
    }

    function destroyProjectile(p, i = 0){
      Composite.remove(engine.world, p.body);
      if(p.deleteTimeout){
        clearTimeout(p.deleteTimeout)
      }
      projectiles.splice(i, 1);
    }
    function applyThrust(){
      if(!playerCaptured){
        spaceForce(playerShip, false)
      }
      shootSpoon(playerShip.angle);
    }
    function shootSpoon(angle, shotSize = size/6){
      shotSize = powerPercentage < chargeThreshold1 ? size/4 : powerPercentage < chargeThreshold2 ? size/3 : size/2
      let shotCharge = powerPercentage < chargeThreshold1 ? "NoCharge" : powerPercentage < chargeThreshold2 ? "HalfCharge" : "FullCharge"
      let color = powerPercentage > chargeThreshold2 ? fullChargeColor : secondaryShipColor
      let shotSpoon = getSpoon(shotSize, playerShip.position.x, playerShip.position.y, spoonFilter, color);
      shotSpoon.label = "projectile" + shotCharge;
      shotSpoon.frictionAir = 0;
      Body.setAngle(shotSpoon, angle + Math.PI);
      Matter.Composite.add(engine.world, shotSpoon);
      Body.setAngularVelocity(shotSpoon, 0);
      Body.setAngularSpeed(shotSpoon, 0);
      let projectile = createProjectile(shotSpoon, shotCharge);
      projectile.angle = angle + Math.PI;
      spaceForce(shotSpoon, true, projectile.escapeBoosted);
      resetCharge();
    }
    function createProjectile(body, charge){
      let loopsLeft = charge === "FullCharge" ? 1 : 0;
      let pierceLeft = !(charge === "NoCharge") ? 2 : 0;
      if(charge === "HalfCharge"){
        pierceLeft = 1;
      }
      let projectile = {
        body: body,
        charge: charge,
        loopsLeft: loopsLeft,
        pierceLeft: pierceLeft,
        deletable: false,
        isLive: true,
        isOOB: false,
        escapeBoosted: playerCaptured,
        deleteTimeout: null
      };
      projectile.deleteTimeout = setTimeout(() => {
        destroyProjectile(projectile);
      }, 10000);
      projectiles.push(projectile);
      return projectile;
    }
    function resetCharge(){
      powerPercentage = minPowerPercentage;
      visualizeCharge();
    }
    function chargeShot(){
      if(isCharging){
        if(chargeUp){
          if(powerPercentage < 1){
            powerPercentage += chargeIncrement;
          }
          else{
            chargeUp = false;
          }
        }
        if(!chargeUp){
          if(powerPercentage > minPowerPercentage){
            powerPercentage -= chargeIncrement;
          }
          else{
            chargeUp = true;
          }
        }
        visualizeCharge();
      }
    }

    function visualizeCharge() {
      const thresholds = {
        c1: [minPowerPercentage, secondaryShipColor],
        c2: [chargeThreshold1, secondaryShipColor],
        c3: [chargeThreshold2, fullChargeColor]
      };

      playerShip.parts.forEach(p => {
        if (thresholds[p.label]) {
          const [limit, color] = thresholds[p.label];
          p.render.fillStyle =
            powerPercentage > limit ? color : primaryShipColor;
        }
      });
    }

    function spaceForce(body, isThruster, escapeBoosted = false){
      let angle = body.angle;
      let force = isThruster ? maxThrustForce/2 : maxThrustForce;
      force = escapeBoosted ? force/2 : force;
      force *= powerPercentage;
      Body.applyForce(body, body.position, createDefined2DVector(force, angle));
    }
    function redrawPlayer(){
      Composite.remove(engine.world, playerShip);
      Composite.add(engine.world, playerShip);
    }
    function screenWrapX(body, screenWrapOffset){
      let y = body.position.y;
      let offset = screenWrapOffset - 1;
      let wrapTo = body.position.x < 0 ? width + offset : -offset;
      Composite.remove(engine.world, body);
      Body.setPosition(body, Vector.create(wrapTo, y));
      Composite.add(engine.world, body); 
    }
    function screenWrapY(body, screenWrapOffset){
      let x = body.position.x;
      let offset = screenWrapOffset - 1;
      let wrapTo = body.position.y < 0 ? height + offset : -offset;
      Composite.remove(engine.world, body);
      Body.setPosition(body, Vector.create(x, wrapTo));
      Composite.add(engine.world, body); 
    }
    function offScreenCheck(body, screenWrapOffset){
      let y = body.position.y;
      let x = body.position.x;
      if(y < -screenWrapOffset || y > height + screenWrapOffset){
        screenWrapY(body, screenWrapOffset);
      }
      if(x < -screenWrapOffset || x > width + screenWrapOffset){
        screenWrapX(body, screenWrapOffset);
      }
    }
    function offScreenCheckAsteroids(){
      for(let i = 0; i < asteroids.length; i++){
        offScreenCheck(asteroids[i], defaultScreenWrapOffset);
      }
    }
    //handles all projectile deletes via p.deletable
    //hands off to screenwrap function
    function offScreenCheckProjectiles(){
      let checkStillNeeded = false;
      for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        if(p.deletable){
          destroyProjectile(p, i);
        }
        else if(p.isOOB){
          checkStillNeeded = true;
          if(offScreenCheckProjectile(p, defaultScreenWrapOffset/4)){
            destroyProjectile(p, i);
          }
        }
      }
      needProjectileOOBCheck = checkStillNeeded;
    }
    //returns true if wrap happened
    function offScreenCheckProjectile(projectile, screenWrapOffset){
      let body = projectile.body;
      let y = body.position.y;
      let x = body.position.x;
      let needsDelete = false;
      if(y < -screenWrapOffset || y > height + screenWrapOffset){
        if(projectile.loopsLeft > 0){
          screenWrapY(body, screenWrapOffset);
          projectile.loopsLeft -= 1;
        }
        else{needsDelete = true;}
      }
      if(x < -screenWrapOffset || x > width + screenWrapOffset){
        if(projectile.loopsLeft > 0){
          screenWrapX(body, screenWrapOffset);
          projectile.loopsLeft -= 1;
        }
        else{needsDelete = true;}
      }
      return needsDelete;
    }
    var activeBlackHoles = [];
    var pendingBlackHoles = [];
    function clearPendingBlackHoles(){
      pendingBlackHoles.forEach(ph => {
        Composite.remove(engine.world, ph.body);
        clearTimeout(ph.timeout);
        clearInterval(ph.flashInterval)
      });
    }

    function summonBlackHole(){
      let warningTime = 2000
      let x = Math.random()*(width-2*marginH)+marginH;
      let y = Math.random()*(height-2*marginV)+marginV;
      // warning
      let warningBody = getExclamationPoint(x, y, size/4);
      let warningObject = {body: warningBody, timeout: null, flashInterval: null, hidden: false}
      Composite.add(engine.world, warningBody);
      warningObject.flashInterval = setInterval(() => {
        if(warningObject.hidden){
          Composite.add(engine.world, warningBody);
          warningObject.hidden = false;
        }
        else{
          Composite.remove(engine.world, warningBody);
          warningObject.hidden = true;
        }
      }, 300);
      warningObject.timeout = setTimeout(() => {
        pendingBlackHoles.splice(0, 1);
        clearInterval(warningObject.flashInterval);
        Composite.remove(engine.world, warningBody);
        createHoleObject(x, y);
      }, warningTime);
      pendingBlackHoles.push(warningObject);
    }
    function createHoleObject(x, y){
      let col = {category: 0x0002, group: 1}
      let holeBody = Bodies.circle(x, y, size/2, 
        {isSensor: true, render:{fillStyle: BACKGROUND_COLOR}, density: 10, label: "blackHole", collisionFilter: col});
      let holeOutline = Bodies.circle(x, y, size/2 + size/16, 
        {isSensor: true, render:{fillStyle: "white"}});
      let shrinker = Bodies.circle(x, y, size/2, 
        {isSensor: true, render:{fillStyle: "black"}});
      let holeObject = {body: holeBody, outline: holeOutline, shrinkBody: shrinker, particleSpawn: null, 
        lifeTimer: blackHoleDefaultTimeout, deleteInterval: null, captureReset: false, shrinking: false, shrinkInterval: null, shrinkTracker: Math.PI/2};
      holeObject.deleteInterval = setInterval(() => {
        console.log("hole life: " + holeObject.lifeTimer)
        if(captureHole === holeObject && !holeObject.captureReset){
          holeObject.captureReset = true;
          holeObject.lifeTimer = blackHoleDefaultTimeout;
        }
        if(holeObject.lifeTimer > 0){
          if(holeObject.lifeTimer === 1){
            shrinkHole(holeObject);
          }
          holeObject.lifeTimer -= 1;
        }
        else{
          clearInterval(holeObject.deleteInterval);
          blackHoleTimeout(holeObject);
        }
      }, 1000);
      activeBlackHoles.push(holeObject);
      Composite.add(engine.world, holeObject.body);
      Composite.add(engine.world, holeObject.outline);
      Composite.add(engine.world, shrinker);
      holeObject.particleSpawn = setInterval(() => {
        spawnGravParticles(x, y);
      }, 100);
    }

    function shrinkHole(h){
      // h.cover.render.fillStyle = "white";
      let interval = 10;
      h.shrinking = true;
      h.shrinkInterval = setInterval(() => {
      let newSize = Math.abs(Math.sin(h.shrinkTracker)*size);
      let scale = newSize/size;
      h.shrinkTracker += Math.PI/(10000/interval)
      Body.scale(h.shrinkBody, scale, scale);
      Body.scale(h.outline, scale, scale);
      }, interval);
    }

    function resetShrinkCosmetics(holeObject){
      // holeObject.cover.render.fillStyle = "#FFFFFF00"
      holeObject.shrinking = false;
      clearInterval(holeObject.shrinkInterval);
      Composite.remove(engine.world, holeObject.shrinkBody);
      Composite.remove(engine.world, holeObject.outline);
      let shrinker = Bodies.circle(holeObject.body.position.x, holeObject.body.position.y, size/2, 
        {isSensor: true, render:{fillStyle: "black"}});
      let holeOutline = Bodies.circle(holeObject.body.position.x, holeObject.body.position.y, size/2 + size/16, 
        {isSensor: true, render:{fillStyle: "white"}});
      holeObject.shrinkBody = shrinker;
      holeObject.outline = holeOutline;
      Composite.add(engine.world, holeObject.outline);
      Composite.add(engine.world, holeObject.shrinkBody);
    }

    function eraseBlackHole(h){
      Composite.remove(engine.world, h.body);
      Composite.remove(engine.world, h.outline);
      Composite.remove(engine.world, h.shrinkBody);
      clearInterval(h.particleSpawn);
      clearInterval(h.shrinkInterval);
    }
    //clears all black holes
    function eraseBlackHoles(){
      activeBlackHoles.forEach(h => {
        eraseBlackHole(h);
        if(h.deleteInterval){
          clearInterval(h.deleteInterval)
        }
      });
      activeBlackHoles.splice(0, activeBlackHoles.length);
      captureHole = null;
      clearPendingBlackHoles();
    }
    //clears single black hole
    function blackHoleTimeout(holeObject){
      eraseBlackHole(holeObject);
      activeBlackHoles.splice(0, activeBlackHoles.length);
      if(holeObject === captureHole){
        captureHole = null;
        releasePlayer();
      }
    }
    function gravitationalPull(holeObject) {
      if(!playerCaptured){
        doGravity(holeObject.body, playerShip, 0.0003);
      }
      projectiles.forEach(p => {
        if(p.body && !p.escapeBoosted){
          doGravity(holeObject.body, p.body)
        }
      });
      asteroids.forEach(a => {doGravity(holeObject.body, a)});
    }
    function doGravity(holeBody, body, G = 0.0005){
      const dx = holeBody.position.x - body.position.x;
      const dy = holeBody.position.y - body.position.y;

      const distSq = dx * dx + dy * dy;
      let dist = Math.sqrt(distSq);
      
      // Prevent divide-by-zero or infinite accelerations
      const minDist = size; 
      if (dist < minDist) return;
      

      // Force magnitude
      const forceMag = G * (body.mass * holeBody.mass) / distSq;
      
      // Normalize direction
      const fx = (dx / dist) * forceMag;
      const fy = (dy / dist) * forceMag;

      Body.applyForce(body, body.position, { x: fx, y: fy });
    }

    function spawnGravParticles(x, y, count = 1) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        let baseSpeed = 1.5;
        const speed = isMobile ? (baseSpeed/2 + Math.random() * baseSpeed/2) : (baseSpeed + Math.random() * baseSpeed);
        let radius  = isMobile ? 1.5 : 2
        let spawnDistance = isMobile ? 25 + 5*Math.random() : 50 + 10*Math.random() 
        const particle = Matter.Bodies.circle(x + Math.cos(angle)*spawnDistance, 
          y + Math.sin(angle)*spawnDistance, radius, {
            isSensor: true,
            restitution: 0.6,
            friction: 0.05,
            render: { fillStyle: "white" }
          });

        Matter.Body.setVelocity(particle, {
          x: -1 * Math.cos(angle) * speed,
          y: -1 * (Math.sin(angle) * speed) 
        });

        Composite.add(engine.world, particle);

        // Auto-remove after a short time
        setTimeout(() => Composite.remove(engine.world, particle), 250);
      }
    }
    function spawnAsteroid(){
      let side = getRandomInt(4);
      let x;
      let y;
      let mult = Math.random()/10
      if(side % 2 === 0) {// top or bottom
        x = gameWidth*Math.random();
        y = mult*height
        if(side > 0){
          y = height - height*mult
        }
      }
      else {//sides
        y = height*Math.random();
        x = mult*gameWidth;
        if(side > 1){
          x = gameWidth - mult*gameWidth
        }
      }
      let asteroid = getLoop(x, y, enemyFilter, size, 0, 1, true, false, true, null, "asteroid");
      
      asteroid.level = 3;
      Composite.add(engine.world, asteroid);
      asteroids.push(asteroid);
      pushAsteroid(asteroid);
    }
    function spawnAsteroidChild(asteroid, moveAngle){
      let childSize = asteroid.level > 2 ? size*2/3 : size/3;
      let child  = getLoop(asteroid.position.x, asteroid.position.y, enemyFilter, childSize, 0, 1, false, false, true, asteroid.color, "asteroid");
      child.level = asteroid.level - 1;
      Composite.add(engine.world, child);
      asteroids.push(child);
      pushAsteroid(child, moveAngle);
    }

    function pushAsteroid(asteroid, moveAngle = null){
      if(moveAngle === null){
        let destination = getAsteroidDestination();
        moveAngle = getAngleBetweenPos(destination, asteroid.position)-Math.PI/2;
        asteroid.angle = moveAngle;
      }
      else{
        asteroid.angle = moveAngle;
      }
      let baseForce = isMobile ? 3 : 10;
      baseForce *= asteroid.level; 
      let force = baseForce + baseForce*Math.random()
      Body.applyForce(asteroid, asteroid.position, createDefined2DVector(force, moveAngle));
    }

    function getAsteroidDestination()
    {
      let possibleW = 1/3*width;
      let possibleH = 1/3*height;
      let marginX = (width-possibleW)/2
      let marginY = (height-possibleH)/2
      let destinationPos = {x: marginX + possibleW*Math.random(), y: marginY + possibleH*Math.random()};
      return destinationPos;
    }

    function explodeAsteroid(asteroid){
      let childCount = 0;
      spawnCrumbBurst(asteroid)
      Composite.remove(engine.world, asteroid);
      asteroids.splice(asteroids.indexOf(asteroid), 1);
      if(asteroid.level > 1){
        childCount = 2 + getRandomInt(asteroid.level);
      }
      for(let i = 0; i < childCount; i++){
        let angleSelector = getRandomInt(4)
        let angle = angleSelector > 0 ? asteroid.angle + Math.random()*Math.PI*2/3 - Math.PI/3 : Math.random()*Math.PI*2;
        spawnAsteroidChild(asteroid, angle);
      }
    }

    function spawnCrumbBurst(asteroid) {
      const { x, y } = asteroid.position;
      const radius =  20;
      const color = asteroid.color;
    
      const crumbCount = getRandomInt(8) + 8;
      for (let i = 0; i < crumbCount; i++) {
        const angle = (i / crumbCount) * Math.PI * 2;
        const offsetX = Math.cos(angle) * radius;
        const offsetY = Math.sin(angle) * radius;
    
        // Random size between 2 and 4
        const crumbRadius = 2 + Math.random() * 2;
        const crumbDensity = 0.12 + 0.04*Math.random() - crumbRadius*0.025
        const crumb = Bodies.circle(x + offsetX, y + offsetY, crumbRadius, {
          isSensor: true,
          frictionAir: .03,
          density: crumbDensity,
          render: {
            fillStyle: color,
            opacity: 1,
          },
          collisionFilter: cosmeticFilter,
        });
    
        crumb.fadeTime = 0;
        
        // Random fade duration between 800–1200ms
        crumb.fadeDuration = 1600 + Math.random() * 800;
        crumb.fadeInterval = setInterval(() => {
          if(crumb.fadeTime >= crumb.fadeDuration){
            Composite.remove(engine.world, crumb);
            clearInterval(crumb.fadeInterval);
          }
          let newOpacity = (crumb.fadeDuration - crumb.fadeTime) / crumb.fadeDuration;
          crumb.render.opacity = newOpacity;
          crumb.fadeTime += 100;
        }, 100);
        Composite.add(engine.world, crumb);
        let randomForce = isMobile ? 0.005 : 0.025;
        randomForce = randomForce/2 + Math.random()*randomForce;
        Body.applyForce(crumb, crumb.position, createDefined2DVector(randomForce, angle + Math.PI/2))
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
        asteroids.forEach(asteroid => {
          Composite.remove(engine.world, asteroid)
        });
        asteroids.splice(0, asteroids.length);
        projectiles.forEach(projectile => {
          Composite.remove(engine.world, projectile);
        })
        projectiles.splice(0, projectiles.length);
        eraseBlackHoles()

        resettable = false
        setScoreText(0);            // reset score
        setMessage("")
      }
    }
    function gameOver() {
      // setScoreText(points);
      // let endMessage = getPopupMessage()
      // setMessage(endMessage)        
      gameStarted = false;
      resettable = true;
      //set text
      //leaderboards
      setTimeout(() => {
        setGameOverState(true); // Show game over screen
      }, 1100)
    }

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
    }
    restartRef.current = startRestart;

    Runner.run(runner, engine)
    Render.run(render);
    setGameOverState(true); // Show game over screen
  // Cleanup on unmount
    return () => {
      Render.stop(render);
      Runner.stop(runner);
      window.removeEventListener("keydown", handleKey);
      clearPendingBlackHoles();
      eraseBlackHoles();
      projectiles.forEach(p => {
        clearTimeout(p.deleteTimeout);
      })
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
      <Link to="/games">
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