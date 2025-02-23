import React from "react";
import Matter from "matter-js";
import './spoondrop.css';

class SpoonDropMenu extends React.Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef(); // Reference for the canvas
  }

  componentDidMount() {
    // Ensure that the canvas ref is available
    const canvas = this.canvasRef.current;

    if (canvas) {
      // Create the Matter.js engine and renderer
      const engine = Matter.Engine.create();
      const render = Matter.Render.create({
        element: document.body, // Attach the Matter.js render to the body (or any div)
        engine: engine,
        canvas: canvas, // Use the canvas we referenced earlier
        options: {
          width: window.innerWidth, // Full screen width
          height: window.innerHeight, // Full screen height
          wireframes: false, // Disable wireframe rendering for better visuals
        },
      });

      // Create a simple rectangle body (a box) that will fall due to gravity
      const box = Matter.Bodies.rectangle(400, 200, 80, 80);
      Matter.World.add(engine.world, box); // Add the box to the Matter.js world

      // Create a ground body (a static object) that the box will fall on
      const ground = Matter.Bodies.rectangle(
        window.innerWidth / 2, // Position of the ground
        window.innerHeight - 50, // Ground height
        window.innerWidth, // Ground width (fullscreen)
        100, // Height of the ground
        { isStatic: true } // Make the ground static so it doesn't move
      );
      Matter.World.add(engine.world, ground);

      // Run the Matter.js engine and renderer
      Matter.Engine.run(engine);
      Matter.Render.run(render);
    }
  }

  componentWillUnmount() {
    // Stop Matter.js render when the component unmounts to prevent memory leaks
    const canvas = this.canvasRef.current;
    if (canvas) {
      Matter.Render.stop();
    }
  }

  render() {
    return (
      <div>
        <h1>Matter.js Physics Simulation</h1>
        <canvas ref={this.canvasRef} /> {/* Canvas element for rendering */}
      </div>
    );
  }
}

export default SpoonDropMenu;
