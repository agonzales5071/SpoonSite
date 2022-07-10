import React from "react";
import Matter from "matter-js";
import './spoondrop.css';

//bug fixes
//same name chat room join, back buttons, 

class SpoonDropDescent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      resetting: false,
      gameStarted: false,
      composite: Matter.Composite
        };
  }

  componentDidMount() {
    this.initializeGame(false);
  }
  componentDidUpdate() {
    if(this.state.resetting === true){
      this.setState({resetting: false});
      this.initializeGame(true);
      document.getElementById("dropper").innerHTML = "pooper";
    }
  }
  initializeGame( reset ){
    
    var allWalls = []; 
    console.log("reset value is " + reset);
     if(reset){
        allWalls.forEach(element =>{
          Composite.remove(engine.world, element);
        })

      }
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
        height: window.innerHeight,
        wireframes: false
      }
    });

    
    var force = 0.02;
    var fric = 0.03;
    var turnaround = 0.8;
    var size = 100; //size var for spoon
    //mobile augmentations
    if(width < 800){
      size = 50;
      force = 0.002;
      fric = 0.03
      turnaround = 0.8;
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
    });

    //collision detection attempt
    
    Matter.Events.on(mouseConstraint, "mouseup", function(event){
      clearInterval(movement);
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
      document.getElementById("descenttut").innerHTML = "Nice! Touch anywhere to try again!";
      
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
    var initialSpeed = 15;
    var ragdoll = false;
    var spawnwalls;
    var points = 0;
    var wallTracker = 0;
    var speed = initialSpeed;
    var wallMoveSpeed = -5;
    //var simplified = false; 
    function startGame() {
      if(gameStarted === false){
        
        gameStarted = true;
        
        document.getElementById('descenttut').innerHTML = "";

        //function to move spoon

        //function to spawn walls based on time elapsed
        spawnwalls = setInterval(function() {
          if(wallTracker%200 === 0){
            speed--;
            wallTracker = 0;
          }
          if(points%speed === 0){
            let center = Math.random()*width
            var walls = [
              Bodies.rectangle(center-size-width/2, height, width, size/2, { isStatic: false, frictionAir: 0, 
                collisionFilter: {
                  group:2,
                  category: 2, 
                  mask: 4
                }}),
              Bodies.rectangle(center+size+width/2, height, width, size/2, { isStatic: false, frictionAir: 0, 
                collisionFilter: {
                  group:2,
                  category: 2, 
                  mask: 4
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
          points++;
          wallTracker++;
          document.getElementById('dropper').innerHTML = points + "m fallen"
        }, 100);

      }
    }
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
  resetGame = () => {
    document.getElementById("dropper").innerHTML = "poop";
    //this.state.composite.clear(this.state.composite, false)
    this.setState({resetting: true});
  };


  render() {
    return (
    <div ref="scene">
      <div id="menutext">
        <p id="dropper">click or tap to drop a spoon</p>
        <p id="descenttut"className="droppertext">guide its way down!</p>
      </div>
    </div>
    );
  }
}

export default SpoonDropDescent;