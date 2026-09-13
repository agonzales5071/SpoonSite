import Matter from 'matter-js';

export function createMatterEngine(canvasRef, width, height, engineOptions = {}) {
  const engine = Matter.Engine.create(engineOptions);
  const runner = Matter.Runner.create();
  const render = Matter.Render.create({
    engine,
    canvas: canvasRef.current,
    options: { width, height, wireframes: false },
  });

  function start() {
    Matter.Runner.run(runner, engine);
    Matter.Render.run(render);
  }

  function cleanup() {
    Matter.Render.stop(render);
    Matter.Runner.stop(runner);
    Matter.Composite.clear(engine.world, false);
    Matter.Engine.clear(engine);
    render.textures = {};
  }

  return { engine, runner, render, start, cleanup };
}