import Matter, { Bodies, Body, Composite, Vector} from "matter-js";

const segmentLength = 12;
const segmentThickness = 4;

export function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

export function getSpoon(spoonSize, xposSpawn, yposSpawn, spoonFilter, color, center = "middle"){
      let spoonSpawn = [xposSpawn, yposSpawn, - spoonSize/2 + yposSpawn];
      let spoonHeadOffset = spoonSize / 50;
      let spoonDensity = 0.0011;

      //SHAPES
      let partA1 = Bodies.circle(spoonSpawn[0], spoonSpawn[2], spoonSize/5, {
        density: spoonDensity,
        render: {fillStyle: color},
        collisionFilter: spoonFilter,
      });
      let partA2 = Bodies.circle(spoonSpawn[0], spoonSpawn[2] - spoonHeadOffset, spoonSize/5, {
        render: partA1.render,
        density: spoonDensity,
        collisionFilter: partA1.collisionFilter,
      });
      let partA3 = Bodies.circle(spoonSpawn[0], spoonSpawn[2] - 2*spoonHeadOffset, spoonSize/5, {
        render: partA1.render,
        density: spoonDensity,
        collisionFilter: partA1.collisionFilter,
      });
      let partA4 = Bodies.circle(spoonSpawn[0], spoonSpawn[2] - 3*spoonHeadOffset, spoonSize/5, {
        render: partA1.render,
        density: spoonDensity,
        collisionFilter: partA1.collisionFilter,
      });
      let partB = Bodies.trapezoid(spoonSpawn[0], spoonSpawn[1], spoonSize/5, spoonSize, 0.4, {
        render: partA1.render,
        density: spoonDensity,
        collisionFilter: partA1.collisionFilter,
      });
      let parts = getSpoonBodies(spoonSize, spoonSpawn, spoonFilter, color, spoonHeadOffset)

      let spoon = Body.create({
        parts: [partA1, partA2, partA3, partA4, partB],
        collisionFilter: spoonFilter,
      });

      if(center === "middle"){
        Body.setCentre(spoon, Vector.create(spoonSpawn[0], spoonSpawn[1] - spoonSize / 10), false);
      }
      if(center === "bottom"){
        Body.setCentre(spoon, Vector.create(spoonSpawn[0], spoonSpawn[1] + spoonSize/2), false);
      }
      return spoon;
    }
// export function getSpoon(spoonSize, xposSpawn, yposSpawn, spoonFilter, color, center = "middle"){
//       let spoonSpawn = [xposSpawn, yposSpawn, - spoonSize/2 + yposSpawn];
//       let spoonHeadOffset = spoonSize / 50;

//       //SHAPES
//       let parts = getSpoonBodies(spoonSize, spoonSpawn, spoonFilter, color, spoonHeadOffset)

//       let spoon = Body.create({
//         parts: parts,
//         collisionFilter: spoonFilter,
//       });

//       if(center === "middle"){
//         Body.setCentre(spoon, Vector.create(spoonSpawn[0], spoonSpawn[1] - spoonSize / 10), false);
//       }
//       if(center === "bottom"){
//         Body.setCentre(spoon, Vector.create(spoonSpawn[0], spoonSpawn[1] + spoonSize/2), false);
//       }
      
//       return spoon;
//     }

export function getSpoonWithHilt(spoonSize, xposSpawn, yposSpawn, spoonFilter, color, center = "bottom" ){
  let spoonSpawn = [xposSpawn, yposSpawn, - spoonSize/2 + yposSpawn];
  let spoonHeadOffset = spoonSize / 50;

  //SHAPES
  let parts = getSpoonBodies(spoonSize, spoonSpawn, spoonFilter, color, spoonHeadOffset)
  let hilt = Bodies.trapezoid(xposSpawn, yposSpawn+spoonSize*6/12, 
    spoonSize/4, spoonSize/4, 0.1, {
    render: {fillStyle: '#444444ff'},
    collisionFilter: spoonFilter,
  })
  hilt.label = "hilt";
  parts.push(hilt)

  let spoon = Body.create({
    parts: parts,
    collisionFilter: spoonFilter,
  });

  
  if(center === "middle"){
    Body.setCentre(spoon, Vector.create(spoonSpawn[0], spoonSpawn[1] - spoonSize / 10), false);
  }
  if(center === "bottom"){
    Body.setCentre(spoon, Vector.create(spoonSpawn[0], spoonSpawn[1] + spoonSize/2), false);
  }
  
  return spoon;
}

export function getDualSidedSaber(spoonSize, x, y, spoonFilter, color, gap = 0) {
  const headOffset = spoonSize / 50;
  const handleLen  = spoonSize*9/10;          // your trapezoid height in getSpoonBodies
  gap = spoonSize/2;
  // Where the *center* of each handle should be so their inner flat ends meet at y
  const topHandleY = y - (gap / 2 + handleLen / 2);
  const botHandleY = y + (gap / 2 + handleLen / 2);

  // Head centers for each spoon before any rotation
  const topHeadY = topHandleY - spoonSize / 2; // head above top handle
  const botHeadY = botHandleY - spoonSize / 2; // head below bottom handle

  // Build the top spoon (points "up" already with your getSpoonBodies)
  const topParts = getSpoonBodies(
    spoonSize,
    [x, topHandleY, topHeadY],
    spoonFilter,
    color,
    headOffset
  );
  topParts.forEach(p => { p.label = "topSpoon"; p.group = "topSpoon"; });

  // Build the bottom spoon at its own handle center, then rotate 180° around that center
  const bottomParts = getSpoonBodies(
    spoonSize,
    [x, botHandleY, botHeadY],
    spoonFilter,
    color,
    headOffset
  );
  bottomParts.forEach(p => {
    Body.rotate(p, Math.PI, { x, y: botHandleY });
    p.label = "bottomSpoon";
    p.group = "bottomSpoon";
  });

  // Hilt between them (tall, thin rectangle centered at (x, y))
  const hiltWidth  = spoonSize*8/24;
  const hiltHeight = Math.max(8, gap || spoonSize * 0.14);
  const hilt = Bodies.rectangle(x, y, hiltWidth, hiltHeight, {
    render: { fillStyle: "#444444" },
    collisionFilter: spoonFilter
  });
  hilt.label = "hilt";

  // Combine into one body
  const saber = Body.create({
    parts: [...topParts, ...bottomParts, hilt],
    collisionFilter: spoonFilter
  });

  return saber;
}

function getSpoonBodies(spoonSize, spoonSpawn, spoonFilter, color, spoonHeadOffset){
    let spoonDensity = 0.0011;

    //SHAPES
    let partA1 = Bodies.circle(spoonSpawn[0], spoonSpawn[2], spoonSize/5, {
      density: spoonDensity,
      render: {fillStyle: color},
      collisionFilter: spoonFilter,
    });
    let partA2 = Bodies.circle(spoonSpawn[0], spoonSpawn[2] - spoonHeadOffset, spoonSize/5, {
      render: partA1.render,
      density: spoonDensity,
      collisionFilter: partA1.collisionFilter,
    });
    let partA3 = Bodies.circle(spoonSpawn[0], spoonSpawn[2] - 2*spoonHeadOffset, spoonSize/5, {
      render: partA1.render,
      density: spoonDensity,
      collisionFilter: partA1.collisionFilter,
    });
    let partA4 = Bodies.circle(spoonSpawn[0], spoonSpawn[2] - 3*spoonHeadOffset, spoonSize/5, {
      render: partA1.render,
      density: spoonDensity,
      collisionFilter: partA1.collisionFilter,
    });
    let partB = Bodies.trapezoid(spoonSpawn[0], spoonSpawn[1], spoonSize/5, spoonSize, 0.4, {
      render: partA1.render,
      density: spoonDensity,
      collisionFilter: partA1.collisionFilter,
    });
    let parts = [partA1, partA2, partA3, partA4, partB] 
  return parts;
}

export function createPlusScore(x, y, score, world, fade, color = "#ffffff") {
  const parts = [];
  let isRainbow = color === "rainbow";
  if(isRainbow){
    color = "#FFFFFF"
  }
  // "+" sign
  parts.push(
    Matter.Bodies.rectangle(x, y, 20, 5, {
      isStatic: true,
      render: { fillStyle: color }
    }),
    Matter.Bodies.rectangle(x, y, 5, 20, {
      isStatic: true,
      render: { fillStyle: color }
    })
  );

  let offsetX = x + 25;
  const digits = score.toString();

  for (const digit of digits) {
    const digitParts = getDigitBodies(digit, offsetX, y, color);
    parts.push(...digitParts);
    offsetX += segmentLength + 10;
  }

  const composite = Matter.Body.create({
    parts,
    isStatic: true,
    collisionFilter: { mask: 0 }
  });

  if(fade){
    floatAndFade(composite, world, color, isRainbow)
  }
  Matter.Composite.add(world, composite);
}
export function floatAndFade(composite, world,  color, isRainbow, noFadeScoreParts = []){
  let opacity = 1;
  let hue = 0;
  let startFadeTime = 20;
  let fadeTimer = 0;
  const floatInterval = setInterval(() => {
    if(fadeTimer>=startFadeTime){
      Matter.Body.translate(composite, { x: 0, y: -1 });
      opacity -= 0.05;
    }
    else{
      fadeTimer++;
    }
    const { r, g, b } = hexToRgb(color);
    const fill = isRainbow
      ? `hsla(${hue}, 100%, 50%, ${opacity})`
      : `rgba(${r}, ${g}, ${b}, ${opacity})`;
    if(isRainbow && composite.parts){
      hue = (hue + 5) % 360; // step hue, adjust 5 for speed
      composite.parts.forEach((part, i) => {
        if (i === 0) return; // skip index 0 (the parent reference)
        if (!noFadeScoreParts.includes(part)) {
          part.render.fillStyle = fill;
        }
      });
    }
    if (opacity <= 0) {
      clearInterval(floatInterval);
      Matter.Composite.remove(world, composite);
    }
  }, 50);
}

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

function createSegment(x, y, horizontal, color = "#ffffff", segmentLength, segmentThickness) {
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
export function getDigitBodies(digit, centerX, centerY, color = "#ffffff", segmentLength = 12, segmentThickness = 4) {
  const bodies = [];
 
  const segments = digitSegments[digit];
  if (!segments) return [];

  const offset = segmentLength / 2 + 1;

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
    bodies.push(createSegment(x, y, horizontal, color, segmentLength, segmentThickness));
  }

  return bodies;
}

// helper: hex -> rgb
function hexToRgb(hex) {
  const bigint = parseInt(hex.replace("#", ""), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}

export function drawHUD(getLives, getGameStarted, hudRef, getColor = "") {
  const ctx = hudRef.current.getContext("2d");
  let color = "#cccccc"
  
  const renderHUD = () => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const lives = getLives();
    const gameStarted = getGameStarted();
    if(getColor){
      color = getColor();
    }

    if (!gameStarted) {
      requestAnimationFrame(renderHUD);
      return;
    }

    ctx.font = "24px Arial";
    ctx.fillStyle = "#ffffff";

    const spoonSpacing = 35;
    const spoonRadius = 10;
    const margin = 20;
    const topOffset = 40;
    const text = "Lives:";
    const textWidth = ctx.measureText(text).width;
    const startX = ctx.canvas.width - (margin + textWidth + 15);
    const startY = topOffset - 10;

    ctx.fillText(text, startX - 90, topOffset);

    for (let i = 0; i < lives; i++) {
      drawSpoonIcon(ctx, startX + i * spoonSpacing, startY, spoonRadius, color);
    }

    requestAnimationFrame(renderHUD);
  };

  renderHUD();
}

function drawSpoonIcon(ctx, x, y, radius, color) {
  // Spoon bowl
  ctx.fillStyle = color;
  // Spoon head (circle)
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  // Handle
  ctx.fillRect(x - 2, y, 4, 20);
}

export function createRandom2DVector(magnitude) {
  const angle = Math.random() * 2 * Math.PI; // random direction
  const x = Math.cos(angle) * magnitude;
  const y = Math.sin(angle) * magnitude;
  return Matter.Vector.create(x, y);
}