import React from "react";
import Matter, { Bounds, Vertices } from "matter-js";



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

    var width = window.innerWidth;
    var height = window.innerHeight;

    //second circle rendered
    var ballB = Bodies.circle(width/5, height*3/4, 500, {
      restitution: 0.5,
      isStatic: true,
      collisionFilter: {
        group: backgroundCircle,
        mask: spoons 
      }});
    
    var backgroundCircle = 0x0001,
        spoons = 0x0002,
        spoonContainer = 0x0004;

    //first circle rendered
    var ballA = Bodies.circle(width/5, height*3/4, 600, { 
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
    //Spoon creation
    Matter.Events.on(mouseConstraint, "mousedown", function(event) {
      //var poly = Bodies.polygon(200, 200, 100, 10);
      var size = 100,
      x = mouse.position.x,
      y = mouse.position.y,
      //poly = Bodies.polygon(200, 200, 100, 50),
      partA = Bodies.circle(x, y-(3*size/5), size/5),
      partB = Bodies.trapezoid(x, y, size / 5, size, 0.4, { render: partA.render });
      curSpoon = Body.create({
        parts: [partA, partB],
        collisionFilter: {
          group: spoons,
          mask: backgroundCircle
        }
      });
      Composite.add(engine.world, curSpoon);
    });


    //distance display and calc
    Matter.Events.on(mouseConstraint, "mouseup", function(event){
      //checks distance every .1 seconds
      var x = setInterval(function() {
        if(curSpoon.position.y < height*8/9){
          var display = (Math.round(100*(curSpoon.position.x-width/2))/100).toFixed(2);
          //commentary
          if(Math.abs(display) > 20000){document.getElementById("demo").innerHTML = "WHOA! You dropped the spoon " + display + "m away";}
          else{document.getElementById("demo").innerHTML = "Nice! You dropped the spoon " + display + "m away";}
        }
      }, 100);

    });

    Matter.Runner.run(engine);
    Render.run(render);
  }

  render() {
    return <div ref="scene">
    <p id="demo">Drag a spoon into the circle and let it fly! Or just toss it...</p>
  </div>;
  }
}
export default SpoonDropHomerun;