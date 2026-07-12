function setupSnake(){
      let stat = false;
      let x = width/2;
      let y = height/5;
      let facialFeatureOffset = snakeSize/10
      let headTop = Bodies.trapezoid(x, y, snakeSize, snakeSize/2, .5,
        {
          isSensor: true,
          isStatic: stat,
          render: {fillStyle: SNAKE_COLOR_1},
        }
      )
      let headBottom = Bodies.trapezoid(x, y+snakeSize/3, snakeSize, snakeSize/2, .5,
        {
          isSensor: true,
          isStatic: stat,
          render: {fillStyle: SNAKE_COLOR_1},
        }
      )
      let eye1 = Bodies.circle(x-facialFeatureOffset*2, y, size/25, {
        isSensor: true,
          isStatic: stat,
          render: {fillStyle: "black"}
      });
      let eye2 = Bodies.circle(x+facialFeatureOffset*2, y, size/25, {
        isSensor: true,
          isStatic: stat,
          render: {fillStyle: "black"}
      });
      let tooth1 = Bodies.polygon(x-facialFeatureOffset, y-snakeSize/3, 3, facialFeatureOffset,
        {isSensor: true,
          isStatic: stat,
          render: {fillStyle: "white"}
        })
      let tooth2 = Bodies.polygon(x+facialFeatureOffset, y-snakeSize/3, 3, facialFeatureOffset,
        {isSensor: true,
          isStatic: stat,
          render: {fillStyle: "white"}
        })
      let teeth = []
      teeth.push(tooth1, tooth2);
      teeth.forEach(t => {
        Body.rotate(t, -Math.PI/6)
      })
      Body.rotate(headBottom, Math.PI)
      let snakeParts = [headTop, headBottom, tooth1, tooth2, eye1, eye2];
      // snakeParts.push([headTop, headBottom, tooth1, tooth2, eye1, eye2]);
      let head = Body.create({parts: snakeParts})
      snakeSegments.push(head);
      
      for(let i = 0; i < 12; i++){
        let seg = getSnakeSegment(
          x,
          y + i * 5*snakeSize/12+ 3*snakeSize/4,
          false, i
        );
        
        snakeSegments.push(seg);
        Composite.add(engine.world, seg);
      }
      for(let i = 1; i < snakeSegments.length; i++){
        let previousSegment = snakeSegments[i-1];
        let currentSegment = snakeSegments[i];
        const constraint = Constraint.create({
          bodyA: previousSegment,
          pointA: { x: 0, y: snakeSize/4 },

          bodyB: currentSegment,
          pointB: { x: 0, y: -snakeSize/4 },

          stiffness: 1,
          length: 0
        });
        Composite.add(engine.world, constraint);
      }
      Composite.add(engine.world, head);
      // snakeParts.forEach(sp => {
      //   snakeSegments.push(sp);
      // })
      // Composite.add(engine.world, snakeParts)
    }
    function getSnakeSegment(x, y, stat, colorInt = 0){
      let segOffset = isMobile ? 1 : 3
      let color = colorInt % 2 === 1 ? SNAKE_COLOR_1 : SNAKE_COLOR_2;
      let segTop = Bodies.trapezoid(x, y, snakeSize, snakeSize/4, .5,
        {
          isSensor: true,
          render: {fillStyle: color},
          density:2,
          frictionAir: 0.08
        }
      )
      let segBottom = Bodies.trapezoid(x, y+snakeSize/6+segOffset, snakeSize, snakeSize/4, .5,
        {
          isSensor: true,
          render: {fillStyle: color},
          density:2,
          frictionAir: 0.08
        }
      )
      Body.rotate(segBottom, Math.PI)
      let parts = [segBottom, segTop];
      let fullSegment = Body.create({
        parts,
        isStatic: stat
      })
      return fullSegment;
    }