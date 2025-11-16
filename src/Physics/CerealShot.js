import React, { useEffect, useRef, useState, } from "react";
import Matter from "matter-js";
import './spoondrop.css';
import GameOver from "./util/gameoverPopup";
import { Link } from 'react-router-dom';
import { floatAndFade } from "./util/spoonHelper";

const SpoonDropCerealShot = () => {
  const boxRef = useRef(null);
  const canvasRef = useRef(null);
  const [power, setPower] = useState(0);
  const [charging, setCharging] = useState(false);
  const restartRef = useRef(null);

  const [gameOverState, setGameOverState] = useState(false);
  const [scoreText, setScoreText] = useState(0);
  const [message, setMessage] = useState("");
  const [playButtonText, setPlayButtonText] = useState("Play")
  

  const powerRef = useRef(0);
  const directionRef = useRef(1); // 1 = filling, -1 = draining
  
  
  useEffect(() => {
    let animationId;
  
    function updatePower() {
      if (charging) {
        // Change power between 0 and 1
        powerRef.current += directionRef.current * 0.02;
  
        if (powerRef.current >= 1) {
          powerRef.current = 1;
          directionRef.current = -1;
        } else if (powerRef.current <= 0) {
          powerRef.current = 0;
          directionRef.current = 1;
        }
  
        setPower(powerRef.current);
        animationId = requestAnimationFrame(updatePower);
      }
    }
  
    if (charging) {
      animationId = requestAnimationFrame(updatePower);
    }
  
    return () => cancelAnimationFrame(animationId);
  }, [charging]);


  useEffect(() => {
    const {
      Engine,
      Render,
      Runner,
      Bodies,
      Body,
      Composite,
      Mouse,
      MouseConstraint,
      Vector,
      Events,
    } = Matter;

    const swipeControls = window.location.href.includes("Leo") || window.location.href.includes("leo");

    let activeSpoons = [];
    let cereal = [];
    let crumbParticles = [];
    // var isMobile = false;
    var width = window.innerWidth;
    var height = window.innerHeight;

    let engine = Engine.create({});
    let runner = Runner.create({});

    let render = Render.create({
      element: boxRef.current,
      engine: engine,
      canvas: canvasRef.current,
      options: {
        width: width,
        height: height * 1.5,
        wireframes: false,
      },
    });

    var MAX_FORCE = 0.9;
    const CATEGORY_CANNON = 0x0001;
    const CATEGORY_OTHER = 0x0008;
    const CATEGORY_SPOON = 0x0002;
    const CATEGORY_CEREAL = 0x0004;

    const cerealFilter = {
      category: CATEGORY_CEREAL,
      mask: CATEGORY_SPOON,
    };

    const spoonFilter = {
      category: CATEGORY_SPOON,
      mask: CATEGORY_CEREAL,
    };
    const cannonPivot = { x: width / 2, y: height };
    let mouseDownPos = { x: width / 2, y: height };
    const backgroundColor = '#14151f';
    
    var gameWidth = width*8/10;
    var margin = width/10;
    engine.gravity.y = 0.3;
    var restitutionValue = 0.8;
    var size = 100; // size var for spoon
    var cerealGrav = 0.0006;
    var milkHeight = 30;
    var isMobile = false;
    if (width < 800) {
      isMobile = true;
      milkHeight = 20;
      size = 50;
      gameWidth = width * 8/10;
      margin = width/10;
      MAX_FORCE = 0.2;
      cerealGrav = 0.0022
    } 

    const oatMilkColor = "#fff2d1"
    let loadedSpoon = null;
    let spoonHasBeenShot = false;
    //Barrel for cannon
    const barrelWidth = size;  // base width
    const barrelHeight = size*1.5;
    const barrelSlope = 0.5;  // how much narrower the top is
    
    const cannonBarrel = Bodies.trapezoid(
      width / 2,                   // x: center of circle
      height - barrelHeight / 2,   // y: shift up by half height so base aligns with cannon
      barrelWidth,
      barrelHeight,
      barrelSlope,
      {
        isStatic: true,
        render: {
          fillStyle: "#4f4f4f"
        },
        collisionFilter: {
          category: CATEGORY_CANNON,
          mask: CATEGORY_OTHER, // Don't collide with spoon
        },
      }
    );

    // Shift the center of mass to the base (bottom of the trapezoid)
    Matter.Body.setCentre(cannonBarrel, {
      x: width/2,
      y: height
    }, false);
    // Create semicircle cannon (bottom center, half off screen)
    const cannon = Bodies.circle(width / 2, height, size/2, {
      isStatic: true,
      render: {
        fillStyle: "#4f4f4f"
      },
      collisionFilter: {
        category: CATEGORY_CANNON,
        mask: CATEGORY_OTHER, // Don't collide with spoon
      },
    });
        // Create semicircle cannon (bottom center, half off screen)
    const cannonWheel = Bodies.circle(width / 2, height+size/6, size*2/5, {
      isStatic: true,
      render: {
        fillStyle: "#735200"
      }
    });
    
    const oatMilk = Bodies.rectangle(width/2, height, width*1.5, milkHeight, {
      isStatic: true,
      render: {
        fillStyle: oatMilkColor
      }
    });
    Composite.add(engine.world, oatMilk);
    // Example spoon size
    const spoonRadius = size * 0.25;


    // Position spoon initially behind cannon along barrel direction
    function positionSpoon() {

      if (!loadedSpoon || spoonHasBeenShot) return;

      const angle = cannonBarrel.angle;

      // Calculate barrel tip position relative to cannon pivot
      const tipX = cannonPivot.x + Math.cos(angle - Math.PI / 2) * barrelHeight;
      const tipY = cannonPivot.y + Math.sin(angle - Math.PI / 2) * barrelHeight;

      // This offset should be rotated by cannon angle to stay consistent
      const baseOffset = { x: 0, y: -1 }; // spoon should stick out a little

      // Rotate the offset vector by the cannon angle
      const rotatedOffsetX = 
        baseOffset.x * Math.cos(angle) - baseOffset.y * Math.sin(angle);
      const rotatedOffsetY = 
        baseOffset.x * Math.sin(angle) + baseOffset.y * Math.cos(angle);

      // Final spoon position
      const spoonX = tipX + rotatedOffsetX;
      const spoonY = tipY + rotatedOffsetY;

      Body.setVelocity(loadedSpoon, { x: 0, y: 0 });
      Body.setAngularVelocity(loadedSpoon, 0);
      Body.setPosition(loadedSpoon, {
        x: spoonX,
        y: spoonY,
      });

      Body.setAngle(loadedSpoon, angle);
    }

    //load spoon also reloads cannon
    loadSpoon();

    // Call once to position initially
    positionSpoon();

    // Mouse 
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false },
      },
    });
    Composite.add(engine.world, mouseConstraint);

    let isMouseDown = false;
    let cannonTargetAngle = cannonBarrel.angle; // initialize with current angle
    let prevDX = 0;

    // Point of rotation: center of cannon

    Events.on(mouseConstraint, "mousedown", (event) => {
      if(!isMouseDown){
        mouseDownPos = {x: event.mouse.position.x, y: event.mouse.position.y};
      }
      isMouseDown = true;
      if(!gameStarted && !resettable){startGame()}
      const mousePos = event.mouse.position;

      if(!swipeControls){
        const dx = mousePos.x - cannonPivot.x;
        const dy = mousePos.y - cannonPivot.y;
        cannonTargetAngle = Math.atan2(dy, dx) + Math.PI / 2;
      }
    });
    // On mouse move: update angle if mouse is down
    Events.on(mouseConstraint, "mousemove", (event) => {
      if (!isMouseDown) return;

      const mousePos = event.mouse.position;
      if(swipeControls){
        const dx = mousePos.x - mouseDownPos.x;
        const pivotDir = dx > prevDX ? 1 : -1; 
        var pivotSpeed = Math.abs(dx) - Math.abs(prevDX) > 0.1 ? 0.05 : 0.02
          prevDX = dx;
          const pivotSpeedDampener = isMobile ? 2 : 1; 
          cannonTargetAngle = cannonTargetAngle + pivotDir*pivotSpeed/pivotSpeedDampener;
      }
      else{
        const dx = mousePos.x - cannonPivot.x;
        const dy = mousePos.y - cannonPivot.y;
        cannonTargetAngle = Math.atan2(dy, dx) + Math.PI / 2;
      }
    });


    Events.on(mouseConstraint, "mousedown", () => {
      setCharging(true);
      powerRef.current = 0;
      directionRef.current = 1;
    });
    
    Events.on(mouseConstraint, "mouseup", () => {
      setCharging(false);
      isMouseDown = false;
      
      const charge = powerRef.current; // value between 0 and 1
      const forceMagnitude = charge * MAX_FORCE;
    
      shootSpoon(forceMagnitude); // Your custom launch function
    });
    
    
    
    
    Events.on(engine, "beforeUpdate", (event) => {
      const currentAngle = cannonBarrel.angle;
      const angleDiff = cannonTargetAngle - currentAngle;
      applySnakeMotionToCereal(event.timestamp);
      updateCrumbParticles(event.timestamp)
    
      // Normalize angle difference to shortest path
      const delta =
        Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
    
      // Rotation speed factor (adjust as needed)
      const rotationSpeed = 0.1;
    
      Body.setAngle(cannonBarrel, currentAngle + delta * rotationSpeed);


      if (!spoonHasBeenShot) {
        positionSpoon();
      }
    });
    Events.on(engine, "afterUpdate", () => {
      
      rotateSpoons();
    });

    Events.on(engine, 'collisionStart', function(event) {
      const pairs = event.pairs;
      for (const pair of pairs) {
        const { bodyA, bodyB } = pair;
        // Check if one is a cereal and the other is a spoon
        if(bodyA.parent !== null && bodyB.parent !== null)
        {
          let parentA = bodyA.parent;
          let parentB = bodyB.parent;
          let spoon = null;
          let cerealPos = null;
          if (isCereal(parentA) && isSpoon(parentB)) {
            spoon = parentB;
            cerealPos = parentA.position;
            removeCereal(parentA);
          } else if (isCereal(parentB) && isSpoon(parentA)) {
            spoon = parentA;
            cerealPos = parentB.position;
            removeCereal(parentB);
          }
          if(spoon){
            doPointIncrement(spoon, cerealPos)
          }
        }
      }
    });
    function isCereal(body) {
      return cereal.includes(body); // or use a separate allCereal array if needed
    }
    
    function isSpoon(body) {
      return activeSpoons.some(spoonState => spoonState.spoon === body || spoonState.body === body);
    }
    function removeCereal(body) {
      setTimeout(() => {
        spawnCrumbBurst(body);
        Composite.remove(engine.world, body);
      }, 50);
      // Also remove it from your tracking array
      const index = cereal.indexOf(body);
      if (index !== -1) {
        cereal.splice(index, 1);
      }
    }
    function spawnCrumbBurst(cerealBody) {
      const { x, y } = cerealBody.position;
      const radius = cerealBody.circleRadius || 20;
    
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
          frictionAir: .2,
          density: crumbDensity,
          render: {
            fillStyle: "#edc55f",
            opacity: 1,
          },
          collisionFilter: {
            group: -3,
            category: 8,
            mask: 0,
          },
        });
    
        crumb.snakeTime = 0;
        crumb.spawnTime = performance.now();
    
        // Random fade duration between 800–1200ms
        crumb.fadeDuration = 3200 + Math.random() * 1600;
    
        Composite.add(engine.world, crumb);
        crumbParticles.push(crumb);
      }
    }
    function updateCrumbParticles(timestamp) {
      for (let i = crumbParticles.length - 1; i >= 0; i--) {
        const crumb = crumbParticles[i];
        crumb.snakeTime += 0.1;
    
        const snakeX = Math.sin(crumb.snakeTime * 2) * 0.0015;
    
        Body.applyForce(crumb, crumb.position, {
          x: snakeX,
          y: 0.0008,
        });
    
        const age = timestamp - crumb.spawnTime;
        const fade = Math.max(0, 1 - age / crumb.fadeDuration);
        crumb.render.opacity = fade;
    
        if (age > crumb.fadeDuration) {
          Composite.remove(engine.world, crumb);
          crumbParticles.splice(i, 1);
        }
      }
    }
    
    
    
    // accounts for spoons when game is over
    var deadSpoons = [];

    // Game state vars
    var dropSpoons;
    var points = 0;
    var tracker = 0;
    var initialSpeed = 30;
    var speed = initialSpeed;
    const velocityThresholdPercent = 0.1; 
    // Spawn falling spoons function
    function getRandomInt(max) {
      return Math.floor(Math.random() * max);
    }
    function reflectedAngle(angle) {
      return Math.PI - angle; // Mirror over the horizontal axis
    }
    //imitates top heavy spoon physics
    function rotateSpoons() {
      for (const spoonState of activeSpoons) {
        const { body, hasPeaked, rotating, rotationSpeed } = spoonState;
        spoonState.maxVelocityY = Math.min(body.velocity.y, spoonState.maxVelocityY || 0);
          const vel = body.velocity;
          const threshold = spoonState.maxVelocityY * velocityThresholdPercent;
        
          // Check for apex
          if (!hasPeaked && vel.y >= threshold) {
            spoonState.hasPeaked = true;
            spoonState.startAngle = body.angle;
            spoonState.targetAngle = reflectedAngle(body.angle); // flip over X axis
            spoonState.rotating = true;
          }
        
          if (rotating) {
            spoonState.rotationProgress = Math.min(spoonState.rotationProgress + rotationSpeed, 1);
            const t = easeInOutCubic(spoonState.rotationProgress);
        
            const newAngle = lerpAngle(spoonState.startAngle, spoonState.targetAngle, t);
            Body.setAngle(body, newAngle);
        
            if (spoonState.rotationProgress >= 1) {
            spoonState.rotating = false;
            }
          }
          //updateSpoonRotation(body, performance.now())
      }
    }
    function lerpAngle(a, b, t) {
      // Interpolates between angles, correctly handling wrap-around
      let delta = ((b - a + Math.PI) % (2 * Math.PI)) - Math.PI;
      return a + delta * t;
    }
    
    function easeInOutCubic(t) {
      return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function loadSpoon() {
      // Clean up previous spoon if needed
      if (loadedSpoon) {
        loadedSpoon = null;
      }
    
      
      const barrelAngle = cannonBarrel.angle;
    

      loadedSpoon = getSpoon(spoonRadius, cannonPivot.x)
      spoonHasBeenShot = false;
    
      // Rotate spoon to match cannon
      Body.setAngle(loadedSpoon, barrelAngle);
    
      // Add to world
      Composite.add(engine.world, loadedSpoon);

      // Re-add cannon on top
      Composite.remove(engine.world, cannon);
      Composite.remove(engine.world, cannonBarrel);
      Composite.remove(engine.world, cannonWheel); 
      Composite.add(engine.world, cannon);
      Composite.add(engine.world, cannonBarrel);
      Composite.add(engine.world, cannonWheel); 
    }
    

    function shootSpoon(forceMagnitude) {
      if (!loadedSpoon || spoonHasBeenShot) return;
    
      // Stop spoon position updates BEFORE changing it to dynamic
      spoonHasBeenShot = true;
    
      // Ensure spoon is in correct position at moment of firing
      positionSpoon();
    
    
      // Apply force along cannon angle
      const angle = cannonBarrel.angle;
    
      const forceX = Math.cos(angle - Math.PI / 2) * forceMagnitude;
      const forceY = Math.sin(angle - Math.PI / 2) * forceMagnitude;
    
      Body.applyForce(loadedSpoon, loadedSpoon.position, {
        x: forceX,
        y: forceY,
      });
      const targetAngle = Math.PI - angle;
      let initialVelocityY = Math.min(loadedSpoon.velocity.y, -0.01);
      activeSpoons.push({
        body: loadedSpoon,
        hasPeaked: false,
        targetAngle: targetAngle,
        rotating: false,
        initialVelocityY: initialVelocityY,
        rotationProgress: 0,       // 0 to 1
        rotationSpeed: 0.012,
        cerealHits: 0,
      });

      setTimeout(() => {
        loadSpoon();
      }, 300);

    }
    
    

    function spawnFallingO() {
      let obstacleSize = size * 0.25 + size * Math.random() * 0.05;
      let xposSpawn = gameWidth * Math.random() + margin;
      let fric = isMobile ? 0.08 : 0.05
      
    
      let circleOuter = Bodies.circle(xposSpawn, -obstacleSize, obstacleSize, {
        render: { fillStyle: "#edc55f" },
        collisionFilter: cerealFilter,
        density: cerealGrav,
        frictionAir: fric,
        isSensor: true,
      });
    
      let circleInner = Bodies.circle(xposSpawn, -obstacleSize, obstacleSize / 3, {
        render: { fillStyle: backgroundColor },
        collisionFilter: circleOuter.collisionFilter,
        density: cerealGrav,
        frictionAir: fric,
        isSensor: true,
      });
    
      let cerealO = Body.create({
        parts: [circleOuter, circleInner],
        collisionFilter: circleOuter.collisionFilter,
        density: cerealGrav,
        frictionAir: fric,
        isSensor: true,
      });
    
      // Assign snake movement parameters
      cerealO.snake = {
        amplitude: 0.0015 + Math.random() * 0.001, // control left-right strength
        frequency: 0.005 + Math.random() * 0.005, // how fast it oscillates
        phase: Math.random() * Math.PI * 2,       // random start phase
      };
    
      cereal.push(cerealO);
      Composite.add(engine.world, cerealO);
    }
    function applySnakeMotionToCereal(timestamp) {
      for (const body of cereal) {
        if (!body.snake) continue;
    
        const { amplitude, frequency, phase } = body.snake;
        const t = timestamp || performance.now();
    
        const forceX = Math.sin(t * frequency + phase) * amplitude;
    
        Body.applyForce(body, body.position, { x: forceX, y: 0 });
      }
    }

    //returns a spoon to fall from top of screen
    function getSpoon(spoonSize, xposSpawn){
      let spoonSpawn = [xposSpawn, -100, -(3 * spoonSize) - 100];
      let spoonHeadOffset = spoonSize / 10;
      let spoonDensity = 0.0011;

      //SHAPES
      let partA1 = Bodies.circle(spoonSpawn[0], spoonSpawn[2], spoonSize, {
        restitution: restitutionValue,
        density: spoonDensity,
        render: {fillStyle: "silver"},
        collisionFilter: spoonFilter,
      });
      let partA2 = Bodies.circle(spoonSpawn[0], spoonSpawn[2] - spoonHeadOffset, spoonSize, {
        render: partA1.render,
        density: spoonDensity,
        restitution: restitutionValue,
        collisionFilter: partA1.collisionFilter,
      });
      let partA3 = Bodies.circle(spoonSpawn[0], spoonSpawn[2] - 2 * spoonHeadOffset, spoonSize, {
        render: partA1.render,
        density: spoonDensity,
        restitution: restitutionValue,
        collisionFilter: partA1.collisionFilter,
      });
      let partA4 = Bodies.circle(spoonSpawn[0], spoonSpawn[2] - 3 * spoonHeadOffset, spoonSize, {
        render: partA1.render,
        density: spoonDensity,
        restitution: restitutionValue,
        collisionFilter: partA1.collisionFilter,
      });
      let partB = Bodies.trapezoid(spoonSpawn[0], spoonSpawn[1], spoonSize, spoonSize * 5, 0.4, {
        render: partA1.render,
        density: spoonDensity,
        restitution: restitutionValue,
        collisionFilter: partA1.collisionFilter,
      });

      let spoon = Body.create({
        parts: [partA1, partA2, partA3, partA4, partB],
        restitution: restitutionValue,
        collisionFilter: partA1.collisionFilter,
      });

      Body.setCentre(spoon, Vector.create(spoonSpawn[0], spoonSpawn[1] - spoonSize / 10), false);

      return spoon;
    }

    function detectDroppedSpoons(){
      let droppedSpoons = false;
      cereal.forEach((element) => {
        if (element.position.y > height) {
          droppedSpoons = true;
          createRipple(element.position.x, element.position.y - milkHeight/2);
          Composite.remove(engine.world, element);
        }
      });
      if(droppedSpoons && gameStarted){
        gameOver();
         //deal with spoons so they can fly up and then get deleted
        cereal.forEach((element) => {
          deadSpoons.push(element);
        });
        cereal.splice(0, cereal.length);
      }
    }
    var noFadeScoreParts = [];
    const segmentLength = 12;
    const segmentThickness = 4;
    const digitSegments = {
      '0': ['A', 'B', 'C', 'D', 'E', 'F'],
      '1': ['B', 'C'],
      '2': ['A', 'B', 'G', 'E', 'D'],
      '3': ['A', 'B', 'C', 'D', 'G'],
      '4': ['F', 'G', 'B', 'C'],
      '5': ['A', 'F', 'G', 'C', 'D'],
      '6': ['A', 'F', 'E', 'D', 'C', 'G'],
      '7': ['A', 'B', 'C'],
      '8': ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
      '9': ['A', 'B', 'C', 'D', 'F', 'G'],
    };

    function createSegment(x, y, horizontal, color = "#ffffff") {
      return Matter.Bodies.rectangle(
        x, y,
        horizontal ? segmentLength : segmentThickness,
        horizontal ? segmentThickness : segmentLength,
        {
          isStatic: true,
          render: { fillStyle: color }
        }
      );
    }
    function getDigitBodies(digit, centerX, centerY, color = "#ffffff") {
      const bodies = [];
      if(digit === "0"){
        // "0" digit (a tall rounded rectangle using a circle-ish shape)
        const zeroSize = 14;
        const zeroOuter = Matter.Bodies.circle(centerX-segmentLength*2 + zeroSize*2.5, centerY, zeroSize, {
          isStatic: true,
          render: { fillStyle: color }
        });
      
        const zeroInner = Matter.Bodies.circle(centerX-segmentLength*2 + zeroSize*2.5, centerY, zeroSize/3, {
          isStatic: true,
          render: { fillStyle: backgroundColor } // match background to look like a hole
        });
        bodies.push(zeroOuter, zeroInner);
        noFadeScoreParts.push(zeroInner);
        return bodies;
      }
      const segments = digitSegments[digit];
      if (!segments) return [];
    
      const offset = segmentLength / 2 + 1;
    
      const positions = {
        A: [centerX, centerY - offset * 2, true],
        B: [centerX + offset, centerY - offset, false],
        C: [centerX + offset, centerY + offset, false],
        D: [centerX, centerY + offset * 2, true],
        E: [centerX - offset, centerY + offset, false],
        F: [centerX - offset, centerY - offset, false],
        G: [centerX, centerY, true],
      };
    
      for (const seg of segments) {
        const [x, y, horizontal] = positions[seg];
        bodies.push(createSegment(x, y, horizontal, color));
      }
    
      return bodies;
    }
    

    function createPlusScore(x, y, score, color) {
      const parts = [];
      let isRainbow = color === "rainbow";
      if(isRainbow){
        color = "#FFFFFF"
      }
      // "+" sign
      parts.push(
        Matter.Bodies.rectangle(x, y, 20, 5, {
          isStatic: true,
          render: { fillStyle: color }
        }),
        Matter.Bodies.rectangle(x, y, 5, 20, {
          isStatic: true,
          render: { fillStyle: color }
        })
      );
    
      let offsetX = x + 25;
      const digits = score.toString();
    
      for (const digit of digits) {
        const digitParts = getDigitBodies(digit, offsetX, y, color);
        parts.push(...digitParts);
        offsetX += segmentLength + 10;
      }
    
      const composite = Matter.Body.create({
        parts,
        isStatic: true,
        collisionFilter: { mask: 0 }
      });
    
      floatAndFade(composite, engine.world,  color, isRainbow, noFadeScoreParts)
      Matter.Composite.add(engine.world, composite);
    }
    

    function createRipple(x, y) {
      const ripple = Bodies.rectangle(x, y, size, milkHeight, {
        isStatic: true,
        render: {
          fillStyle: oatMilkColor,
          opacity: 0.8
        },
        collisionFilter: {
          mask: 0, // no collisions
        }
      });
    
      Composite.add(engine.world, ripple);
    
      // Animate it
      let opacity = 0.8;
    
      const interval = setInterval(() => {
        opacity -= 0.03;
    
        // Resize (scale) the body
        Body.scale(ripple, 1.1, 1); // wider only
    
        // Reduce opacity
        ripple.render.opacity = opacity;
    
        if (opacity <= 0) {
          clearInterval(interval);
          Composite.remove(engine.world, ripple);
        }
      }, 50);
    }

    // Game control vars
    var gameStarted = false;
    var resettable = false;

    function restartGame() {
      if (resettable === true) {
        points = 0;
        setScoreText(points);            // reset score
        resettable = false;
        tracker = 0;
        speed = initialSpeed;
        //removes spoons from previous game if applicable
        if(deadSpoons.length > 0){
          deadSpoons.forEach((element) => {
            Composite.remove(engine.world, element);
          });
          deadSpoons.splice(0, deadSpoons.length);
        }
        startGame();
      }
    }
    //TODO: add more messages
    function gameOver() {
      setScoreText(points + " points");
      const dropperEl = document.getElementById("dropper");
      if (dropperEl) dropperEl.innerHTML = "";
      let endMessage = getPopupMessage();
      setMessage(endMessage);        
      gameStarted = false;
      resettable = true;
      clearInterval(dropSpoons);
      setTimeout(() => {
        setGameOverState(true); // Show game over screen
      }, 1100)
    }
    function getPopupMessage(isStart){
      if(isStart){
        return "Somebody is making cereal the wrong way... MILK FIRST. Destroy the cereal and stop this abomination!"
      }
      let message;
      if(points >= 2500){
        message = "You did your best soldier.";
      }
      else message = "The Milkmen won this bowl.";
      return message;
    }

    var debug = false;
    function startGame() {
      if (gameStarted === false) {
        setGameOverState(false); // Show game over screen
        gameStarted = true;
        const tutEl = document.getElementById("descenttut");
        if (tutEl) tutEl.innerHTML = "";

        dropSpoons = setInterval(() => {
          if (document.getElementById("dropper") === null) {
            clearInterval(dropSpoons);
            return;
          }
          detectDroppedSpoons()
          if(doSpawnCheck()){
            spawnFallingO();
          }
          if(gameStarted){
            setText();
          }
        }, 100);
      }
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

    //points should increment halfway through spawn increment
    let maxHits = 12;
    function doPointIncrement(spoon, cerealPos) {
      const spoonState = activeSpoons.find(s => s.body === spoon);
      spoonState.cerealHits++;
      if(spoonState.cerealHits < maxHits){
        points+= 10*(spoonState.cerealHits);
        let color = "#FFFFFF"
        if(spoonState.cerealHits > 2){
          color = "#3df13d"
        }
        if(spoonState.cerealHits > 4){
          color = "rainbow"
        }
        createPlusScore(cerealPos.x, cerealPos.y, spoonState.cerealHits*10, color)
      }
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
      if (dropperEl && debug) dropperEl.innerHTML = "Whoa! " + points + " points. Speed = " + speed;
    }
    function startRestart(){
      if(!gameStarted && !resettable){startGame()}
      else{
        restartGame();
      }
      setPlayButtonText("Restart")
    }
    let startMessage = getPopupMessage(true);
    setMessage(startMessage);
    setScoreText("Tap and hold to charge cannon. Release to shoot.")
    restartRef.current = startRestart;


    // Start Matter runner and renderer
    Runner.run(runner, engine);
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
    <div className="notscene" ref={boxRef}>
      <div>
          <GameOver message={message} scoreText={scoreText} visible={gameOverState} 
          onRestart={() => restartRef.current()} playButtonText={playButtonText} />
      </div>
      <div className="power-bar">
        <div style={{
          width: `${power * 100}%`,
          height: '100%',
          background: 'limegreen',
          transition: charging ? 'none' : 'width 0.2s ease'
        }} />
      </div>
      <canvas ref={canvasRef} />
      <Link to="/games">
        <button className="back-button" 
        style={{ display: gameOverState ? "none" : "block" }} />
      </Link>
      <div id="menutext">
        <p id="dropper"></p>
        <p id="descenttut" className="droppertext">
          Cereal Shot
        </p>
      </div>
    </div>
  );
};

export default SpoonDropCerealShot;
