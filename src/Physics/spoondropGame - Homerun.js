import React from "react";
import Matter, { Bounds, Vertices } from "matter-js";



class SpoonDropGame extends React.Component {


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

    
  
    var ballB = Bodies.circle(500, 500, 500, {
      restitution: 0.5,
      isStatic: true,
      collisionFilter: {
        group: backgroundCircle,
        mask: spoons 
      }});
    
    var backgroundCircle = 0x0001,
        spoons = 0x0002,
        spoonContainer = 0x0004;

    
    var ballA = Bodies.circle(500, 500, 600, { 
      restitution: 0.5,
      isStatic: true ,
      collisionFilter: {
        group: spoonContainer,
        mask: backgroundCircle 
      }
    });
  

    var width = window.innerWidth;
    var height = window.innerHeight;

  

    //Composite.add(engine.world, [ballB]);
    Composite.add(engine.world, [ballA, ballB]);

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

    Matter.Events.on(mouseConstraint, "mousedown", function(event) {
      //var poly = Bodies.polygon(200, 200, 100, 10);
      var size = 100,
      x = mouse.position.x,
      y = mouse.position.y,
      //poly = Bodies.polygon(200, 200, 100, 50),
      partA = Bodies.circle(x, y-(3*size/5), size/5),
      partB = Bodies.trapezoid(x, y, size / 5, size, 0.4, { render: partA.render });
      var compoundBodyA = Body.create({
        parts: [partA, partB],
        collisionFilter: {
          group: spoons,
          mask: backgroundCircle
        }
      });
      Composite.add(engine.world, compoundBodyA);
    });

    Matter.Runner.run(engine);

    Render.run(render);
  }

  render() {
    return <div ref="scene" />;
  }
}
export default SpoonDropGame;