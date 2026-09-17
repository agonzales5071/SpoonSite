export function createPausableTimerGroup() {
  const timers = new Map();
  let nextId = 1;
  const now = () => performance.now();

  function setTimeout(callback, delay) {
    const id = nextId++;
    const record = { callback, delay, remaining: delay, startedAt: now(), handle: null, paused: false, repeating: false };
    record.handle = window.setTimeout(() => {
      timers.delete(id);
      callback();
    }, delay);
    timers.set(id, record);
    return id;
  }

  function setInterval(callback, delay) {
    const id = nextId++;
    const record = { callback, delay, remaining: delay, startedAt: now(), handle: null, paused: false, repeating: true };
    function tick() {
      record.callback();
      if (!timers.has(id)) return; // cleared during its own callback
      record.remaining = record.delay;
      record.startedAt = now();
      record.handle = window.setTimeout(tick, record.delay);
    }
    record.handle = window.setTimeout(tick, delay);
    timers.set(id, record);
    return id;
  }

  function clear(id) {
    const record = timers.get(id);
    if (!record) return;
    window.clearTimeout(record.handle);
    timers.delete(id);
  }

  function clearAll() {
    timers.forEach(record => window.clearTimeout(record.handle));
    timers.clear();
  }

  function pauseAll() {
    timers.forEach(record => {
      if (record.paused) return;
      record.paused = true;
      const elapsed = now() - record.startedAt;
      record.remaining = Math.max(0, record.remaining - elapsed);
      window.clearTimeout(record.handle);
      record.handle = null;
    });
  }

  function resumeAll() {
    timers.forEach((record, id) => {
      if (!record.paused) return;
      record.paused = false;
      record.startedAt = now();
      if (record.repeating) {
        function tick() {
          record.callback();
          if (!timers.has(id)) return;
          record.remaining = record.delay;
          record.startedAt = now();
          record.handle = window.setTimeout(tick, record.delay);
        }
        record.handle = window.setTimeout(tick, record.remaining);
      } else {
        record.handle = window.setTimeout(() => {
          timers.delete(id);
          record.callback();
        }, record.remaining);
      }
    });
  }

  return {
    setTimeout, setInterval,
    clearTimeout: clear, clearInterval: clear,
    clearAll, pauseAll, resumeAll,
  };
}