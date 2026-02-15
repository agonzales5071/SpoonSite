import React, { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import './spoondrop.css';
import GameOver from "./util/gameoverPopup";
import { Link } from 'react-router-dom';
import {createDefined2DVector, getAngleBetween, getLoop, getSpoon } from "./util/spoonHelper";

//bug fixes
//same name chat room join, back buttons, 

const SpoonDropDescent = () => {
  const boxRef = useRef(null);
  const canvasRef = useRef(null);
  const restartRef = useRef(null);
  const [playButtonText, setPlayButtonText] = useState("Play")

  const [gameOverState, setGameOverState] = useState(false);
  const [scoreText, setScoreText] = useState(0);
  const [message, setMessage] = useState("");
  
  useEffect( () => {
  const oopsAllSpoons = window.location.href.includes("Leo") || window.location.href.includes("leo");
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const debugVal = urlParams.get("debug");
    var allWalls = []; 
    var loops = [];
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
    let sinusoidTracker = 0;
    let closeWallSinusoidTracker = [0, 0, Math.PI/2];
    
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

    var gameWidth = width*4/5;
    var leftMargin = (width-gameWidth)/2;
    
    var force = 0.02;
    var fric = 0.03;
    var turnaround = 0.8;
    var size = 100; //size var for spoon
    const obstacleFilter = {
      group:-2,
      category: 4, 
      mask: 2
    }
    const spoonFilter = {
      group:2,
      category: 2, 
      mask: 4
    }
    //mobile augmentations
    if(width < 800){
      isMobile = true;
      size = 50;
      force = 0.002;
      fric = 0.03
      turnaround = 0.8;
      gameWidth = width*0.75;
      leftMargin = (width-gameWidth)/2;
    }
    else if(width >= (4/3)*height){
      
      size = 100;
      force = 0.03;
      fric = 0.03
      turnaround = 0.8;
      gameWidth = width*2/3;
      leftMargin = width*1/6;
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
    engine.world.gravity.y = 0;
    
    //making spoon
    
    var curSpoon = getSpoon(size, width/2, height/4, spoonFilter, "silver")
    curSpoon.frictionAir = fric;
    // Body.setCentre(curSpoon, Matter.Vector.create(spoonstart[0], spoonstart[1]-size/10), false);
    Composite.add(engine.world, curSpoon);

    var allMovements = [];
    var movement;
    //var prevx = curSpoon.position.x;
    var gameStarted = false;
    var resettable = false;
    //create spoon
    Matter.Events.on(mouseConstraint, "mousedown", function(event) {
      if(!gameStarted && !resettable){startGame()}
      movement = setInterval(function() {
        if(!ragdoll){
          let mousex = mouse.position.x,
          spox = curSpoon.position.x;
          if(Math.abs(Math.trunc(mousex) - Math.trunc(spox)) > 3  ){
            if(mousex >  spox){
              if(curSpoon.velocity.x < 0){
                Body.setVelocity(curSpoon, Matter.Vector.create(curSpoon.velocity.x*turnaround, 0));
              }
              Matter.Body.applyForce(curSpoon, curSpoon.position, Matter.Vector.create(force,0));
            }
            else if(mousex <  spox){
              if(curSpoon.velocity.x > 0){
                Body.setVelocity(curSpoon, Matter.Vector.create(curSpoon.velocity.x*turnaround, 0));
              }
              Matter.Body.applyForce(curSpoon, curSpoon.position, Matter.Vector.create(-1*force,0));
            }
            if(Math.abs(curSpoon.velocity.x) > 2){
              Body.setAngle(curSpoon, curSpoon.velocity.x*(-0.03));
            }
          }
          else{
            Body.setPosition(curSpoon, Matter.Vector.create(mousex, curSpoon.position.y));
            Body.setVelocity(curSpoon, Matter.Vector.create(curSpoon.velocity.x*0.2, 0));
            Body.setAngle(curSpoon, curSpoon.angle*0.1);
          }
        }
        // Body.setPosition(curSpoon, Matter.Vector.create(x, spoonstart[2]));
        // prevx = x;

        //console.log("spoon:" + spox + " mouse:" + mousex );
            //console.log(curSpoon.velocity);
      }, 10);
      allMovements.push(movement);
    });

    //collision detection attempt
    
    Matter.Events.on(mouseConstraint, "mouseup", function(event){
      allMovements.forEach(element => {
        clearInterval(element);
      })
      // clearInterval(movement);
    });
    Matter.Events.on(engine, "beforeUpdate", function(event){
      stepPulsingLoops();
    });
    
    Matter.Events.on(engine, "collisionStart", function(event) {
      //gameover
        allWalls.forEach(element => {
          Body.setStatic(element, true);
        });
        setScoreText(points + "m fallen");
        let endMessage = getPopupMessage();
        setMessage(endMessage);
        gameStarted = false;
        resettable = true;
        //Body.setStatic(curSpoon, true);
        ragdoll = true;
        clearInterval(spawnwalls);
        if( document.getElementById('descenttut') !== null){
          document.getElementById("descenttut").innerHTML = "";
        }
        if( document.getElementById('dropper') !== null){
          document.getElementById("dropper").innerHTML = "";
        }
      setTimeout(() => {
        setGameOverState(true); // Show game over screen
      }, 1100)
        
    });
    var initialSpeed = 20;
    var obstacleSetNumber = 10;
    var ragdoll = false;
    var spawnwalls;
    var points = 0;
    var wallTracker = 0;
    var speed = initialSpeed;
    var wallMoveSpeed = -5;
    var speedChange = 0;
    var oneType = oopsAllSpoons ? 3 : -1;// -1 for off, otherwise index of obstacle
    const obstacles = [
      spawnDefaultWalls,
      spawnCloseWalls,
      spawnLoopObstacles,
      spawnSpoonObstacles,
      spawnShootingLoops
    ];
    if (debugVal && parseInt(debugVal) >= 0 && parseInt(debugVal) < obstacles.length){
      oneType = parseInt(debugVal);
    }
    var currentObstacle = spawnDefaultWalls;
    function getRandomInt(max) {
      return Math.floor(Math.random() * max);
    }
    function startGame() {
      if(gameStarted === false){
        setGameOverState(false); // Show game over screen
        gameStarted = true;     
        document.getElementById('descenttut').innerHTML = "";

        spawnwalls = setInterval(function() {
          if( document.getElementById('dropper') === null){
            clearInterval(spawnwalls);
          }
          else if(wallTracker%(obstacleSetNumber*speed) === 0){
            speedChange++;
            if(speedChange === 2){
              speed--;
              speedChange = 0;
            }
            wallTracker = 0;
            if(points !== 0){
              changeObstacle();
            }
            
          }
          doObstacles();
          wallTracker++;
          points++;
          deleteStaleObstacles();
          setAllSpeeds();
          if( document.getElementById('dropper') === null){
            clearInterval(spawnwalls);
          }
          else{
            document.getElementById('dropper').innerHTML = points + "m fallen"
          }
        }, 100);
      }

    }
    //return value between 0 and 1
    function getObstaclePercentDone(){
      return wallTracker/(obstacleSetNumber*speed) 
    }
    function doObstacles(){
      if(oneType >= 0){
        obstacles[oneType]();
      }
      else{
        currentObstacle();
      }
    }
    function changeObstacle(){
      const index = Math.floor(Math.random() * obstacles.length);
      currentObstacle = obstacles[index];
    }
    // gets middle of obstacle
    //TODO: Change interval for mobile
    function getNewCenter(){
      let pos;
      pos = gameWidth/2*Math.sin(sinusoidTracker) + gameWidth/2 + leftMargin;
      let intervalJump = isMobile ? getRandomInt(2) + 3: getRandomInt(2) + 3;
      sinusoidTracker += Math.PI/intervalJump;
      if(getRandomInt(3) === 0){
        sinusoidTracker += Math.PI/2
      }
      return pos;
    }
    function spawnDefaultWalls(){
      if(wallTracker%speed === 0 && wallTracker > 10){
        let center = getNewCenter();

        let walls = [
          Bodies.rectangle(center-size-width/2, height + size + 100, width, size/2, { isStatic: false, frictionAir: 0, 
            collisionFilter: obstacleFilter}),
          Bodies.rectangle(center+size+width/2, height + size + 100, width, size/2, { isStatic: false, frictionAir: 0, 
            collisionFilter: obstacleFilter}),
            
        ]
        addWalls(walls);
      }
    }
    //input : closewalltracker[x,y,z] where x is smallest sinusoid tracker
    //adds 3 sinusoids for wavy obstacle
    function getCloseWallsCenter(){
      let smallAmp = isMobile ? gameWidth*0.20 :  gameWidth*0.15;
      let medAmp = gameWidth * 0.35;
      let leftoverWidth = gameWidth - (smallAmp + medAmp);

      let smallSine = smallAmp*Math.sin(closeWallSinusoidTracker[0]);
      let mediumSine = medAmp*Math.sin(closeWallSinusoidTracker[1]);
      
      let pos = smallSine + mediumSine + leftoverWidth + leftMargin;
      let smallInterval = isMobile ? 8 : 16;
      let curveFasterSmall = Math.abs(Math.sin(closeWallSinusoidTracker[0])) > 0.9 ? 3 : 1;
      let curveFasterMed = Math.abs(Math.sin(closeWallSinusoidTracker[1])) > 0.9 ? 3 : 1;
      closeWallSinusoidTracker[0] += Math.PI/(getRandomInt(smallInterval) + smallInterval/curveFasterSmall);
      closeWallSinusoidTracker[1] += Math.PI/(getRandomInt(16/curveFasterMed) + 100);

      return pos;
    }
    function spawnCloseWalls(){
      let percentDone = getObstaclePercentDone()
      let safetyMargin = percentDone > .95 || percentDone < 0.05 
      if(wallTracker%3 === 0 && !safetyMargin){
        let center = getCloseWallsCenter();
        
        let thickness = 1.5;
        let walls = [
          Bodies.rectangle(center-size-width/2, height+size+100, width, size*thickness, { isStatic: false, frictionAir: 0, 
            collisionFilter: obstacleFilter}),
          Bodies.rectangle(center+size+width/2, height+size+100, width, size*thickness, { isStatic: false, frictionAir: 0, 
            collisionFilter: obstacleFilter}),
        ]
        addWalls(walls);
      }
    }
    function addWalls(walls){
      walls.forEach(element => {
        addObstacle(element);
      })
    }
    function addObstacle(obstacle){
      allWalls.push(obstacle);
      Composite.add(engine.world, obstacle);
      Body.setVelocity(obstacle, Matter.Vector.create(0, wallMoveSpeed));
    }
    function deleteStaleObstacles(){
      let count = 0;
      let loopCount = 0;
      allWalls.forEach(element =>{
        if(element.position.y < -height/2){
          if(element.isLoop === true){
            loopCount++;
          }
          Composite.remove(engine.world, element);
          count++;
        }
      })
      allWalls.splice(0, count);
      loops.splice(0, loopCount);
    }
    function clearScreen(){
      allWalls.forEach(element =>{ 
        Composite.remove(engine.world, element);
      })
      allWalls.splice(0, allWalls.length);
      loops.forEach(element =>{ 
        Composite.remove(engine.world, element.body);
      })
      loops.splice(0, loops.length);
    }
    function setAllSpeeds(){
      allWalls.forEach(element =>{
        let trueSpeed = element.velocity.y !== wallMoveSpeed ? element.velocity.y : wallMoveSpeed
        Body.setVelocity(element, Matter.Vector.create(element.velocity.x, trueSpeed));
      })
    }
    function stepPulsingLoops(){
      loops.forEach(loop => { 
        if(loop.body.position.y >= 0){
          //only resize loop clusters when game is ongoing
          if(loop.children){
            if(gameStarted && loop.pulses){
              resizeLoop(loop)
            }
          }
          else{
            if(loop.pulses === true){
              resizeLoop(loop);
            }
          }
          if(loop.isPeakSize && loop.children){
            childLoopPush(loop);
          }
        }
      })
    }
    function childLoopPush(loop){
      loop.children.forEach(loopChild => {
        let bumpForce = 3;
        let forceVector = createDefined2DVector(bumpForce, getAngleBetween(loop.body, loopChild) + Math.PI/2)
        // Body.applyForce(loopChild, loopChild.position, forceVector)
        Body.setVelocity(loopChild, 
          Matter.Vector.create(loopChild.velocity.x + forceVector.x, wallMoveSpeed + forceVector.y));
      })
      loop.children = spawnLoopChildren(loop);
    } 
    //scale = nextSize/currentSize | nextSize = Math.abs(sin(tracker))*maxFlux + baseSize
    function resizeLoop(loop){
      let absSine = Math.abs(Math.sin(loop.sineTracker));
      let nextSize = absSine*loop.maxFlux + loop.baseSize;
      let scale = nextSize/loop.currentSize;
      let isMaxSize = absSine >= Math.abs(Math.sin(loop.sineTracker - loop.sineInterval)) &&
          absSine > Math.abs(Math.sin(loop.sineTracker + loop.sineInterval))
      loop.currentSize = nextSize;
      loop.body.parts.forEach(part => {
        if(loop.body !== part){
          Body.scale(part, scale, scale);
        }
      })
      if(isMaxSize){
        loop.isPeakSize = true;
      }
      else{
        loop.isPeakSize = false;
      }
      // Body.scale(loop.body, scale, scale);
      loop.sineTracker += loop.sineInterval;
      // Composite.remove(engine.world, loop);
      // Composite.add(engine.world, loop);
    }
    function spawnLoopObstacles(){
      let wallFrequency = 2;
      if(isMobile){
        wallFrequency = 2;
      }
      if(wallTracker%wallFrequency === 0){
        let obstacleSize = size*Math.random()/4 + size/4;
        let xposSpawn = width*Math.random();
        let yposSpawn = height + 100; 
        let loopObstacle = createPulsingLoopObstacle(xposSpawn, yposSpawn, obstacleSize);
        addObstacle(loopObstacle.body);  
        loops.push(loopObstacle)
      }
    }
    function createPulsingLoopObstacle(xposSpawn, yposSpawn, obstacleSize, isCluster = false){
      let baseInterval = 32;
      let loopObstacle = {};
      loopObstacle.body = getLoop(xposSpawn, yposSpawn, obstacleFilter, obstacleSize, 0.001, 0.1, true, false, false) 
      loopObstacle.pulses = true;
      loopObstacle.isPeakSize = false;
      loopObstacle.isCluster = isCluster;
      loopObstacle.sineTracker = 0;
      loopObstacle.sineInterval = Math.PI/(baseInterval + getRandomInt(baseInterval));
      loopObstacle.currentSize = obstacleSize;
      loopObstacle.baseSize = obstacleSize;
      loopObstacle.maxFlux = size*Math.random()/4;
      if(isCluster){
        loopObstacle.sineInterval = Math.PI/(baseInterval*3 + getRandomInt(baseInterval)/2);
        loopObstacle.maxFlux = size/6 + size*Math.random()/16;
      }
      return loopObstacle;
    }
    
    function spawnSpoonObstacles(){
      let wallFrequency = 5;
      if(isMobile){
        wallFrequency = 5;
      }
      if(wallTracker%wallFrequency === 0){
        let maxSize = wallTracker/((obstacleSetNumber-3)*speed) >= 1 ? size*2/3 : size;
        let minSize = size/3;
        let obstacleSize = maxSize*Math.random()/2 + minSize;
        if(obstacleSize > size*0.5 || obstacleSize < size*0.05){
          obstacleSize = maxSize*Math.random()/2 + minSize;
        }
        if(obstacleSize > size*0.8){
          obstacleSize = maxSize*Math.random()/2 + minSize;
        }
        let xposSpawn = width*Math.random();
        //balancing huge spoon spawn
        if(obstacleSize > size*0.7){
          let xOffset = width*0.3*Math.random();
          xposSpawn = xOffset;
          if(getRandomInt(2) === 0){
            xposSpawn = width - xOffset;
          }
        }
        let yposSpawn = height + obstacleSize*3.5; 
        let spoonWallSpawn = [xposSpawn, yposSpawn, height-(3*obstacleSize)+100];

        let spoonObstacle = getSpoon(obstacleSize*5, xposSpawn, yposSpawn, obstacleFilter)
        
        Body.setCentre(spoonObstacle, Matter.Vector.create(spoonWallSpawn[0], spoonWallSpawn[1]-obstacleSize/10), false);
        let angle = Math.random(90)-45;
        //flip is spoon head down randomly or if spoon is big to avoid weird load ins
        if(obstacleSize > size*0.5 || getRandomInt(2) === 0){
          angle += 180;
        }
        //balancing huge spoon obstacle spawn angle 
        if(obstacleSize > size*0.8){
          angle = 160;
          if(getRandomInt(2) === 0){
            angle = 160.5;
          }
        }
        Body.setAngle(spoonObstacle, angle);
        //Body.setDensity(spoonObstacle, 10);
        spoonObstacle.frictionAir = 0.001;
        //only smaller spoons can spin
        if(Math.random()*2 < 1 && obstacleSize < size*0.4){
          Body.setAngularVelocity(spoonObstacle, ((obstacleSize-Math.random()*obstacleSize)/600)*(getRandomInt(3)-1))
        }
        addObstacle(spoonObstacle);
      }
    }

    function spawnShootingLoops(){
      let wallFrequency = 10;
      // if(isMobile){
      //   wallFrequency = 5;
      // }
      if(wallTracker%wallFrequency === 0){
        let loopSpawnX = gameWidth*Math.random() + leftMargin;
        let loopSpawnY = height + size;
        // let loopCluster = {xpos: loopSpawnX, ypos: loopSpawnY};
        let obstacleSize = size/5 + Math.random()*size/5
        
        let loopCluster = createPulsingLoopObstacle(loopSpawnX, loopSpawnY, obstacleSize, true);
        loopCluster.body.isLoop = true;
        loops.push(loopCluster);
        loopCluster.children = spawnLoopChildren(loopCluster)
        addObstacle(loopCluster.body);
      }
    }
    function spawnLoopChildren(loopCluster){
      let loopChildren = []
      let angleVariance = Math.PI/6;
      let xpos = loopCluster.body.position.x;
      let ypos = loopCluster.body.position.y;
      let offset = loopCluster.baseSize*3/2;
      let loopChildHeightMap = new Map();
      for(let i = 0; i <= Math.PI; i += Math.PI/3){
        let loopAngle = i;
        if(i % Math.PI !== 0){
          loopAngle += angleVariance- 2*angleVariance*Math.random()
        }
        let loopChild = getLoop(xpos + Math.cos(loopAngle)*offset, ypos - Math.sin(loopAngle)*offset, 
          obstacleFilter, loopCluster.baseSize/2, 0.001, 0.1, true, false, false, loopCluster.body.color)
        loopChild.angle = loopAngle;
        loopChildren.push(loopChild)
        loopChildHeightMap.set(loopChild, ypos - Math.sin(loopAngle)*offset)
      }
      //need to add in order so deletes correctly
      const sortedChildren = new Map(
        [...loopChildHeightMap.entries()].sort((a, b) => a[1] - b[1])
      );
      sortedChildren.keys().forEach(loopChild =>{
        addObstacle(loopChild);
      })
      return loopChildren;
    }
    function restartGame(){
      if (resettable === true){
        resettable = false;
        allWalls.forEach(element =>{
            Composite.remove(engine.world, element);
        })
        clearScreen();
        changeObstacle();
        points = 0;
        setScoreText(points);            // reset score
        wallTracker = 0;
        speed = initialSpeed;
        ragdoll = false;
        let resetPos = Matter.Vector.create(curSpoon.position.x, height/4);
        Body.setPosition(curSpoon, resetPos);
        startGame();
      }
    }
    function startRestart(){
      if(!gameStarted && !resettable){startGame()}
      else{
        restartGame();
      }
      setPlayButtonText("Restart")
    }
    function getPopupMessage(isStart){
      if(isStart){
        return "A spoon has been dropped."
      }
      let message;
      if(points >= 2500){
        message = "Well that's deep.";
      }
      else message = "The spoon descends no longer...";
      return message;
    }
    let startMessage = getPopupMessage(true);
    setMessage(startMessage);
    setScoreText("Click or tap to guide the spoon's descent.")
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
      <div className="notscene">
      <div>
          <GameOver message={message} scoreText={scoreText} visible={gameOverState} 
          onRestart={() => restartRef.current()} playButtonText={playButtonText} />
      </div>
      <canvas ref={canvasRef} />
      <Link to="/games"><button className='back-button' 
      style={{ display: gameOverState ? "none" : "block" }} ></button></Link>
      <div id="menutext">
        <p id="dropper">Descent</p>
        <p id="descenttut"className="droppertext"></p>
      </div>
    </div>
  )
  
  
};

export default SpoonDropDescent;