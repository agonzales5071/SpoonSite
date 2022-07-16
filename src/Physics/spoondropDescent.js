import React from "react";
import Matter from "matter-js";
import './spoondrop.css';
import { Link } from 'react-router-dom';

//bug fixes
//same name chat room join, back buttons, 

class SpoonDropDescent extends React.Component {


  componentDidMount() {
    this.initializeGame();
  }

  initializeGame(){
    
    var allWalls = []; 
    var isMobile = false;
    var width = window.innerWidth;
    var height = window.innerHeight;
    var Engine = Matter.Engine,
      Render = Matter.Render,
      Composite = Matter.Composite,
      Bodies = Matter.Bodies,
      Body = Matter.Body,
      Mouse = Matter.Mouse,
      MouseConstraint = Matter.MouseConstraint;

    var engine = Engine.create({
      // positionIterations: 20
    });

    var render = Render.create({
      element: this.refs.scene,
      engine: engine,
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
      restartGame();
      resettable = false;
      startGame();      
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
      
        allWalls.forEach(element => {
          Body.setStatic(element, true);
        });
        gameStarted = false;
        resettable = true;
        //Body.setStatic(curSpoon, true);
        ragdoll = true;
        clearInterval(spawnwalls);
        if( document.getElementById('descenttut') !== null){
          document.getElementById("descenttut").innerHTML = "Nice! Touch anywhere to try again!";
        }
        
      
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
            spoonWalls = false;
            if(points > 0){
              //console.log("may switch here");
              defaultWalls = false;
              //spawn special obstacle sets
              let spawnset = getRandomInt(4);
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
            if(oneType){
              spoonWalls = false;
              closeWalls = false;
              defaultWalls = false;
              wallTracker++;
            }
          }
          if(spoonWalls){
            spawnSpoonWalls();
          }
          if(closeWalls){
            //console.log("closewalls spawning");
            //TODO:code new obstacle set
            spawnCloseWalls();
          }
          if(defaultWalls){
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
      let offset = Math.random()*(gameWidth/3) - gameWidth/6 + leftMargin;
      if(Math.random()*10 < 7 && points > 0){
        offset = Math.random()*(gameWidth/2) - gameWidth/4 + leftMargin;
      }
        pos = prevCenter + offset;
        if(pos < width/25){
          pos = width/25;
        }
        if(pos > width-(width/25)){
          pos = width-(width/25);
        }
        prevCenter = pos;
      return pos;
    }
    function spawnDefaultWalls(){
      if(wallTracker%speed === 0){
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
        pos = prevCenter + offset;
        if(pos < width/25){
          pos = width/25;
        }
        if(pos > width-(width/25)){
          pos = width-(width/25);
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
        if(obstacleSize > size*0.5){
          obstacleSize = size*Math.random();
        }
        let spoonWallSpawn = [width*Math.random(), height+100, height-(3*obstacleSize)+100];
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
        if(getRandomInt(2) === 0){
          angle += 180;
        }
        Body.setAngle(spoonObstacle, angle);
        //Body.setDensity(spoonObstacle, 10);
        spoonObstacle.frictionAir = 0.001;
        if(Math.random()*2 < 1){
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

    // function isSpoonCollision(event){
    //   let spoonCollided = false;
    //   let collisionArray = event.source.pairs.collisionActive;
    //   for(let j = 0; j < collisionArray.length; j++){
    //     let bodyA = event.pairs[0].bodyA.id;
    //     let bodyB = event.pairs[0].bodyB.id;
    //     //console.log(event);
    //     if(bodyA === trapBody || bodyA === spoonTop || bodyB === trapBody || bodyB === spoonTop){
    //       spoonCollided = true;
    //       }
    //     }
        
    //   return spoonCollided;
    //   }
    

    function restartGame(){
      if (resettable === true){
        allWalls.forEach(element =>{
            Composite.remove(engine.world, element);
        })
        points = 0;
        wallTracker = 0;
        speed = initialSpeed;
        ragdoll = false;
        let resetPos = Matter.Vector.create(curSpoon.position.x, spoonstart[1]);
        Body.setPosition(curSpoon, resetPos);
      }
    }


    Matter.Runner.run(engine);
    Render.run(render);
  }



  render() {
    return (
    <div ref="scene" className="notscene">
      <Link to="/spoondropMenu"><button className='back-button' onClick={console.log("button pressed")}></button></Link>
      <div id="menutext">
        <p id="dropper">click or tap to drop a spoon</p>
        <p id="descenttut"className="droppertext">guide its way down!</p>
      </div>
    </div>
    );
  }
}

export default SpoonDropDescent;