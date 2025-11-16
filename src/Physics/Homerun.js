import { useEffect, useRef } from 'react'
import Matter from "matter-js";
import './spoondrop.css';
import { Link } from 'react-router-dom';

const SpoonDropHomerun = () => {
  const boxRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
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

    let render = Render.create({
      element: boxRef.current,
      engine: engine,
      canvas: canvasRef.current,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
      },
    });


    var size = 100,
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
            if(score !== lastScore && document.getElementById("homerundisplay") !== null){//stops repeated refresh
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

    Runner.run(runner, engine)
    Render.run(render);
  });

  
    return (
    <div className="scene">
      <canvas ref={canvasRef} />
      <Link to="/games"><button className='back-button'></button></Link>
      <div id="menutext">
        <p id="homerundisplay">Drag a spoon into the circle and let it fly! Or just toss it...</p>
      </div>
    </div>
    );
  
}
export default SpoonDropHomerun;