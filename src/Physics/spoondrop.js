import React from "react";
import Matter from "matter-js";



class SpoonDrop extends React.Component {


  componentDidMount() {
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

    var size = 100; //size var for spoon
    if(width < 800){
      size = 50;
    }

    Composite.add(engine.world, [
      // walls
      Bodies.rectangle(width/6, height, width/2, 50, { isStatic: true }),
      Bodies.rectangle(5*width/6, height, width/2, 50, { isStatic: true }),
      Bodies.rectangle(2*width/3, 0, 50, height/2, { isStatic: true }),
      Bodies.rectangle(width/3, 0, 50, height/2, { isStatic: true })
    ]);

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

    //create spoon
    
    Matter.Events.on(mouseConstraint, "mousedown", function(event) {
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