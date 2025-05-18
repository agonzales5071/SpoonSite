import { useEffect, useState, useRef } from 'react'
import Matter from 'matter-js'
import './spoondrop.css';



const STATIC_DENSITY = 15


const SpoonDropMenu = () => {
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
      var size = 100; //size var for spoon
      if(width < 800){
        size = 50;
      }
      const links = [["/spoondrop", "Freeplay", "#FF9CEE", "#8C00FC"],
      ["/spoondropGameSpeed", "SpeedClick", "#FFF5BA", "#74EE15"], 
      ["/spoondropHomerun", "Homerun", "#AFCBFF", "#006FFF"], 
      ["/spoondropDescent", "Descent",  "#FCBFC6"],
      ["/", "Home", "#BFFCC6", "#FF6701"]];
      const link = 0;
      const name = 1;
      var theme = 2;// value of 2 or greater
      var routes = links.length;
      var hatches  = []; //list of bodies that need to be checked for collision
      var spoons = [];  
    
      function buckets(){
        var h = height/6,
        w = width/(routes*2),
        result = [];
        for(let x = 0; x < routes; x++){
          let xpos = w*((2*x)+1),
          ypos = height*2/3 + height/5;
          //spacing layered buckets (doesn't work with even numbers yet)
          if (routes > 4){
            w = width/((Math.floor(routes/2) + 1)*2)
            if(x < Math.floor(routes/2)){
              xpos+= w+ w/4;
              ypos = height/3 + height/4;
            }
            else{
              xpos = w*((2*(x-Math.floor(routes/2))+1));
            }
            //console.log("width=" + width);
            //console.log("hatch " + x + ": xpos=" + xpos + " w=" + w );
          }
          if(x < routes){
            //let spawnx = xpos + w,
            let spawnx = xpos,
            y = height/3,
            partA1 = Bodies.circle(spawnx, y-(3*size/5), size/5),
            partA2 = Bodies.circle(spawnx, y-(3*size/5)-2, size/5,
            { render: partA1.render }
            ),
            partA3 = Bodies.circle(spawnx, y-(3*size/5)-4, size/5,
            { render: partA1.render }
            ),
            partA4 = Bodies.circle(spawnx, y-(3*size/5)-6, size/5,
            { render: partA1.render }
            ),
            partB = Bodies.trapezoid(spawnx, y, size / 5, size, 0.4, { render: partA1.render }),
            sidespoon = Body.create({parts: [partA1, partA2, partA3, partA4, partB], collisionFilter:{group: 1, category: 2, mask: 4}});
            
            result.push(sidespoon);
            spoons.push(sidespoon);
    
          }
          let hatch = Bodies.rectangle(xpos, ypos, w, size/2, {isStatic: true, 
            render: {fillStyle: links[x][theme]}
          }) //bottom
    
          //create and style navigation text 
          let location = document.createElement('p');
          location.id = links[x][name];
          location.class = "locations";
          location.style.color = links[x][theme];
          location.innerHTML = links[x][name];
          document.getElementById("menudisplay").appendChild(location);
    
          //stores hatch for reference
          hatches.push(hatch);
          result.push(hatch);
          result.push(Bodies.rectangle(xpos+(w/2), ypos - h/2 + size/4, size/5, h, {isStatic: true, 
            render: {fillStyle: links[x][theme]}})); //right
          result.push(Bodies.rectangle(xpos-(w/2), ypos - h/2 + size/4, size/5, h, {isStatic: true, 
            render: {fillStyle: links[x][theme]}})); //left
          
        }
        return result;
      }
      function getRandomAngle() {
        let angle = 100*Math.PI;
        let offset = 7 - Math.floor(Math.random() * 14);
        angle = 100*Math.PI - offset;
        return angle/100 ;
      }
    
      Composite.add(engine.world, buckets());
      spoons.forEach(element => {
        Body.setAngle(element, getRandomAngle());
      });
      //drop two spoons
    
    
      console.log(hatches);
      Composite.add(engine.world, [
        // walls
        Bodies.rectangle(width/6, height, width/2, size/2, { isStatic: true, collisionFilter:{category: 4, mask: 2}}),
        Bodies.rectangle(5*width/6, height, width/2, size/2, { isStatic: true, collisionFilter:{category: 4, mask: 2} }),
        Bodies.rectangle(2*width/3, 0, 50, height/2, { isStatic: true, collisionFilter:{category: 2, mask: 4}}),
        Bodies.rectangle(width/3, 0, 50, height/2, { isStatic: true, collisionFilter:{category: 2, mask: 4} })
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
      var spoonTop;
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
        spoonTop = partA1.id;
        trapBody = partB.id;
        curSpoon = Body.create({
          parts: [partA1, partA2, partA3, partA4, partB]
        });
    
        Composite.add(engine.world, curSpoon);
      });

      Matter.Events.on(engine, "collisionStart", function(event) {
          
      let collisionArray = event.source.pairs.collisionActive;
      for(let j = 0; j < collisionArray.length; j++){
        let bodyA = event.pairs[0].bodyA.id;
        let bodyB = event.pairs[0].bodyB.id;
        //console.log(event);
        if(bodyA === trapBody || bodyA === spoonTop){
          for(let i = 0; i < links.length; i++){
            if(bodyB === hatches[i].id){
              //console.log(links[i][0]);
              window.location.href = links[i][link];
            }
          }
        }
        else{
          if(bodyB === trapBody || bodyB === spoonTop){
            for(let i = 0; i < links.length; i++){
              if(bodyA === hatches[i].id){
                window.location.href = links[i][link];
              }
            }
          }
        }
      }
    });
    
  
      Runner.run(runner, engine)
    Render.run(render);
    }, []);
  
  return (
    <div className="scene">
      <canvas ref={canvasRef} />
      <p id="menudisplay">drop a spoon to navigate</p>
    </div>
  )
};

export default SpoonDropMenu;