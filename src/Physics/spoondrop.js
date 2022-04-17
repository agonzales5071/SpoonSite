import React from "react";
import Matter from "matter-js";



class SpoonDrop extends React.Component {


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
  
    var ballA = Bodies.circle(210, 100, 30, { restitution: 0.5 });
    var ballB = Bodies.circle(110, 50, 30, { restitution: 0.5 });
    var size = 200,
    x = 200,
    y = 200,
    partA = Bodies.rectangle(x, y, size, size / 5),
    partB = Bodies.rectangle(x, y, size / 5, size, { render: partA.render });

    var compoundBodyA = Body.create({
      parts: [partA, partB]
    });

    var width = window.innerWidth;
    var height = window.innerHeight;

    Composite.add(engine.world, [
      // walls
      Bodies.rectangle(width/6, height, width/2, 50, { isStatic: true }),
      Bodies.rectangle(5*width/6, height, width/2, 50, { isStatic: true }),
      Bodies.rectangle(2*width/3, 0, 50, height/2, { isStatic: true }),
      Bodies.rectangle(width/3, 0, 50, height/2, { isStatic: true })
    ]);

    Composite.add(engine.world, [ballA, ballB, compoundBodyA]);

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
      r = Math.random()*255,
      g = Math.random()*255,
      b = Math.random()*255,
      //poly = Bodies.polygon(200, 200, 100, 50),
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
      var compoundBodyA = Body.create({
        parts: [partA1, partA2, partA3, partA4, partB]
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
export default SpoonDrop;