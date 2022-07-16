import React from 'react';
import Matter from "matter-js";
import "./spoondrop.css";
import { Link } from 'react-router-dom';

class SpoonDropGameSpeed extends React.Component {

  
  componentDidMount() {
    var Engine = Matter.Engine,
      Render = Matter.Render,
      Composite = Matter.Composite,
      Bodies = Matter.Bodies,
      Body = Matter.Body,
      Mouse = Matter.Mouse,
      MouseConstraint = Matter.MouseConstraint;
      document.getElementById("speedclickdisplay").innerText = "Endurance test:\nHow many spoons can you drop in \n15s";




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


    var width = window.innerWidth;
    var height = window.innerHeight;
    var hatch = Bodies.rectangle(width/2, height*4/5, width/2, 50, {isStatic: true} ),
        sideL = Bodies.rectangle(width*3/4, height*1/20, 50, height*3/2, {isStatic: true}),
        sideR = Bodies.rectangle(width*1/4, height*1/20, 50, height*3/2, {isStatic: true});

    //hatch.axes = Matter.Axes.fromVertices({x: width/4, y: height*4/5})

    Composite.add(engine.world, [ hatch, sideL, sideR]);

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
    
 
    var seconds = 1;
    var spoonCount = 0;
    var countingUp = false; 
    var curSpoon;
    var allSpoons = [];
    var gameRunning = false;
    var gameStartable = true;
    var hatchPresent = true;
    Matter.Events.on(mouseConstraint, "mousedown", function(event) {
      //start timer
      //console.log("spoon count = " + spoonCount);
      //console.log("game running = " + gameRunning);
      if(!gameRunning){
        resetGame();
      }
      if (gameStartable){
        gameRunning = true;
        gameStartable = false;
        let timer = setInterval(function() {
          if(document.getElementById("speedclickdisplay") === null){
            clearInterval(timer);
          }
          else{
            seconds--;
            if(seconds>0){
              
                document.getElementById("speedclickdisplay").innerText = seconds;
              
            }
            // If the count down is over, write some text
            
            if (seconds < 0 && countingUp === false) {
              countingUp = true;
              let countUp = 0;
              //spoon tally
              var counter = setInterval(function(){
                if(document.getElementById("speedclickdisplay") === null){
                  clearInterval(counter);
                }
                else{
                  if(countUp < spoonCount && countingUp){
                    countUp++;
                    document.getElementById("speedclickdisplay").innerHTML = countUp;
                  }
                  if(countUp === spoonCount && countingUp){
                    countingUp = false;
                    document.getElementById("speedclickdisplay").innerHTML = "Nice! You dropped " + countUp + " spoons!";
                    document.getElementById("restart").innerHTML = "click anywhere to restart";
                    clearInterval(counter);
                    clearInterval(timer);
                    gameRunning = false;
                  
                  }
                }
              }, 50);
              Matter.Body.setStatic(hatch, false);
              hatchPresent = false;
            }
          }
        }, 1000);
      }


      var size = 100,
      x = mouse.position.x,
      y = mouse.position.y,
      partA1 = Bodies.circle(x, y-(3*size/5), size/5),
      partA2 = Bodies.circle(x, y-(3*size/5)-2, size/5,
      { render: partA1.render }
      ),
      partA3 = Bodies.circle(x, y-(3*size/5)-4, size/5,
      { render: partA1.render }
      ),
      partA4 = Bodies.circle(x, y-(3*size/5)-6, size/5,
      { render: partA1.render }
      ),
      partB = Bodies.trapezoid(x, y, size / 5, size, 0.4, { render: partA1.render });
      curSpoon = Body.create({
        parts: [partA1, partA2, partA3, partA4, partB],
      });
      if(seconds>0){
        spoonCount++;
        allSpoons.push(curSpoon);
        Composite.add(engine.world, curSpoon);
      }

    });
    
    function resetGame(){
      spoonCount = 0;
      seconds = 15;
      countingUp = false;
      gameStartable = true; 
      allSpoons.forEach(element =>{
        Composite.remove(engine.world, element);
      })
      document.getElementById("restart").innerHTML = "";
      if(!hatchPresent){
        hatch = Bodies.rectangle(width/2, height*4/5, width/2, 50, {isStatic: true} );
        Composite.add(engine.world, hatch);
      }
    }

    Matter.Runner.run(engine);

    Render.run(render);
  }

  render() {
    return (
      <div ref="scene" className="scene">
        <div id="menutext">
        <Link to="/spoondropMenu"><button className='back-button'></button></Link>
          <p id="speedclickdisplay">Endurance test: How many spoons can you drop in 15s</p>
          <p id="restart"></p>
        </div>
      </div>
      );
  }
}
export default SpoonDropGameSpeed;