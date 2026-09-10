import { useEffect, useRef, useState } from 'react'
import Matter from 'matter-js'
import './spoondrop.css';
import Popup from './util/menuPopup';
import { swapDocBody, getDigitBodies, getSpoon, BACKGROUND_COLOR, getRandomInt} from './util/spoonHelper';

const SpoonDropMenu = () => {
    const canvasRef = useRef(null);
    const tutorialFnRef = useRef(null);
    const [popupVisible, setPopupVisible] = useState(true);
    const [startTutorial, setStartTutorial] = useState(false);
    const popupCheck = "menuPopupSeen";

    useEffect(() => swapDocBody(), []);

    useEffect(() => {
      const hasSeenPopup = localStorage.getItem(popupCheck);

      if (!hasSeenPopup) {
        setPopupVisible(true);
      }
      else{
        setStartTutorial(true);
        setPopupVisible(false);
      }
    }, []);
    const closePopup = () => {
      setPopupVisible(false);
      localStorage.setItem(popupCheck, "true");
      setStartTutorial(true)
    };
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
        engine: engine,
        canvas: canvasRef.current,
        options: {
          width: width,
          height: height,
          wireframes: false,
        },
      });
      var size = 100; //size var for spoon
      var isMobile = false;
      var segmentLength = 24;
      var segmentThickness = 12;
      if(width < 800){
        size = 50;
        isMobile = true;
        segmentLength = 12;
        segmentThickness = 6;
      }
      let tutBodies = [];
      const links = [
        ["/games/CerealShot", "CerealShot", "#fff2d1", "#006FFF"], 
        ["/games/Descent", "Descent",  "#9b8b70ff"],
        ["/games/SpaceOs", "Space O's", "rgb(231, 129, 82)", "#006FFF"], 
        ["/games/Rescue", "Rescue",  "#aec8f8ff"],
        ["/games/HotSpoontato", "Hot Spoontato",  "#c75656ff"],
        ["/games/SpoonSaberBattle", "SpoonSaber Battle", "#f7e546ff", "#74EE15"], 
        ["/games/SpeedClick", "SpeedClick", "#77c2abff", "#74EE15"], 
        ["/games/Freeplay", "Freeplay", "#c996ceff", "#8C00FC"],
        ["/", "Home Page", "#BFFCC6", "#FF6701"]];
      const link = 0;
      const name = 1;
      var theme = 2;// value of 2 or greater
      var routes = links.length;
      var hatches  = []; //list of bodies that need to be checked for collision
      var spoons = [];  
      var spoonSpawnXs = [];
      var topRowOnly = isMobile;
      var tableDisplay = !isMobile;

    function createSegmentNumber(x, y, num, color = "#FFFFFF", segmentLength, segmentThickness) {
      const parts = [];

      let offsetX = x;
      let yOffsetModifier = isMobile ? 2 : 3;
      const digits = num.toString();

      for (const digit of digits) {
        const digitParts = getDigitBodies(digit, offsetX, y-yOffsetModifier*segmentLength, color,  segmentLength, segmentThickness);
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
    function animateNavTutorial(){
      var y =  isMobile ? 2*height/6 : height/6;
      let collumnIndex = getRandomInt(spoonSpawnXs.length);
      let x = spoonSpawnXs[collumnIndex];
      let innerTouchPad = Bodies.circle(x, y, size/5 , {render: {fillStyle: BACKGROUND_COLOR}, isSensor: true, isStatic: true});
      let outerTouchPad = Bodies.circle(x, y, size/5+ size/50, {render: {fillStyle: "white"}, isSensor: true, isStatic: true});
      tutBodies.push(innerTouchPad, outerTouchPad);
      setTimeout(() => {
        if(engine && engine.world){
          Composite.add(engine.world, [outerTouchPad, innerTouchPad ])
        }
      }, 300)
      setTimeout(() => {
        if(engine && engine.world){
          innerTouchPad.render.fillStyle = "grey"
          let spoonTut = getSpoon(size, x, y, {group: 0})
          spoonTut.label = "tut"
          Composite.add(engine.world, spoonTut);
        }
      }, 600)
      setTimeout(() => {
        if(engine && engine.world){
          innerTouchPad.render.fillStyle = BACKGROUND_COLOR;
        }
      }, 1000)
    }
    function buckets(){
      var h = isMobile ? height/10 : height/6;
      let linkTracker = 0;
      var result = [];
      const layerMax = 4;
      // var spoonSpawnXs = [];
      var upperMargin = isMobile ? height/5 : height/6;
      var usableY = height - upperMargin;
      var numPerLayer = splitAlternating(routes, layerMax);
      var sliceHeight = usableY/(numPerLayer.length+1);
      document.getElementById("menudisplay").appendChild(document.createElement('br'));
      for (let rowNum = 0; rowNum < numPerLayer.length; rowNum++) {
        //build out each row
        let w = width/(layerMax*2)
        let sliceWidth = width/(numPerLayer[rowNum]+1);
        let ypos = upperMargin + h + sliceHeight * (rowNum+1);
        if(tableDisplay){
          document.getElementById("menudisplay").appendChild(document.createElement('br'));
          let locationsTable = document.createElement('table');
          locationsTable.id = "locationsTable"+rowNum;
          document.getElementById("menudisplay").appendChild(locationsTable);
          let locationRow = document.createElement('tr');
          locationRow.id = "locationRow" + rowNum;
          document.getElementById("locationsTable"+rowNum).appendChild(locationRow);
        }
        for(let bucketNum = 1; bucketNum < numPerLayer[rowNum] + 1; bucketNum++) {
          let xpos = sliceWidth*bucketNum;
          var hatchHeight = isMobile ? size/4 : size/2;
          var hatchY = isMobile ? ypos + hatchHeight/2 : ypos;
          
          let hatch = Bodies.rectangle(xpos, hatchY-hatchHeight/10, w*0.93, hatchHeight/4, {isStatic: true, 
            render: {fillStyle: links[linkTracker][theme]},
            link: links[linkTracker][link],
            label: "hatch"
          }) //bottom
          let hatchProtection = Bodies.rectangle(xpos, hatchY+hatchHeight/4, w, hatchHeight/2, {isStatic: true, 
            render: {fillStyle: links[linkTracker][theme]}
          }) //bottom
          
          //create and style navigation text 
          //TODO change this to a table that displays similarly to bucket orientation
          let elementType = tableDisplay ? 'td' : 'p';
          let location = document.createElement(elementType);
          location.id = links[linkTracker][name];
          location.className = "locations";
          location.style.color = links[linkTracker][theme];
          location.innerHTML = (linkTracker+1) + ". " + links[linkTracker][name];
          if(tableDisplay){
            document.getElementById("locationRow"+rowNum).appendChild(location);
          }
          else{
            document.getElementById("menudisplay").appendChild(location);
          }
          createSegmentNumber(xpos, ypos, linkTracker+1, location.style.color, segmentLength, segmentThickness);
          
          if(bucketNum <numPerLayer[rowNum] && !isMobile && tableDisplay){
            let locationSep = document.createElement('td');
            locationSep.className = "locations";
            locationSep.innerHTML = "|";
            document.getElementById("locationRow"+rowNum).appendChild(locationSep);
          }
          //stores hatch for reference
          hatches.push(hatch);
          result.push(hatch);
          result.push(hatchProtection);
          result.push(Bodies.rectangle(xpos+(w/2), ypos - h/2 + size/4, size/5, h, {isStatic: true, 
            render: {fillStyle: links[linkTracker][theme]}})); //right
          result.push(Bodies.rectangle(xpos-(w/2), ypos - h/2 + size/4, size/5, h, {isStatic: true, 
            render: {fillStyle: links[linkTracker][theme]}})); //left
          
          if(!spoonSpawnXs.includes(xpos)){
              if(topRowOnly){
              if(rowNum === 0){
                spoonSpawnXs.push(xpos);    
              }
            }
            else{
              spoonSpawnXs.push(xpos);
            }
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
    tutorialFnRef.current = animateNavTutorial;
    // animateNavTutorial();
    spoons.forEach(element => {
      Body.setAngle(element, getRandomAngle());
    });

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
        let doTut = false;
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
          if(bodyA.parent.label === "tut" && bodyB.label === "hatch"){  
            // console.log(bodyB.link)
            doTut = true;
          }
          else if(bodyA.label === "hatch" && bodyB.parent.label === "tut"){
            // console.log(bodyA.link)
            doTut = true
          }
          if(doTut){
            let tutBody = bodyA.parent.label === "tut" ? bodyA.parent : bodyB.parent;
            Composite.remove(engine.world, tutBodies)
            setTimeout(() => {
              if(engine && engine.world){
                Composite.remove(engine.world, tutBody)
              }
            }, 750)
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
      tutorialFnRef.current = null;
    };
  }, []);
  useEffect(() => {
    if (startTutorial && tutorialFnRef.current) {
      tutorialFnRef.current();
    }
  }, [startTutorial]);
  return (
    <div className="scene">
      <canvas ref={canvasRef} />
      <p id="menudisplay">
        <span id="menu-instructions">drop a spoon to navigate</span>
      </p>
      <Popup visible={popupVisible} closePopup={closePopup}/>
    </div>
  )
};

export default SpoonDropMenu;