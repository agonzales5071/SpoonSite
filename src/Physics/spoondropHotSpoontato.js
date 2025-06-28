import React, { useEffect, useRef } from "react";
import Matter from "matter-js";
import './spoondrop.css';
import { Link } from 'react-router-dom';

const SpoonDropHotSpoontato = () => {
  const boxRef = useRef(null);
  const canvasRef = useRef(null);
  const hudRef = useRef(null);

  useEffect(() => {
    const {
      Engine,
      Render,
      Runner,
      Bodies,
      Body,
      Composite,
      Composites,
      Constraint,
      Mouse,
      MouseConstraint,
      Vector,
      Events,
    } = Matter;

    const allSpoons = [];
    var isMobile = false;
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

    const hudCanvas = hudRef.current;
    if (hudCanvas) {
      hudCanvas.width = window.innerWidth;
      hudCanvas.height = window.innerHeight;
    }

    var margin = width/10;
    var fric = 0.03;
    engine.gravity.y = 0.3;
    var restitutionValue = 0.8;
    var size = 100; // size var for spoon
    let lives = 3;
    // Trampoline
    var segmentCount = 11;
    var segmentWidth = 40;
    var segmentHeight = 30;
    if (width < 800) {
      isMobile = true;
      size = 50;
      fric = 0.15;
      segmentCount = 5;
      segmentWidth = 28;
      segmentHeight = 15;
      margin = width/10;
    } 
    var gameWidth = width-2*margin;
    const startX = width / 2 - (segmentCount * segmentWidth) / 2;
    const startY = height * 0.8;

    const trampoline = Composites.stack(
      startX,
      startY,
      segmentCount,
      1,
      0,
      0,
      (x, y) =>
        Bodies.rectangle(x, y, segmentWidth, segmentHeight, {
          restitution: restitutionValue,
          frictionAir: fric,
          friction: fric,
          collisionFilter: {
            group:2,
            category: 2, 
            mask: 4
          },
          render: { fillStyle: "#eabf04" },
          chamfer: { radius: 6 },
        })
    );

    Composites.chain(trampoline, 0.5, 0, -0.5, 0, {
      stiffness: 1,
      length: 2,
      render: { visible: false },
    });

    // Rails at ends (invisible, kinematic)
    const leftRail = Bodies.rectangle(startX, startY, 10, 10, {
      isStatic: false,
      isSensor: true,
      collisionFilter: { group: -1 },
      render: { visible: false },
    });
    Body.setVelocity(leftRail, { x: 0, y: 0 });
    leftRail.isSleeping = true;

    const rightRail = Bodies.rectangle(
      startX + segmentCount * segmentWidth,
      startY,
      10,
      10,
      {
        isStatic: false,
        isSensor: true,
        collisionFilter: { group: -1 },
        render: { visible: false },
      }
    );
    Body.setVelocity(rightRail, { x: 0, y: 0 });
    rightRail.isSleeping = true;

    Composite.add(engine.world, [leftRail, rightRail]);

    const leftConstraint = Constraint.create({
      bodyA: trampoline.bodies[0],
      pointA: { x: -segmentWidth / 2, y: 0 },
      bodyB: leftRail,
      pointB: { x: 0, y: 0 },
      length: 0,
      stiffness: 1,
      render: { visible: false },
    });

    const rightConstraint = Constraint.create({
      bodyA: trampoline.bodies[segmentCount - 1],
      pointA: { x: segmentWidth / 2, y: 0 },
      bodyB: rightRail,
      pointB: { x: 0, y: 0 },
      length: 0,
      stiffness: 1,
      render: { visible: false },
    });

    Composite.add(engine.world, [leftConstraint, rightConstraint]);
    Composite.add(engine.world, trampoline);

    // Mouse and dragging trampoline horizontally with damping
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false },
      },
    });
    Composite.add(engine.world, mouseConstraint);

    // Variables for smooth movement
    let isDragging = false;

    Events.on(mouseConstraint, "mousedown", () => {
      isDragging = true;
      if(resettable){
        restartGame();
        resettable = false;
      }
      if(!gameStarted){
        startGame();
      }
    });

    Events.on(mouseConstraint, "mouseup", () => {
      isDragging = false;
    });
    
    Events.on(engine, "beforeUpdate", () => {
      if (isDragging) {
        let totalSpoonMass = 0;
    
        allSpoons.forEach(({ body }) => {
          if (!body.isSleeping) {
            totalSpoonMass += body.mass;
          }
        });
    
        const maxMass = 50;
        const weightFactor = Math.min(totalSpoonMass / maxMass, 1);
        const dampingBase = 0.2;
        const boost = weightFactor * 0.5;
        const damping = dampingBase + boost;
    
        const targetX = mouse.position.x;
        const currentCenterX = (leftRail.position.x + rightRail.position.x) / 2;
    
        const newCenterX = currentCenterX + (targetX - currentCenterX) * damping;
        const halfWidth = (segmentCount * segmentWidth) / 2;
    
        const newLeftX = newCenterX - halfWidth;
        const newRightX = newCenterX + halfWidth;
    
        // Always lock rails Y position and Y velocity
        Body.setPosition(leftRail, Vector.create(newLeftX, startY));
        Body.setVelocity(leftRail, Vector.create(0, 0));
    
        Body.setPosition(rightRail, Vector.create(newRightX, startY));
        Body.setVelocity(rightRail, Vector.create(0, 0));
      } else {
        // When not dragging, allow X drift but lock Y for rails
        Body.setPosition(leftRail, Vector.create(leftRail.position.x, startY));
        Body.setVelocity(leftRail, Vector.create(leftRail.velocity.x, 0));
    
        Body.setPosition(rightRail, Vector.create(rightRail.position.x, startY));
        Body.setVelocity(rightRail, Vector.create(rightRail.velocity.x, 0));
      }
    
      // Lock left and right trampoline ends to rails in Y (unless netBump)
      const leftSegment = trampoline.bodies[0];
      const rightSegment = trampoline.bodies[trampoline.bodies.length - 1];
    
      Body.setPosition(leftSegment, Vector.create(leftSegment.position.x, netBump ? leftSegment.position.y : startY));
      Body.setVelocity(leftSegment, Vector.create(leftSegment.velocity.x, netBump ? leftSegment.velocity.y : 0));
    
      Body.setPosition(rightSegment, Vector.create(rightSegment.position.x, netBump ? rightSegment.position.y : startY));
      Body.setVelocity(rightSegment, Vector.create(rightSegment.velocity.x, netBump ? rightSegment.velocity.y : 0));
    });

    //----------BUMPERS------------
    var bumperWidth = 50;
    const bumperHeight = height * 2; // taller than canvas
    const bumperY = height / 2;
    if (isMobile){
      bumperWidth = 20;
    }

    const leftBumper = Bodies.rectangle(
      0,
      bumperY,
      bumperWidth,
      bumperHeight,
      {
        isStatic: true,
        label: "bumper",
        isSensor: false, // so it doesn’t block, just triggers
        collisionFilter: {
          category: 8, // unique category
          mask: 4 // only spoons (category 4) can collide
        },
        render: { visible: true },
      }
    );

    const rightBumper = Bodies.rectangle(
      width,
      bumperY,
      bumperWidth,
      bumperHeight,
      {
        isStatic: true,
        label: "bumper",
        isSensor: false,
        collisionFilter: {
          category: 8,
          mask: 4
        },
        render: { visible: true },
      }
    );

    leftBumper.isBumper = true;
    rightBumper.isBumper = true;
    Composite.add(engine.world, [leftBumper, rightBumper]);

    
    
    let bumpNeeded = false;

    // Game state vars
    var dropSpoons;
    var points = 0;
    var doBumps;
    var tracker = 0;
    var initialSpeed = 250;
    var speed = initialSpeed;


    const ongoingPushes = new Map(); // Map<spoon.id, intervalId>

    let netBump = false; // new flag
    // Collision handling for bouncing spoons off trampoline segments
    Events.on(engine, "collisionStart", function (event) {
      event.pairs.forEach((pair) => {
        const { bodyA, bodyB } = pair;

        let trampolineBody = null;
        let targetBody = null;
        // console.log("collision");
        if (!(trampoline.bodies.includes(bodyB) && trampoline.bodies.includes(bodyA))) {
          //collision logic for trampoline bumping spoons
          if (trampoline.bodies.includes(bodyA)) {
            trampolineBody = bodyA;
            targetBody = bodyB;
          } else if (trampoline.bodies.includes(bodyB)) {
            trampolineBody = bodyB;
            targetBody = bodyA;
          }
          if (trampolineBody && targetBody) {
            bumpNeeded = true;
            netBump = true;
            setTimeout(() => { netBump = false; }, 1000);
          }
        }

        //collision logic for spoon and bumper
        const bumper = [bodyA, bodyB].find(b => b.label === "bumper");
        const spoonPart = [bodyA, bodyB].find(b => b.label !== "bumper");
        var bumperPowerY = -0.015;
        var bumperPowerX = 0.00005;
        var maxTicks = 4;
        if (isMobile) {
          bumperPowerY = -0.005;
          bumperPowerX = 0.0001;
          maxTicks = 2;
        }
        if (bumper && spoonPart?.isSpoonPart) {
          const spoon = spoonPart.parentSpoon;
          if (spoon && spoon.parts) {
            if (ongoingPushes.has(spoon.id)) {
              // Already pushing this spoon, don't start again
              return;
            }
            bumper.render.fillStyle = "#39ad5e";
            setTimeout(() => {
              bumper.render.fillStyle = "transparent";
            }, 100);
        
            const centerX = window.innerWidth / 2;
            const dx = centerX - spoon.position.x;
            const xDir = dx * bumperPowerX; // smaller per tick
            const yDir = bumperPowerY;
        
            let ticks = 0;
        
            const intervalId = setInterval(() => {
              if (ticks >= maxTicks) {
                clearInterval(intervalId);
                ongoingPushes.delete(spoon.id);
                return;
              }
              ticks++;
        
              spoon.parts.forEach(part => {
                Matter.Sleeping.set(part, false);
                Matter.Body.applyForce(part, part.position, { x: xDir, y: yDir });
              });
            }, 16); // roughly one frame at 60fps
        
            ongoingPushes.set(spoon.id, intervalId);
          }
        }
        

      });
    });

    let bumpTime = 0;
    var trampForce = -0.01;
    if (isMobile) {
      trampForce = -0.005;
    }
    Events.on(engine, "afterUpdate", () => {
      if (bumpNeeded) {
        bumpTime = 0;
        doBumps = setInterval(() => {
          if(bumpTime < 2) {
            trampoline.bodies.forEach(segment => {
              Body.applyForce(segment, segment.position, { x: 0, y: trampForce }); // stronger upward force
            });
            bumpTime++;
          }
          else {
            clearInterval(doBumps);
          }
        }, 50);
        bumpNeeded = false; // reset so it only fires once
      }
    });

    // Spawn falling spoons function
    function getRandomInt(max) {
      return Math.floor(Math.random() * max);
    }

    function spawnFallingSpoon() {
      let obstacleSize = size * 0.225 + size * Math.random() * 0.05; //slight variation to spawn size
      let xposSpawn = gameWidth * Math.random() + margin; 

      let spoonObstacle = getFallingSpoon(obstacleSize, xposSpawn);

      allSpoons.push({body: spoonObstacle, temp: startingHeat, isCooled: false});
      spoonHeatValues.push(startingHeat);
      Composite.add(engine.world, spoonObstacle);
    }

    //slight variation on density of spoon based on color
    const spoonColors = ["#bf3317", "#db8c2c","#e6ca40", "#54a8a7"];
    const spoonGrav = [0.0011, 0.0009, 0.001];

    //returns a spoon to fall from top of screen
    function getFallingSpoon(obstacleSize, xposSpawn){
      let spoonType = getRandomInt(3);
      let spoonSpawn = [xposSpawn, -100, -(3 * obstacleSize) - 100];
      let spoonHeadOffset = obstacleSize / 10;
      let spoonDensity = spoonGrav[spoonType];

      //SHAPES
      let partA1 = Bodies.circle(spoonSpawn[0], spoonSpawn[2], obstacleSize, {
        restitution: restitutionValue,
        label: "spoon",
        density: spoonDensity,
        render: {fillStyle: spoonColors[0]},
        collisionFilter: {
          group: -2,
          category: 4,
          mask: 2 | 8,
        },
      });
      let partA2 = Bodies.circle(spoonSpawn[0], spoonSpawn[2] - spoonHeadOffset, obstacleSize, {
        render: partA1.render,
        density: spoonDensity,
        label: "spoon",
        restitution: restitutionValue,
        collisionFilter: partA1.collisionFilter,
      });
      let partA3 = Bodies.circle(spoonSpawn[0], spoonSpawn[2] - 2 * spoonHeadOffset, obstacleSize, {
        render: partA1.render,
        density: spoonDensity,
        label: "spoon",
        restitution: restitutionValue,
        collisionFilter: partA1.collisionFilter,
      });
      let partA4 = Bodies.circle(spoonSpawn[0], spoonSpawn[2] - 3 * spoonHeadOffset, obstacleSize, {
        render: partA1.render,
        density: spoonDensity,
        label: "spoon",
        restitution: restitutionValue,
        collisionFilter: partA1.collisionFilter,
      });
      let partB = Bodies.trapezoid(spoonSpawn[0], spoonSpawn[1], obstacleSize, obstacleSize * 5, 0.4, {
        render: partA1.render,
        density: spoonDensity,
        label: "spoon",
        restitution: restitutionValue,
        collisionFilter: partA1.collisionFilter,
      });

      let spoonObstacle = Body.create({
        parts: [partA1, partA2, partA3, partA4, partB],
        restitution: restitutionValue,
        label: "spoon",
        collisionFilter: partA1.collisionFilter,
      });

      Body.setCentre(spoonObstacle, Vector.create(spoonSpawn[0], spoonSpawn[1] - obstacleSize / 10), false);
      
      //ANGLE
      let angle = Math.random() * 90 - 45;
          
      Body.setAngle(spoonObstacle, angle);

      if (Math.random() * 2 < 1 ) {//some of em spin :)
        Body.setAngularVelocity(
          spoonObstacle,
          ((obstacleSize - Math.random() * obstacleSize) / 600) * (getRandomInt(3) - 1)
        );
      }
      const parts = [partA1, partA2, partA3, partA4, partB];
      parts.forEach(part => {
        part.isSpoonPart = true;
        part.parentSpoon = spoonObstacle; // link to parent
      });

      return spoonObstacle;
    }

    function createPlusOne(x, y) {
      const parts = [];
    
      // "+" sign made of two rectangles
      const plusHorizontal = Matter.Bodies.rectangle(x, y, 20, 5, {
        isStatic: true,
        render: {
          fillStyle: "#ffffff"
        }
      });
    
      const plusVertical = Matter.Bodies.rectangle(x, y, 5, 20, {
        isStatic: true,
        render: {
          fillStyle: "#ffffff"
        }
      });
    
      // "1" digit as a tall thin rectangle
      const one = Matter.Bodies.rectangle(x + 15, y, 5, 25, {
        isStatic: true,
        render: {
          fillStyle: "#ffffff"
        }
      });
    
      parts.push(plusHorizontal, plusVertical, one);
    
      const plusOneComposite = Matter.Body.create({
        parts,
        isStatic: true,
        collisionFilter: {
          mask: 0, // No collisions
        }
      });
    
      // Optional: animate upward float and fade
      let opacity = 1;
      const floatInterval = setInterval(() => {
        // Move upward slightly
        Matter.Body.translate(plusOneComposite, { x: 0, y: -1 });
    
        // Fade out by reducing opacity
        opacity -= 0.05;
        plusOneComposite.parts.forEach(part => {
          part.render.opacity = opacity;
        });
    
        if (opacity <= 0) {
          clearInterval(floatInterval);
          Matter.Composite.remove(engine.world, plusOneComposite);
        }
      }, 50);
    
      Matter.Composite.add(engine.world, plusOneComposite);
    }
    

    function handleCooledSpoon(spoon) {
      let spoonBody = spoon.body;
      createPlusOne(spoonBody.position.x, spoonBody.position.y - 50);
      if (!spoon.isCooled) {
        spoonBody.parts.forEach(part => {
          part.render.fillStyle = spoonColors[3];
          part.collisionFilter = {
            group: -2,
            category: 4,
            mask: 0,
          }
        });
        //increase points once per spoon
        points++;
        spoon.isCooled = true;
      }

    }

    function changeColor(spoon, color) {
      spoon.parts.forEach(part => {
        part.render.fillStyle = spoonColors[color];
      });
    }

    var spoonHeatValues = [];
    var startingHeat = 150;
    function spoonHeatDecay(){
      allSpoons.forEach((spoon) => {
        if (getRandomInt(3) <= 1) {
          // 2/3 of the time decay heat
          spoon.temp -= 1;
        }
        if (spoon.temp <= 0) {
          handleCooledSpoon(spoon);
        } else if (spoon.temp <= (1 / 3) * startingHeat) {
          changeColor(spoon.body, 2); // yellow
        } else if (spoon.temp <= (2 / 3) * startingHeat) {
          changeColor(spoon.body, 1); // orange
        }
      });
    }

    function detectDroppedSpoons(){
      let droppedSpoons = false;
      var spoonsToRemove = [];
      allSpoons.forEach((spoon, index) => {
        // console.log("spoon found")
        if (spoon.body.position.y > height + 100 ) {
          if (!spoon.isCooled) {
            droppedSpoons = true;
          }
          //cleanup spoons off screen
          spoonsToRemove.push(index);
          Composite.remove(engine.world, spoon);
        }
      });
      //clean up array of spoons
      for (let i = spoonsToRemove.length - 1; i >= 0; i--) {
        allSpoons.splice(spoonsToRemove[i], 1);
      }
      if(droppedSpoons && gameStarted){
        lives = Math.max(0, lives - 1);
        if(lives <= 0) {
          gameOver();
          //deal with spoons so they can fly up and then get deleted
         allSpoons.splice(0, allSpoons.length);
        }
      }
    }

    

    function drawSpoonIcon(ctx, x, y, radius) {
      // Spoon bowl
      ctx.fillStyle = "#cccccc";
      // Spoon head (circle)
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Handle
      ctx.fillRect(x - 2, y, 4, 20);
    }
    

    // Game control vars
    var gameStarted = false;
    var resettable = false;

    function restartGame() {
      if (resettable === true) {
        points = 0;
        resettable = false;
        tracker = 0;
        lives = 3;
        speed = initialSpeed;

        // Reset trampoline rails to center
        Body.setPosition(leftRail, Vector.create(startX, startY));
        Body.setPosition(rightRail, Vector.create(startX + segmentCount * segmentWidth, startY));
        startGame();
      }
    }
    //TODO: add more messages
    function gameOver() {
      gameStarted = false;
      resettable = true;
      clearInterval(dropSpoons);
      trampoline.bodies.forEach(segment => {
        const netForce = { x: 0, y: 1 }; // throw out the spoons
        Body.applyForce(segment, segment.position, netForce);
      });
      const tutEl = document.getElementById("descenttut");
      if (tutEl) tutEl.innerHTML = "Touch anywhere to try again.";
      const dropperEl = document.getElementById("dropper");
      if(points >= 20){
        if (dropperEl) dropperEl.innerHTML = "HOLY COW!!! You cooled " + points + " spoons!";
      }
      else if (dropperEl) dropperEl.innerHTML = "Way to go! You cooled " + points + " spoons!";
    }

    var debug = false;
    function startGame() {
      if (gameStarted === false) {
        
        gameStarted = true;
        const tutEl = document.getElementById("descenttut");
        if (tutEl) tutEl.innerHTML = "";

        dropSpoons = setInterval(() => {
          if (document.getElementById("dropper") === null) {
            clearInterval(dropSpoons);
            return;
          }
          spoonHeatDecay()
          detectDroppedSpoons()
          if(doSpawnCheck()){
            spawnFallingSpoon();
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
      //speed change for spoon drops
      //after 12 it's close to max speed
      if (tracker / (1.5 * speed) > 1 && speed > 200) {
        speed = speed - 50;
        tracker = 1;
        doSpawn = true;
      }
      //more gradual speed change to top speed
      else if (tracker / (1.5 * speed) > 1 && speed > 100) {
        speed-=25;
        tracker = 1;
        doSpawn = true;
      }
      if (tracker % speed === 0) {
        doSpawn = true;
      }
      tracker++;
      return doSpawn; 
    }

    function setText() {
      const dropperEl = document.getElementById("dropper");
      //point tracking messages
      if(points >= 20){
        if (dropperEl) dropperEl.innerHTML = "Whoa! " + points + " cool spoons";
      }
      else if(points >= 10){
        if (dropperEl) dropperEl.innerHTML = "Nice! " + points + " cool spoons"; 
      }
      else{
        if (dropperEl) dropperEl.innerHTML = points + " cool spoons";
      }
      if (dropperEl && debug) dropperEl.innerHTML = "Whoa! " + points + " cool spoons. Speed = " + speed;
    }


    // Remove old interval movement on mouse drag - no longer needed with damping

    // Start Matter runner and renderer
    Runner.run(runner, engine);
    Render.run(render);
    function drawHUD() {
      const ctx = hudRef.current.getContext("2d");
    
      const renderHUD = () => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        if (!gameStarted) {
          requestAnimationFrame(renderHUD);
          return;
        }
        
        ctx.font = "24px Arial";
        ctx.fillStyle = "#ffffff";
    
        const spoonSpacing = 35;
        const spoonRadius = 10
        const margin = 20;
        const topOffset = 40;
        const text = "Lives:";
        const textWidth = ctx.measureText(text).width;
        const startX = ctx.canvas.width - (margin + textWidth + 15);
        const startY = topOffset - 10;
        
        // Draw text
        ctx.fillText(text, startX - 90, topOffset);
    
        // Draw spoons
        for (let i = 0; i < lives; i++) {
          drawSpoonIcon(ctx, startX + i * spoonSpacing, startY, spoonRadius);
        }
    
        requestAnimationFrame(renderHUD);
      };
    
      renderHUD();
    }
    drawHUD();
    

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
      <canvas ref={canvasRef} />
      <canvas ref={hudRef} className="hud" style={{ position: "absolute", top: 0, left: 0, zIndex: 1, pointerEvents: "none" }} />
      <Link to="/spoondropMenu">
        <button className="back-button" onClick={() => console.log("button pressed")} />
      </Link>
      <div id="menutext">
        <p id="dropper">click or tap and drag to move the net</p>
        <p id="descenttut" className="droppertext">
          catch the spoons!
        </p>
      </div>
    </div>
  );
};

export default SpoonDropHotSpoontato;
