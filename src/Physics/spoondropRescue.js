import React, { useEffect, useRef } from "react";
import Matter from "matter-js";
import './spoondrop.css';
import { Link } from 'react-router-dom';

const SpoonDropRescue = () => {
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

    var gameWidth = width*8/10;
    var margin = width/10;
    var fric = 0.2;
    engine.gravity.y = 0.3;
    var restitutionValue = 0.8;
    var size = 100; // size var for spoon

    // Trampoline
    var segmentCount = 11;
    var segmentWidth = 40;
    var segmentHeight = 30;
    const startX = width / 2 - (segmentCount * segmentWidth) / 2;
    const startY = height * 0.8;

    if (width < 800) {
      isMobile = true;
      size = 50;
      fric = 0.03;
      segmentCount = 7;
      segmentWidth = 28;
      segmentHeight = 15;
      gameWidth = width * 9/10;
      margin = width/20;
    } 



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
    //controls
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
    
    // Movement Code
    // Lock rails vertical position & velocity + smooth horizontal movement toward targetX
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
        const halfWidth = (segmentCount * segmentWidth) / 3;
    
        const newLeftX = newCenterX - halfWidth;
        const newRightX = newCenterX + halfWidth;
    
        Body.setPosition(leftRail, Vector.create(newLeftX, startY));
        Body.setVelocity(leftRail, Vector.create(0, 0));
    
        Body.setPosition(rightRail, Vector.create(newRightX, startY));
        Body.setVelocity(rightRail, Vector.create(0, 0));
      } else {
        // When not dragging, allow X drift but lock Y
        Body.setPosition(leftRail, Vector.create(leftRail.position.x, startY));
        Body.setVelocity(leftRail, Vector.create(leftRail.velocity.x, 0));
    
        Body.setPosition(rightRail, Vector.create(rightRail.position.x, startY));
        Body.setVelocity(rightRail, Vector.create(rightRail.velocity.x, 0));
      }
    
      // Lock only the leftmost and rightmost trampoline segments in Y
      const leftSegment = trampoline.bodies[0];
      const rightSegment = trampoline.bodies[trampoline.bodies.length - 1];
    
      Body.setPosition(leftSegment, Vector.create(leftSegment.position.x, startY));
      Body.setVelocity(leftSegment, Vector.create(leftSegment.velocity.x, 0));
    
      Body.setPosition(rightSegment, Vector.create(rightSegment.position.x, startY));
      Body.setVelocity(rightSegment, Vector.create(rightSegment.velocity.x, 0));
    });
    
    // accounts for spoons when game is over
    var deadSpoons = [];

    // Game state vars
    var dropSpoons;
    var points = 0;
    var tracker = 0;
    var initialSpeed = 50;
    var speed = initialSpeed;
    var pointIncrementSwitch = false;

    // Spawn falling spoons function
    function getRandomInt(max) {
      return Math.floor(Math.random() * max);
    }


    function spawnFallingSpoon() {
      let obstacleSize = size * 0.200 + size * Math.random() * 0.1; //slight variation to spawn size
      let xposSpawn = gameWidth * Math.random() + margin; 

      let spoonObstacle = getFallingSpoon(obstacleSize, xposSpawn);

      allSpoons.push(spoonObstacle);
      //remove old spoons so there arent too many in the net
      if (allSpoons.length > 10) {//max number of spoons allowed in game
        const oldSpoon = allSpoons.shift(); // remove first (oldest) spoon
        Composite.remove(engine.world, oldSpoon);
      }

        
        Composite.add(engine.world, spoonObstacle);
      
      
    }

    //slight variation on density of spoon based on color
    const spoonColors = ["#2f6f8b", "#6f2f8b","#ad3f1a", "#a1ad1a", "#ad1a1a"];
    const spoonGrav = [0.0011, 0.0012, 0.0008, 0.0009, 0.001];

    //returns a spoon to fall from top of screen
    function getFallingSpoon(obstacleSize, xposSpawn){
      let spoonType = getRandomInt(5);
      let spoonSpawn = [xposSpawn, -100, -(3 * obstacleSize) - 100];
      let spoonHeadOffset = obstacleSize / 10;
      let spoonDensity = spoonGrav[spoonType];

      //SHAPES
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

      return spoonObstacle;
    }

    function detectDroppedSpoons(){
      let droppedSpoons = false;
      allSpoons.forEach((element) => {
        if (element.position.y > height + 100) {
          droppedSpoons = true;
          Composite.remove(engine.world, element);
        }
      });
      if(droppedSpoons && gameStarted){
        gameOver();
         //deal with spoons so they can fly up and then get deleted
        allSpoons.forEach((element) => {
          deadSpoons.push(element);
        });
        allSpoons.splice(0, allSpoons.length);
      }
    }

    // Game control vars
    var gameStarted = false;
    var resettable = false;

    function restartGame() {
      if (resettable === true) {
        points = 0;
        resettable = false;
        pointIncrementSwitch = false;
        tracker = 0;
        speed = initialSpeed;
        //removes spoons from previous game if applicable
        if(deadSpoons.length > 0){
          deadSpoons.forEach((element) => {
            Composite.remove(engine.world, element);
          });
          deadSpoons.splice(0, deadSpoons.length);
        }

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
        if (dropperEl) dropperEl.innerHTML = "HOLY COW!!! You saved " + points + " spoons!";
      }
      else if (dropperEl) dropperEl.innerHTML = "Way to go! You saved " + points + " spoons!";
    }

    var debug = true;
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
      if (tracker % (3 * speed) === 0 && speed > 25) {
        speed = speed - 5;
        tracker = 0;
      }
      //more gradual speed change to top speed
      else if (tracker % (3 * speed) === 0 && speed > 20) {
        speed--;
        tracker = 0;
      }
      if (tracker % speed === 0) {
        doSpawn = true;
        pointIncrementSwitch = true;
      }
      else if (tracker % (Math.floor(speed/2)) === 0) {
        doPointIncrement()
      }
      tracker++;
      return doSpawn; 
    }

    //points should increment halfway through spawn increment
    
    function doPointIncrement() {
      //increment points
      if (pointIncrementSwitch) points++;
      pointIncrementSwitch = !pointIncrementSwitch;
    }

    function setText() {
      const dropperEl = document.getElementById("dropper");
      //point tracking messages
      if(points >= 20){
        if (dropperEl) dropperEl.innerHTML = "Whoa! " + points + " spoons saved";
      }
      else if(points >= 10){
        if (dropperEl) dropperEl.innerHTML = "Nice! " + points + " spoons saved"; 
      }
      else{
        if (dropperEl) dropperEl.innerHTML = points + " spoons saved";
      }
      if (dropperEl && debug) dropperEl.innerHTML = "Whoa! " + points + " spoons saved. Speed = " + speed;
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

export default SpoonDropRescue;
