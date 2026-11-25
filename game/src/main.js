// Sizzle & Serve — bootstrap: game loop, screens, mouse steering, sounds.
// One clear job: wire input, world and rendering together. With ?shot=start,
// ?shot=play, ?shot=rush or ?shot=end the game stages that scene from a fixed
// seed and renders one frame, so screenshots are real gameplay frames.
import { FIELD, STATIONS, INTERACT_RANGE } from './config.js';
import { freshState, reset, step } from './world.js';
import { drawGame } from './render.js';
import { makeInput } from './input.js';
import { playEvent, unlockAudio } from './audio.js';
import { stageShot, approachPoint } from './autopilot.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = FIELD.width;
canvas.height = FIELD.height;

const state = freshState(20261125);
const input = makeInput(canvas);
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

let screen = 'title';
let moveTarget = null;
let pendingStation = null;

function stationAtPoint(x, y) {
  for (const s of STATIONS) {
    if (x >= s.x - 12 && x <= s.x + s.w + 12 && y >= s.y - 12 && y <= s.y + s.h + 12) return s;
  }
  return null;
}

function startShift() {
  reset(state, (Date.now() % 100000) + 7);
  screen = 'play';
  moveTarget = null;
  pendingStation = null;
  unlockAudio();
}

if (shot) {
  // Screenshot mode: stage the scene synchronously, draw once, stay still.
  // The end scene uses the seed whose autopilot run finishes the shift best.
  const shotSeeds = { start: 20261125, play: 20261125, rush: 20261125, end: 20261138 };
  screen = stageShot(shot, state, shotSeeds[shot] ?? 20261125);
  if (screen === 'play') state.started = true;
  drawGame(ctx, state, screen);
} else {
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (screen === 'play') {
      const polled = input.poll();
      let mx = polled.mx;
      let my = polled.my;
      let interact = polled.interact;
      if (polled.click) {
        const hit = stationAtPoint(polled.click.x, polled.click.y);
        if (hit) {
          pendingStation = hit;
          moveTarget = null;
        } else {
          moveTarget = polled.click;
          pendingStation = null;
        }
      }
      if (mx === 0 && my === 0) {
        if (pendingStation) {
          const at = approachPoint(pendingStation);
          const dx = at.x - state.chef.x;
          const dy = at.y - state.chef.y;
          const d = Math.hypot(dx, dy);
          if (d < INTERACT_RANGE) {
            interact = true;
            pendingStation = null;
          } else if (d > 4) {
            mx = dx / d;
            my = dy / d;
          }
        } else if (moveTarget) {
          const dx = moveTarget.x - state.chef.x;
          const dy = moveTarget.y - state.chef.y;
          const d = Math.hypot(dx, dy);
          if (d < 10) moveTarget = null;
          else {
            mx = dx / d;
            my = dy / d;
          }
        }
      } else {
        moveTarget = null;
        pendingStation = null;
      }
      step(state, dt, { mx, my, interact });
      for (const e of state.events) playEvent(e);
      state.events.length = 0;
      if (state.over) screen = 'over';
    } else {
      // Title / game-over screens idle the clock so their pulse stays calm.
      state.elapsed += dt;
    }
    drawGame(ctx, state, screen);
    requestAnimationFrame(frame);
  }

  window.addEventListener('keydown', (e) => {
    if (screen === 'title' && (e.code === 'Enter' || e.code === 'Space')) startShift();
    else if (screen === 'over' && (e.code === 'KeyR' || e.code === 'Enter')) startShift();
  });
  canvas.addEventListener('pointerdown', () => {
    if (screen === 'title' || screen === 'over') startShift();
  });
  requestAnimationFrame(frame);
}
