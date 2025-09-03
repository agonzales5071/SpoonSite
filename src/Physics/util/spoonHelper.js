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

      let spoon = Body.create({
        parts: [partA1, partA2, partA3, partA4, partB],
        collisionFilter: partA1.collisionFilter,
      });

      if(center === "middle"){
        Body.setCentre(spoon, Vector.create(spoonSpawn[0], spoonSpawn[1] - spoonSize / 10), false);
      }
      if(center === "bottom"){
        Body.setCentre(spoon, Vector.create(spoonSpawn[0], spoonSpawn[1] + spoonSize/2), false);
      }
      
      return spoon;
    }

export function createPlusScore(x, y, score, world, noFadeScoreParts) {
  const parts = [];

  // "+" sign
  parts.push(
    Matter.Bodies.rectangle(x, y, 20, 5, {
      isStatic: true,
      render: { fillStyle: "#ffffff" }
    }),
    Matter.Bodies.rectangle(x, y, 5, 20, {
      isStatic: true,
      render: { fillStyle: "#ffffff" }
    })
  );

  let offsetX = x + 25;
  const digits = score.toString();

  for (const digit of digits) {
    const digitParts = getDigitBodies(digit, offsetX, y);
    parts.push(...digitParts);
    offsetX += segmentLength + 10;
  }

  const composite = Matter.Body.create({
    parts,
    isStatic: true,
    collisionFilter: { mask: 0 }
  });

  setTimeout(() => {
    let opacity = 1;
    const floatInterval = setInterval(() => {
      Matter.Body.translate(composite, { x: 0, y: -1 });
      opacity -= 0.05;
  
      composite.parts.forEach(part => {
        if (!noFadeScoreParts.includes(part)) {
          part.render.opacity = opacity;
        }
      });
  
      if (opacity <= 0) {
        clearInterval(floatInterval);
        Matter.Composite.remove(world, composite);
      }
    }, 50);
  }, 1000);
  Matter.Composite.add(world, composite);
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