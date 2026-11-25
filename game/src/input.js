// Sizzle & Serve — keyboard and mouse input.
// One clear job: turn keys and clicks into a movement vector, an interact
// edge, and click positions the game loop can use. No game rules here.
export function makeInput(canvas) {
  const keys = new Set();
  const state = {
    mx: 0,
    my: 0,
    interact: false,
    click: null,
    moveTarget: null,
  };

  const KEYMAP = {
    ArrowUp: 'up', KeyW: 'up',
    ArrowDown: 'down', KeyS: 'down',
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right',
  };

  window.addEventListener('keydown', (e) => {
    if (KEYMAP[e.code]) {
      keys.add(KEYMAP[e.code]);
      e.preventDefault();
    }
    if (e.code === 'KeyE' || e.code === 'Space') {
      state.interact = true;
      e.preventDefault();
    }
  });
  window.addEventListener('keyup', (e) => {
    if (KEYMAP[e.code]) keys.delete(KEYMAP[e.code]);
  });
  window.addEventListener('blur', () => keys.clear());

  canvas.addEventListener('pointerdown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 960;
    const y = ((e.clientY - rect.top) / rect.height) * 600;
    state.click = { x, y };
    state.moveTarget = { x, y };
  });

  function poll() {
    let mx = 0;
    let my = 0;
    if (keys.has('left')) mx -= 1;
    if (keys.has('right')) mx += 1;
    if (keys.has('up')) my -= 1;
    if (keys.has('down')) my += 1;
    state.mx = mx;
    state.my = my;
    const interact = state.interact;
    state.interact = false;
    const click = state.click;
    state.click = null;
    return { mx, my, interact, click };
  }

  return { state, poll };
}
