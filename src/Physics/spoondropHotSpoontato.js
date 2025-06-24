import React, { useEffect, useRef } from "react";
import Matter from "matter-js";
import './spoondrop.css';
import { Link } from 'react-router-dom';

const SpoonDropHotSpoontato = () => {
  const boxRef = useRef(null);
  const canvasRef = useRef(null);

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
      Detector,
    } = Matter;

    const allSpoons = [];
    var isMobile = false;
    var width = window.innerWidth;
    var height = window.innerHeight;

    let engine = Engine.create({});
    let runner = Runner.create({});
    let detector = Detector.create({});

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

    var gameWidth = width;
    var leftMargin = 0;
    var detectable = [];
    var force = 0.001;
    var fric = 0.2;
    var turnaround = 0.8;
    engine.gravity.y = 0.3;
    var restitutionValue = 0.8;
    var size = 100; // size var for spoon
    if (width < 800) {
      isMobile = true;
      size = 50;
      force = 0.0005;
      fric = 0.03;
      turnaround = 0.8;
    } else if (width >= (4 / 3) * height) {
      size = 100;
      force = 0.010;
      fric = 0.03;
      turnaround = 0.8;
      gameWidth = (width * 2) / 3;
      leftMargin = width / 6;
    }

    // Trampoline
    const segmentCount = 11; 
    const segmentWidth = 40;
    const segmentHeight = 30;
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
          render: { fillStyle: "#558B2F" },
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
    let targetMouseX = null;

    Events.on(mouseConstraint, "mousedown", () => {
      isDragging = true;
      targetMouseX = mouse.position.x;
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
      targetMouseX = null;
    });

    //anti-spoon force
    // Events.on(engine, "collisionStart", function(event) {
    //   console.log("collide")
    //   trampoline.bodies.forEach(segment => {
    //     const netForce = { x: 0, y: 1 }; // upward cheat force
    //     Body.applyForce(segment, segment.position, netForce);
    //   });
    // });
    
    
    Events.on(engine, "beforeUpdate", () => {
      if (isDragging) {
        let totalSpoonMass = 0;
    
        allSpoons.forEach(spoon => {
          if (!spoon.isSleeping) {
            totalSpoonMass += spoon.mass;
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
    
    
    let bumpNeeded = false;
    var deadSpoons = [];
    // Setup detection array
    var detectable = [];
    function setDetection(body) {
      detectable.push(body);
      Detector.setBodies(detector, detectable);
    }

    // Add trampoline bodies to detection for collision filtering
    trampoline.bodies.forEach((body) => setDetection(body));

    // Spoon starting position
    var spoonstart = [width / 2, height * (5 / 6), height / 4 - (3 * size) / 5];

    // Game state vars
    var spawnwalls;
    var points = 0;
    var fallTracker = 0;
    var speed = 20000;
    var initialSpeed = 20000;
    var speedChange = 0;
    var firstSpoon = true;

    // Spawn falling spoons function
    function getRandomInt(max) {
      return Math.floor(Math.random() * max);
    }

    var spoonColors = ["#2f6f8b", "#6f2f8b","#ad3f1a", "#a1ad1a", "#ad1a1a"];
    var spoonGrav = [0.0011, 0.0012, 0.0008, 0.0009, 0.001];
    function spawnFallingSpoons() {
      let spoonType = getRandomInt(5);
      let fallFrequency = 50;
      if (isMobile) {
        fallFrequency = 50;
      }
      if (fallTracker % fallFrequency === 0) {
        let obstacleSize = size * 0.25;
        let xposSpawn = width/2;// * Math.random();

        let spoonSpawn = [xposSpawn, -100, -(3 * obstacleSize) - 100];
        let spoonHeadOffset = obstacleSize / 10;
        let spoonDensity = spoonGrav[spoonType];

        let partA1 = Bodies.circle(spoonSpawn[0], spoonSpawn[2], obstacleSize, {
          restitution: restitutionValue,
          density: spoonDensity,
          render: {fillStyle: spoonColors[spoonType]},
          collisionFilter: {
            group: -2,
            category: 4,
            mask: 2,
          },
        });
        let partA2 = Bodies.circle(spoonSpawn[0], spoonSpawn[2] - spoonHeadOffset, obstacleSize, {
          render: partA1.render,
          density: spoonDensity,
          restitution: restitutionValue,
          collisionFilter: partA1.collisionFilter,
        });
        let partA3 = Bodies.circle(spoonSpawn[0], spoonSpawn[2] - 2 * spoonHeadOffset, obstacleSize, {
          render: partA1.render,
          density: spoonDensity,
          restitution: restitutionValue,
          collisionFilter: partA1.collisionFilter,
        });
        let partA4 = Bodies.circle(spoonSpawn[0], spoonSpawn[2] - 3 * spoonHeadOffset, obstacleSize, {
          render: partA1.render,
          density: spoonDensity,
          restitution: restitutionValue,
          collisionFilter: partA1.collisionFilter,
        });
        let partB = Bodies.trapezoid(spoonSpawn[0], spoonSpawn[1], obstacleSize, obstacleSize * 5, 0.4, {
          render: partA1.render,
          density: spoonDensity,
          restitution: restitutionValue,
        });

        let spoonObstacle = Body.create({
          parts: [partA1, partA2, partA3, partA4, partB],
          restitution: restitutionValue,
          collisionFilter: partA1.collisionFilter,
        });

        allSpoons.push(spoonObstacle);
        if (allSpoons.length > 5) {
          const oldSpoon = allSpoons.shift(); // remove first (oldest) spoon
          Composite.remove(engine.world, oldSpoon);
        }

        allSpoons.forEach((element) => {
          if (element.position.y > height + 100) {
            if(gameStarted){
              //gameOver();
            }
            Composite.remove(engine.world, element);
          }
        });
        if(gameStarted){
          Body.setCentre(spoonObstacle, Vector.create(spoonSpawn[0], spoonSpawn[1] - obstacleSize / 10), false);
  
          let angle = Math.random() * 90 - 45;
          if (obstacleSize > size * 0.5 || getRandomInt(2) === 0) {
            angle += 180;
          }
          if (obstacleSize > size * 0.8) {
            angle = 160;
            if (getRandomInt(2) === 0) {
              angle = 160.5;
            }
          }
          Body.setAngle(spoonObstacle, angle);
  
          spoonObstacle.frictionAir = 0.01;
  
          if (Math.random() * 2 < 1 && obstacleSize < size * 0.4) {
            Body.setAngularVelocity(
              spoonObstacle,
              ((obstacleSize - Math.random() * obstacleSize) / 600) * (getRandomInt(3) - 1)
            );
          }
          //increment points
          if(firstSpoon){
            firstSpoon = false;
          }
          else{
            points++;
          }
          Composite.add(engine.world, spoonObstacle);
          //clear previous game if applicable
          if(deadSpoons.length > 0){
            deadSpoons.forEach((element) => {
              if (element.position.y > height + 30) {
                Composite.remove(engine.world, element);
              }
            });
          }
        }
        else{
          //deal with spoons so they can fly up and then get deleted
          allSpoons.forEach((element) => {
            deadSpoons.push(element);
          });
          allSpoons.splice(0, allSpoons.length);;
        }
      }
    }

    // Game control vars
    var gameStarted = false;
    var resettable = false;
    var allMovements = [];

    function restartGame() {
      if (resettable === true) {
        points = 0;
        resettable = false;
        fallTracker = 0;
        speed = initialSpeed;
        firstSpoon = true;

        // Reset trampoline rails to center
        Body.setPosition(leftRail, Vector.create(startX, startY));
        Body.setPosition(rightRail, Vector.create(startX + segmentCount * segmentWidth, startY));
        startGame();
      }
    }
    let netBump = false; // new flag
    // Collision handling for bouncing spoons off trampoline segments
    Events.on(engine, "collisionStart", function (event) {
      event.pairs.forEach((pair) => {
        const { bodyA, bodyB } = pair;

        let trampolineBody = null;
        let targetBody = null;
        console.log("collision");
        if (!(trampoline.bodies.includes(bodyB) && trampoline.bodies.includes(bodyA))) {
          if (trampoline.bodies.includes(bodyA)) {
            trampolineBody = bodyA;
            targetBody = bodyB;
            console.log("bodies not null 1");
          } else if (trampoline.bodies.includes(bodyB)) {
            trampolineBody = bodyB;
            targetBody = bodyA;
            console.log("bodies not null 2");
          }
        
          if (trampolineBody && targetBody) {
            console.log("should use force")
            bumpNeeded = true;
            netBump = true;
            setTimeout(() => { netBump = false; }, 1000);
          }
        }
        // if (bodyA === ground || bodyB === ground) {
        //   alert("Game Over!");
        // }
      });
    });

    Events.on(engine, "afterUpdate", () => {
      if (bumpNeeded) {
        trampoline.bodies.forEach(segment => {
          Body.applyForce(segment, segment.position, { x: 0, y: -0.03 }); // stronger upward force
        });
        bumpNeeded = false; // reset so it only fires once
      }
    });
    function gameOver() {
      gameStarted = false;
      resettable = true;
      clearInterval(spawnwalls);
      trampoline.bodies.forEach(segment => {
        const netForce = { x: 0, y: 1 }; // throw out the spoons
        Body.applyForce(segment, segment.position, netForce);
      });
      const tutEl = document.getElementById("descenttut");
      if (tutEl) tutEl.innerHTML = "Touch anywhere to try again.";
      const dropperEl = document.getElementById("dropper");
      if (dropperEl) dropperEl.innerHTML = "Way to go! You saved " + points + " spoon(s)!";
    }
    function startGame() {
      if (gameStarted === false) {
        gameStarted = true;
        const tutEl = document.getElementById("descenttut");
        if (tutEl) tutEl.innerHTML = "";

        spawnwalls = setInterval(() => {
          if (document.getElementById("dropper") === null) {
            clearInterval(spawnwalls);
            return;
          }

          if (fallTracker % (10 * speed) === 0) {
            speedChange++;
            if (speedChange === 2) {
              speed--;
              speedChange = 0;
            }
            fallTracker = 0;
          }

          spawnFallingSpoons();
          fallTracker++;
          if(gameStarted){
            const dropperEl = document.getElementById("dropper");
            if (dropperEl) dropperEl.innerHTML = points + " spoons saved";
          }
        }, 100);
      }
    }

    // Remove old interval movement on mouse drag - no longer needed with damping

    // Start Matter runner and renderer
    Runner.run(runner, engine);
    Render.run(render);

    // Cleanup on unmount
    return () => {
      Render.stop(render);
      Runner.stop(runner);
      Composite.clear(engine.world, false);
      Engine.clear(engine);
      render.canvas.remove();
      render.textures = {};
      allMovements.forEach((element) => clearInterval(element));
    };
  }, []);

  return (
    <div className="notscene" ref={boxRef}>
      <canvas ref={canvasRef} />
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
