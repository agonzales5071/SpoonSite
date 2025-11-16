import React, { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import './spoondrop.css';
import GameOver from "./util/gameoverPopup";
import { Link } from 'react-router-dom';

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
  const oopsAllSpoons = window.location.href.includes("Leo");
  console.log("oopsAllSpoons = " + oopsAllSpoons );
    
    var allWalls = []; 
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
    var leftMargin = 0;

    var force = 0.02;
    var fric = 0.03;
    var turnaround = 0.8;
    var size = 100; //size var for spoon
    //mobile augmentations
    if(width < 800){
      isMobile = true;
      size = 50;
      force = 0.002;
      fric = 0.03
      turnaround = 0.8;
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
    var curSpoon;
    var spoonstart = [width/2, height/4, (height/4)-(3*size/5)];

    let partA1 = Bodies.circle(spoonstart[0], spoonstart[2], size/5),
      partA2 = Bodies.circle(spoonstart[0], spoonstart[2]-2, size/5,
      { render: partA1.render }
      ),
      partA3 = Bodies.circle(spoonstart[0], spoonstart[2]-4, size/5,
      { render: partA1.render }
      ),
      partA4 = Bodies.circle(spoonstart[0], spoonstart[2]-6, size/5,
      { render: partA1.render }
      ),
      partB = Bodies.trapezoid(spoonstart[0], spoonstart[1], size / 5, size, 0.4, { render: partA1.render });
      //var spoonTop = partA1.id;
      //var trapBody = partB.id;
      curSpoon = Body.create({
        parts: [partA1, partA2, partA3, partA4, partB],
        collisionFilter: {
          group:2,
          category: 2, 
          mask: 4
        }
      });
    curSpoon.frictionAir = fric;
    Body.setCentre(curSpoon, Matter.Vector.create(spoonstart[0], spoonstart[1]-size/10), false);
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
        
      
      // let collisionArray = event.source.pairs.collisionActive;
      // for(let j = 0; j < collisionArray.length; j++){
      //   let bodyA = event.pairs[0].bodyA.id;
      //   let bodyB = event.pairs[0].bodyB.id;
      //   //console.log(event);
                

      //   //console.log(event);
      //   if(bodyA === trapBody || bodyA === spoonTop){
      //     for(let i = 0; i < allWalls.length; i++){
      //       if(bodyB === allWalls[i].id){
      //         clearInterval(spawnwalls);
      //         //console.log(links[i][0]);
      //       }
      //     }
      //   }
      //   else{
      //     if(bodyB === trapBody || bodyB === spoonTop){
      //       for(let i = 0; i < allWalls.length; i++){
      //         if(bodyA === allWalls[i].id){
      //           clearInterval(spawnwalls);
      //           //console.log(links[i][0]);
      //           //window.location.href = links[i][link];
      //         }
      //       }
      //     }
      //   }
      // }
    });
    var initialSpeed = 20;
    var ragdoll = false;
    var spawnwalls;
    var points = 0;
    var wallTracker = 0;
    var speed = initialSpeed;
    var wallMoveSpeed = -5;
    //var simplified = false; 
    var prevCenter = gameWidth/2;
    var defaultWalls = true;
    var closeWalls = false; //quickwalls
    var spoonWalls = false;
    var closeWallSet = 0;
    var spoonWallSet = 1;
    var speedChange = 0;
    var oneType = false;//for obstacle set debugging
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
          else if(wallTracker%(10*speed) === 0){
            speedChange++;
            if(speedChange === 2){
              speed--;
              speedChange = 0;
            }
            wallTracker = 0;
            defaultWalls = true;
            closeWalls = false;
            spoonWalls = oopsAllSpoons;
            if(points > 0){
              //console.log("may switch here");
              defaultWalls = false;
              if(oopsAllSpoons){
                spoonWalls = true;
                wallTracker++;
              }
              else{

                  //spawn special obstacle sets
                let spawnset = getRandomInt(3);
                if(spawnset === closeWallSet){
                  closeWalls = true;
                  wallTracker++;
                }
                else{
                  if(spawnset === spoonWallSet){
                    spoonWalls = true;
                    wallTracker++;
                  }
                  else{
                    defaultWalls = true;
                  }
                }
              }
            }
            if(oneType){
              spoonWalls = false;
              closeWalls = true;
              defaultWalls = false;
              wallTracker++;
            }
          }
          if(spoonWalls){
            spawnSpoonWalls();
          }
          else if(closeWalls){
            //console.log("closewalls spawning");
            //TODO:code new obstacle set
            spawnCloseWalls();
          }
          else if(defaultWalls){
            spawnDefaultWalls();
          }
          wallTracker++;
          points++;
          if( document.getElementById('dropper') === null){
            clearInterval(spawnwalls);
          }
          else{
            document.getElementById('dropper').innerHTML = points + "m fallen"
          }
        }, 100);
      }

    }
    // gets middle of obstacle
    function getNewCenter(){
      let pos;
      let offset = Math.random()*(gameWidth/3) - gameWidth/6;
      //chance for offset to be bigger
      if(Math.random()*10 < 7 && points > 0){
        offset = Math.random()*(gameWidth/2) - gameWidth/4;
      }
      //if offset is too small then reroll
      if(offset < gameWidth/10 && offset > gameWidth/(-10)){
        offset = Math.random()*(gameWidth/3) - gameWidth/6;
      }
        pos = prevCenter + offset;
        //console.log("pos = " + pos + " prevC = " + prevCenter + " offset = " + offset);
        if(pos < gameWidth/25){
          pos = gameWidth/25 + leftMargin;
        }
        if(pos > gameWidth-(width/25)){
          pos = gameWidth-(gameWidth/25 + leftMargin);
        }
        prevCenter = pos;
      return pos;
    }
    function spawnDefaultWalls(){
      if(wallTracker%speed === 0 && wallTracker > 10){
        let center = getNewCenter();

        let walls = [
          Bodies.rectangle(center-size-width/2, height + size + 100, width, size/2, { isStatic: false, frictionAir: 0, 
            collisionFilter: {
              group:-2,
              category: 4, 
              mask: 2
            }}),
          Bodies.rectangle(center+size+width/2, height + size + 100, width, size/2, { isStatic: false, frictionAir: 0, 
            collisionFilter: {
              group:-2,
              category: 4, 
              mask: 2
            }}),
            
        ]
        walls.forEach(element => {
          allWalls.push(element);
        })
        allWalls.forEach(element =>{
          if(element.position.y < -100){
            Composite.remove(engine.world, element);
          }
        })
        
        Composite.add(engine.world, walls);
        walls.forEach(element => {
          Body.setVelocity(element, Matter.Vector.create(0, wallMoveSpeed));
        })
      }
    }
    function getCloseWallsCenter(){
      let pos;
      let offsetFactor = gameWidth/15;
      if (isMobile){
        offsetFactor = width/6;
      }
      let offset = Math.random()*(offsetFactor) - offsetFactor/2;
      //reroll if small
      if(offset < offsetFactor/5 && offset > offsetFactor/(-5)){
        offset = Math.random()*(offsetFactor) - offsetFactor/2;
      }
        pos = prevCenter + offset;
        if(pos < gameWidth/25){
          pos = gameWidth/25 + leftMargin - offset;
        }
        if(pos > gameWidth-(width/25)){
          pos = gameWidth-(gameWidth/25 + leftMargin) - offset;
        }
      return pos;
    }
    function spawnCloseWalls(){
      if(wallTracker%3 === 0){
        let center = getCloseWallsCenter();
        prevCenter = center;
        let thickness = 1.5;
        let walls = [
          Bodies.rectangle(center-size-width/2, height+size+100, width, size*thickness, { isStatic: false, frictionAir: 0, 
            collisionFilter: {
              group:-2,
              category: 4, 
              mask: 2
            }}),
          Bodies.rectangle(center+size+width/2, height+size+100, width, size*thickness, { isStatic: false, frictionAir: 0, 
            collisionFilter: {
              group:-2,
              category: 4, 
              mask: 2
            }}),
        ]

        walls.forEach(element => {
          allWalls.push(element);
        })
        allWalls.forEach(element =>{
          if(element.position.y < -100){
            Composite.remove(engine.world, element);
          }
        })
        
        Composite.add(engine.world, walls);
        walls.forEach(element => {
          Body.setVelocity(element, Matter.Vector.create(0, wallMoveSpeed));
        })
        //end obstacle
        if(wallTracker === 0){
          closeWalls = false;
        }
      }
    }
    function spawnSpoonWalls(){
      let wallFrequency = 5;
      if(isMobile){
        wallFrequency = 5;
      }
      if(wallTracker%wallFrequency === 0){
        let obstacleSize = size*Math.random();
        if(obstacleSize > size*0.5 || obstacleSize < size*0.05){
          obstacleSize = size*Math.random();
        }
        if(obstacleSize > size*0.8){
          obstacleSize = size*Math.random();
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
        let spoonWallSpawn = [xposSpawn, height+100, height-(3*obstacleSize)+100];
        let spoonHeadOffset = obstacleSize/10; 

        let partA1 = Bodies.circle(spoonWallSpawn[0], spoonWallSpawn[2], obstacleSize,
          {collisionFilter: {
            group:-2,
            category: 4, 
            mask: 2
          }
        }),
          partA2 = Bodies.circle(spoonWallSpawn[0], spoonWallSpawn[2]-spoonHeadOffset, obstacleSize,
          { render: partA1.render,
            collisionFilter: partA1.collisionFilter}
          ),
          partA3 = Bodies.circle(spoonWallSpawn[0], spoonWallSpawn[2]-(2*spoonHeadOffset), obstacleSize,
          { render: partA1.render,
            collisionFilter: partA1.collisionFilter}
          ),
          partA4 = Bodies.circle(spoonWallSpawn[0], spoonWallSpawn[2]-(3*spoonHeadOffset), obstacleSize,
          { render: partA1.render,
            collisionFilter: partA1.collisionFilter}
          ),
          partB = Bodies.trapezoid(spoonWallSpawn[0], spoonWallSpawn[1], obstacleSize, obstacleSize*5, 0.4, { render: partA1.render });
          //var spoonTop = partA1.id;
          //var trapBody = partB.id;
        let spoonObstacle = Body.create({
          parts: [partA1, partA2, partA3, partA4, partB],
          collisionFilter: partA1.collisionFilter
        });
        allWalls.push(spoonObstacle);
        allWalls.forEach(element =>{
          if(element.position.y < -100){
            Composite.remove(engine.world, element);
          }
        })
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
        Composite.add(engine.world, spoonObstacle);
          
        //Body.setCentre(spoonObstacle, Matter.Vector.create(spoonWallSpawn[0], spoonWallSpawn[1]-size/10), false);
      }
      //move the spoons
      allWalls.forEach(element =>{
        Body.setVelocity(element, Matter.Vector.create(0, wallMoveSpeed));
        })
    }

    function restartGame(){
      if (resettable === true){
        resettable = false;
        allWalls.forEach(element =>{
            Composite.remove(engine.world, element);
        })
        points = 0;
        setScoreText(points);            // reset score
        wallTracker = 0;
        speed = initialSpeed;
        ragdoll = false;
        let resetPos = Matter.Vector.create(curSpoon.position.x, spoonstart[1]);
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