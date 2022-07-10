import React from "react";
import Matter from "matter-js";
import './spoondrop.css';


class SpoonDropHomerun extends React.Component {


  componentDidMount() {
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


    var width = window.innerWidth,
    height = window.innerHeight,
    size = 100,
    backgroundCircle = 0x0001,
    spoons = 0x0002,
    spoonContainer = 0x0004;
    if(width < 600){
      size = 50;
    }
    //second circle rendered
    var ballB = Bodies.circle(width/5, height*3/4, size*5, {
      restitution: 0.5,
      isStatic: true,
      collisionFilter: {
        group: backgroundCircle,
        mask: spoons 
      }});
    


    //first circle rendered
    var ballA = Bodies.circle(width/5, height*3/4, size*6, { 
      restitution: 0.5,
      isStatic: true ,
      collisionFilter: {
        group: spoonContainer,
        mask: backgroundCircle 
      }
    });
    var ground = Bodies.rectangle(0, height*8/9, 1000*width, 50, {isStatic: true});
  
    Composite.add(engine.world, [ground, ballA, ballB]);

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

    var curSpoon;
    var spoonCount = 0;
    //Spoon creation
    Matter.Events.on(mouseConstraint, "mousedown", function(event) {
      //var poly = Bodies.polygon(200, 200, 100, 10);
      let x = mouse.position.x,
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
        parts: [partA1, partA2, partA3, partA4, partB]
      });
      spoonCount++;
      Composite.add(engine.world, curSpoon);
    });


    //distance display and calc
    var lastScore = -100000;
    Matter.Events.on(mouseConstraint, "mouseup", function(event){
      //checks distance every .1 seconds
      if(spoonCount > 0){
        var counter = setInterval(function() {
          if(curSpoon.position.y < height*8/9){
            //maybe makes the score smoother when it lands???
            let score = (Math.round(10000000*(curSpoon.position.x-width/2))/10000000).toFixed(7);
            let display = (Math.round(100*(curSpoon.position.x-width/2))/100).toFixed(2);
            if(score !== lastScore){//stops repeated refresh
              //commentary
              lastScore = score;
              if(Math.abs(display) > 20000){document.getElementById("homerundisplay").innerHTML = "WHOA! You dropped the spoon " + display + "m away";}
              else{document.getElementById("homerundisplay").innerHTML = "Nice! You dropped the spoon " + display + "m away";}
            }
            else{
              clearInterval(counter);
            }
          }
        }, 100);
      }
    });

    Matter.Runner.run(engine);
    Render.run(render);
  }

  render() {
    return <div ref="scene">
    <p id="homerundisplay">Drag a spoon into the circle and let it fly! Or just toss it...</p>
  </div>;
  }
}
export default SpoonDropHomerun;