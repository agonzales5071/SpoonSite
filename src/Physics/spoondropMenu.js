import React from "react";
import Matter from "matter-js";



class SpoonDropMenu extends React.Component {


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
    const links = ["/spoondrop", "/spoondropGameSpeed", "/spoondropHomerun", "/"]
    var routes = links.length;
    var hatches  = []; //list of bodies that need to be checked for collision
    var spoons = [];
    //need to make at least width of spoon top
    //returns array of bodies that make up route number buckets
    function buckets(){
      var h = height/6,
      w = width/(routes*2),
      result = [];
      for(let x = 0; x < routes; x++){
        let xpos = w*((2*x)+1),
        ypos = height*2/3 + height/5;
        let hatch = Bodies.rectangle(xpos, ypos, w, size/2, {isStatic: true}) //bottom
        hatches.push(hatch);
        result.push(hatch);
        result.push(Bodies.rectangle(xpos+(w/2), ypos - h/2, size/5, h, {isStatic: true})); //right
        result.push(Bodies.rectangle(xpos-(w/2), ypos - h/2, size/5, h, {isStatic: true})); //left\
        if(x < routes-1){
          let x = xpos + w,
          y = height/3,
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
          partB = Bodies.trapezoid(x, y, size / 5, size, 0.4, { render: partA1.render }),
          sidespoon = Body.create({parts: [partA1, partA2, partA3, partA4, partB]});
          result.push(sidespoon);
          spoons.push(sidespoon);

        }
      }
      return result;
    }

    Composite.add(engine.world, buckets());
    spoons.forEach(element => {
      Body.setAngle(element, Math.PI);
    });
    //drop two spoons


    console.log(hatches);
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

    var curSpoon;
    var trapBody;
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
      trapBody = partB.id;
      curSpoon = Body.create({
        parts: [partA1, partA2, partA3, partA4, partB]
      });

      Composite.add(engine.world, curSpoon);
    });

    //collision detection attempt
    
    // Matter.Events.on(mouseConstraint, "mouseup", function(event){
    //   //checks distance every .1 seconds
    //   var x = setInterval(function() {
    //     if(curSpoon.position.y < height*8/9){
    //       hatches.forEach(function(element, index){
    //         hit = collision.collides(element, curSpoon);
    //         console.log(hit);
    //         if(null == hit){}
    //         else{
    //           let goto = links[index];
    //           window.location.href = goto;
    //         }
    //       });
    //     }
    //   }, 1000);

    // });
    Matter.Events.on(engine, "collisionStart", function(event) {
      let collisionArray = event.source.pairs.collisionActive;
      for(let j = 0; j < collisionArray.length; j++){
        let bodyA = event.pairs[0].bodyA.id;
        let bodyB = event.pairs[0].bodyB.id;
        console.log(event);
        if(bodyA === trapBody){
          for(let i = 0; i < links.length; i++){
            if(bodyB === hatches[i].id){
              console.log(links[i])
              window.location.href = links[i];
            }
          }
        }
        else{
          if(bodyB === trapBody){
            for(let i = 0; i < links.length; i++){
              if(bodyA === hatches[i].id){
                window.location.href = links[i];
              }
            }
          }
        }
      }
    });

    Matter.Runner.run(engine);
    Render.run(render);
  }


  render() {
    return <div ref="scene">
      <p id="explan">drop a spoon to navigate</p>
      <p id="navs">1:Freeplay 2:SpeedTest 3:Homerun 4:Home </p>
    </div>;
  }
}
export default SpoonDropMenu;