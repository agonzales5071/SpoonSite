import React from 'react';
import Matter from "matter-js";



class SpoonDropGameSpeed extends React.Component {


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

    var backgroundCircle = 0x0001,
    spoons = 0x0002,
    plsCollide = 1;
  
    // var backBall = Bodies.rectangle(500, 700, 60, 20, {
    //   restitution: 0.5,
    //   isStatic: true,
    //   collisionFilter: {
    //     group: plsCollide,
    //     category: backgroundCircle,
    //     mask: spoons 
    //   }});
    


    
    // var frontBall = Bodies.circle(500, 500, 500, { 
    //   restitution: 0.5,
    //   isStatic: true ,
    //   collisionFilter: {
    //     category: spoonContainer,
    //     mask: backgroundCircle 
    //   }
    // });
  

    var width = window.innerWidth;
    var height = window.innerHeight;
    var hatch = Bodies.rectangle(width/2, height*4/5, width/2, 50, {isStatic: true} ),
        sideL = Bodies.rectangle(width*3/4, height*1/20, 50, height*3/2, {isStatic: true}),
        sideR = Bodies.rectangle(width*1/4, height*1/20, 50, height*3/2, {isStatic: true});

    //hatch.axes = Matter.Axes.fromVertices({x: width/4, y: height*4/5})

    //Composite.add(engine.world, [ballB]);
    Composite.add(engine.world, [ hatch, sideL, sideR
      // backBall, frontBall, 
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
    
 
    var seconds = 15;
    var spoonCount = 0;
    var countingUp = false; 
    var curSpoon;
    Matter.Events.on(mouseConstraint, "mousedown", function(event) {
      //start timer
      if (spoonCount === 0){
        
        let timer = setInterval(function() {

          seconds--;
          if(seconds>0){
            document.getElementById("speedclickdisplay").innerHTML = seconds;
          }
          // If the count down is over, write some text
          
          if (seconds < 0 && countingUp === false) {
            countingUp = true;
            var countUp = 0;
            //spoon tally
            var counter = setInterval(function(){
              if(countUp < spoonCount && countingUp){
                countUp++;
                document.getElementById("speedclickdisplay").innerHTML = countUp;
              }
              if(countUp === spoonCount && countingUp){
                countingUp = false;
                document.getElementById("speedclickdisplay").innerHTML = "Nice! You dropped " + countUp + " spoons!";
                clearInterval(counter);
                clearInterval(timer);
              
              }
            }, 50);
            Matter.Body.setStatic(hatch, false);
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
        collisionFilter: {
          category: spoons,
          group: plsCollide,
          mask: backgroundCircle
        }
      });
      if(seconds>0){
        spoonCount++;
        Composite.add(engine.world, curSpoon);
      }
    });


    
      

    



    
    Matter.Runner.run(engine);

    Render.run(render);
  }

  render() {

    return <div ref="scene">
      <p id="speedclickdisplay">Endurance test! How many spoons can you drop in 15s</p>
    </div>;
  }
}
export default SpoonDropGameSpeed;