import { useEffect, useRef } from 'react'
import Matter from 'matter-js'
import './spoondrop.css';

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
      var isMobile = false;
      var segmentLength = 24;
      var segmentThickness = 8;
      if(width < 800){
        size = 50;
        isMobile = true;
        segmentLength = 12;
        segmentThickness = 4;
      }
      const links = [
        ["/spoondropGameSpeed", "SpeedClick", "#77c2abff", "#74EE15"], 
        ["/spoondropCerealShot", "CerealShot", "#fff2d1", "#006FFF"], 
        ["/spoondropDescent", "Descent",  "#9b8b70ff"],
        ["/spoondropRescue", "Rescue",  "#aec8f8ff"],
        ["/spoondropHotSpoontato", "HotSpoontato",  "#c75656ff"],
        ["/spoondrop", "Freeplay", "#c996ceff", "#8C00FC"],
        ["/", "Home Page", "#BFFCC6", "#FF6701"]];
      const link = 0;
      const name = 1;
      var theme = 2;// value of 2 or greater
      var routes = links.length;
      var hatches  = []; //list of bodies that need to be checked for collision
      var spoons = [];  



      const digitSegments = {
        '0': ['A', 'B', 'C', 'D', 'E', 'F'],
        '1': ['B', 'C'],
        '2': ['A', 'B', 'G', 'E', 'D'],
        '3': ['A', 'B', 'C', 'D', 'G'],
        '4': ['F', 'G', 'B', 'C'],
        '5': ['A', 'F', 'G', 'C', 'D'],
        '6': ['A', 'F', 'E', 'D', 'C', 'G'],
        '7': ['A', 'B', 'C'],
        '8': ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
        '9': ['A', 'B', 'C', 'D', 'F', 'G'],
      };
      function createSegment(x, y, horizontal, color = "#ffffff") {
        return Matter.Bodies.rectangle(
          x, y,
          horizontal ? segmentLength : segmentThickness,
          horizontal ? segmentThickness : segmentLength,
          {
            isStatic: true,
            render: { fillStyle: color }
          }
        );
      }
      function getDigitBodies(digit, centerX, centerY, color = "#ffffff") {
      const segments = digitSegments[digit];
      if (!segments) return [];

      const offset = segmentLength / 2 + 1;
      const bodies = [];

      const positions = {
        A: [centerX, centerY - offset * 2, true],
        B: [centerX + offset, centerY - offset, false],
        C: [centerX + offset, centerY + offset, false],
        D: [centerX, centerY + offset * 2, true],
        E: [centerX - offset, centerY + offset, false],
        F: [centerX - offset, centerY - offset, false],
        G: [centerX, centerY, true],
      };

      for (const seg of segments) {
        const [x, y, horizontal] = positions[seg];
        bodies.push(createSegment(x, y, horizontal, color));
      }

      return bodies;
    }
    function createSegmentNumber(x, y, num) {
      const parts = [];

      let offsetX = x;
      let yOffsetModifier = isMobile ? 2 : 3;
      const digits = num.toString();

      for (const digit of digits) {
        const digitParts = getDigitBodies(digit, offsetX, y-yOffsetModifier*segmentLength);
        parts.push(...digitParts);
        offsetX += segmentLength + 10;
      }

      const composite = Matter.Body.create({
        parts,
        isStatic: true,
        collisionFilter: { mask: 0 }
      });

      Matter.Composite.add(engine.world, composite);
    }
    
      function buckets(){
        var h = isMobile ? height/10 : height/6;
        let linkTracker = 0;
        var result = [];
        const layerMax = 4;
        var spoonSpawnXs = [];
        var upperMargin = isMobile ? 3*height/7 : height/4;
        var usableY = height - upperMargin;
        var numPerLayer = splitAlternating(routes, layerMax);
        var sliceHeight = usableY/(numPerLayer.length+1);
        for (let rowNum = 0; rowNum < numPerLayer.length; rowNum++) {
          //build out each row
          let w = width/(layerMax*2)
          let sliceWidth = width/(numPerLayer[rowNum]+1);
          let ypos = upperMargin + sliceHeight * (rowNum+1);
          for(let bucketNum = 1; bucketNum < numPerLayer[rowNum] + 1; bucketNum++) {
            let xpos = sliceWidth*bucketNum;
            var hatchHeight = isMobile ? size/4 : size/2;
            var hatchY = isMobile ? ypos + hatchHeight/2 : ypos;
            
            let hatch = Bodies.rectangle(xpos, hatchY, w, hatchHeight, {isStatic: true, 
              render: {fillStyle: links[linkTracker][theme]},
              link: links[linkTracker][link],
              label: "hatch"
            }) //bottom
            
            //create and style navigation text 
            let location = document.createElement('p');
            location.id = links[linkTracker][name];
            location.class = "locations";
            location.style.color = links[linkTracker][theme];
            location.innerHTML = (linkTracker+1) + ". " + links[linkTracker][name];
            document.getElementById("menudisplay").appendChild(location);
            createSegmentNumber(xpos, ypos, linkTracker+1);
            
            //stores hatch for reference
            hatches.push(hatch);
            result.push(hatch);
            result.push(Bodies.rectangle(xpos+(w/2), ypos - h/2 + size/4, size/5, h, {isStatic: true, 
              render: {fillStyle: links[linkTracker][theme]}})); //right
            result.push(Bodies.rectangle(xpos-(w/2), ypos - h/2 + size/4, size/5, h, {isStatic: true, 
              render: {fillStyle: links[linkTracker][theme]}})); //left
            if(!spoonSpawnXs.includes(xpos)){
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
              
              spoonSpawnXs.push(spawnx);
    
              result.push(sidespoon);
              spoons.push(sidespoon);
      
            }
            linkTracker++;
          }
        }
          return result;
        }
      
      function getRandomAngle() {
        let angle = 100*Math.PI;
        let offset = 7 - Math.floor(Math.random() * 14);
        angle = 100*Math.PI - offset;
        return angle/100 ;
      }

      function splitAlternating(total, maxPerGroup) {
        const results = [];
      
        function backtrack(path, remaining, useEven) {
          if (remaining === 0) {
            results.push([...path]);
            return;
          }
      
          for (let i = 2; i <= Math.min(maxPerGroup, remaining); i++) {
            if ((i % 2 === 0) !== useEven) continue;
            path.push(i);
            backtrack(path, remaining - i, !useEven);
            path.pop();
          }
        }
       
        // Try starting with even and with odd
        backtrack([], total, true);
        backtrack([], total, false);
      
        if (results.length > 0) {
          // Sort by fewest groups, then smallest numbers
          results.sort((a, b) => {
            if (a.length !== b.length) return a.length - b.length;
            for (let i = 0; i < a.length; i++) {
              if (a[i] !== b[i]) return a[i] - b[i];
            }
            return 0;
          });
          return results[0];
        }
      
        // Fallback if no perfectly alternating result is found
        return fallbackSplit(total, maxPerGroup);
      }
      
      function fallbackSplit(total, max) {
        const result = [];
        while (total > 0) {
          const group = Math.min(max, total);
          result.push(group);
          total -= group;
        }
        return result;
      }
      
    
      Composite.add(engine.world, buckets());
      spoons.forEach(element => {
        Body.setAngle(element, getRandomAngle());
      });
      //drop two spoons
    
      Composite.add(engine.world, [
        // walls
        Bodies.rectangle(width/6, height, width/2, size/2, { isStatic: true, collisionFilter:{category: 4, mask: 2}}),
        Bodies.rectangle(5*width/6, height, width/2, size/2, { isStatic: true, collisionFilter:{category: 4, mask: 2} }),
        Bodies.rectangle(2*width/3, 0, 50, height/2, { isStatic: true, collisionFilter:{category: 2, mask: 4}}),
        Bodies.rectangle(width/3, 0, 50, height/2, { isStatic: true, collisionFilter:{category: 2, mask: 4} })
      ]);

      function cleanupSpoons(){
        for(const spoon of navSpoons){
          setTimeout(() => {
            if (engine && engine.world) {
              Composite.remove(engine.world, spoon)
            }
          }, 50);
        }
      }
      
    
    
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
      var navSpoons = [];
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
        curSpoon = Body.create({
          parts: [partA1, partA2, partA3, partA4, partB],
          label: "spoon"
        });
        navSpoons.push(curSpoon);
        Composite.add(engine.world, curSpoon);
      });

      Matter.Events.on(engine, "collisionStart", function(event) {
        const pairs = event.pairs;
        for (const pair of pairs) {
          const { bodyA, bodyB } = pair;
          // Check if one is a cereal and the other is a spoon
          if(bodyA.parent !== null && bodyB.parent !== null)
          {
          //console.log(event);
            if(bodyA.parent.label === "spoon" && bodyB.label === "hatch"){  
              // console.log(bodyB.link)
              cleanupSpoons();
              window.location.href = bodyB.link;
            }
            else if(bodyA.label === "hatch" && bodyB.parent.label === "spoon"){
              // console.log(bodyA.link)
              cleanupSpoons();
              window.location.href = bodyA.link;
            }
          }
        }
      });
    
  
    Runner.run(runner, engine)
    Render.run(render);

    return () => {
      Render.stop(render);
      Runner.stop(runner);
      Composite.clear(engine.world, false);
      Engine.clear(engine);
      render.canvas.remove();
      render.textures = {};
    };
  }, []);
  
  return (
    <div className="scene">
      <canvas ref={canvasRef} />
      <p id="menudisplay">drop a spoon to navigate</p>
    </div>
  )
};

export default SpoonDropMenu;