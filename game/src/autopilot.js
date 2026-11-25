// Sizzle & Serve — autopilot: plays the real rules forward from a fresh world.
// One clear job: stage screenshot scenes. It builds a queue of small actions
// (walk to a station, press E, wait) that serves the oldest order, then the
// next one. Same seed, same steps, same frame — every time.
import { STATIONS, CHOP_SECONDS } from './config.js';
import { recipeById } from './recipes.js';
import { step, reset } from './world.js';

const STEP = 1 / 60;

/** A point just outside a station where the chef can stand and reach it. */
export function approachPoint(station) {
  if (station.kind === 'crate') return { x: 162, y: station.y + station.h / 2 };
  if (station.kind === 'chopping') return { x: 266, y: 482 };
  if (station.kind === 'grill') return { x: 520, y: 482 };
  if (station.kind === 'bin') return { x: 722, y: 482 };
  if (station.kind === 'assembly') return { x: 782, y: 355 };
  if (station.kind === 'serve') return { x: 876, y: 188 };
  return { x: station.x + station.w / 2, y: station.y + station.h + 20 };
}

function stationById(id) {
  return STATIONS.find((s) => s.id === id);
}

function crateFor(kind) {
  return STATIONS.find((s) => s.kind === 'crate' && s.item === kind);
}

/** Build the action queue that serves one order, oldest first. */
function planOrder(state) {
  const order = state.orders[0];
  if (!order) return null;
  const recipe = recipeById(order.recipeId);
  const q = [];
  const go = (station) => q.push({ type: 'goto', at: approachPoint(station) });
  const use = () => q.push({ type: 'interact' });
  const wait = (t) => q.push({ type: 'wait', t });

  // Clear a half-built plate from the counter first, if one is sitting there.
  if (state.counterPlate) {
    go(stationById('assembly'));
    use();
    go(stationById('bin'));
    use();
  }
  // Fresh plate on the counter.
  go(stationById('assembly'));
  use();

  // One patty at a time: put it on the grill first, then use the cooking
  // time to fetch one other ingredient, and only then collect the patty —
  // a patty left on the grill burns, so never queue two jobs behind it.
  const pattyItem = recipe.items.find((i) => i.kind === 'patty');
  const others = recipe.items.filter((i) => i.kind !== 'patty');
  const fetchOne = (item) => {
    if (item.kind === 'patty') {
      go(crateFor('patty'));
      use();
      go(stationById('grill'));
      use();
    } else if (item.chopped) {
      go(crateFor(item.kind));
      use();
      go(stationById('chopping'));
      use();
      wait(CHOP_SECONDS + 0.3);
      go(stationById('assembly'));
      use();
    } else {
      go(crateFor(item.kind));
      use();
      go(stationById('assembly'));
      use();
    }
  };
  if (pattyItem) {
    fetchOne(pattyItem);
    if (others.length > 0) fetchOne(others[0]);
    q.push({ type: 'wait-grill' });
    go(stationById('grill'));
    use();
    go(stationById('assembly'));
    use();
    for (let i = 1; i < others.length; i += 1) fetchOne(others[i]);
  } else {
    for (const item of others) fetchOne(item);
  }
  // Pick the finished plate up and serve it.
  go(stationById('assembly'));
  use();
  go(stationById('serve'));
  use();
  return { orderId: order.id, queue: q };
}

export function makeDriver() {
  return { plan: null, current: null, waitLeft: 0, gotoTimeout: 0 };
}

/** One simulated step of the autopilot; returns the input for world.step. */
export function drive(driver, state) {
  if (!driver.plan || !state.orders.some((o) => o.id === driver.plan.orderId)) {
    driver.plan = planOrder(state);
    driver.current = null;
    if (!driver.plan) return { mx: 0, my: 0, interact: false };
  }
  if (!driver.current) {
    driver.current = driver.plan.queue.shift() || null;
    if (!driver.current) {
      driver.plan = null;
      return { mx: 0, my: 0, interact: false };
    }
    if (driver.current.type === 'wait') driver.waitLeft = driver.current.t;
    if (driver.current.type === 'wait-grill') driver.waitLeft = 12;
    if (driver.current.type === 'goto') driver.gotoTimeout = 8;
  }
  const act = driver.current;
  if (act.type === 'wait-grill') {
    const ready = state.grill.some((g) => g && g.item.cooked && !g.item.burnt);
    driver.waitLeft -= STEP;
    if (ready || driver.waitLeft <= 0) driver.current = null;
    return { mx: 0, my: 0, interact: false };
  }
  if (act.type === 'wait') {
    driver.waitLeft -= STEP;
    if (driver.waitLeft <= 0) driver.current = null;
    return { mx: 0, my: 0, interact: false };
  }
  if (act.type === 'interact') {
    driver.current = null;
    return { mx: 0, my: 0, interact: true };
  }
  // goto: steer toward the approach point.
  const dx = act.at.x - state.chef.x;
  const dy = act.at.y - state.chef.y;
  const d = Math.hypot(dx, dy);
  driver.gotoTimeout -= STEP;
  if (d < 14 || driver.gotoTimeout <= 0) {
    driver.current = null;
    return { mx: 0, my: 0, interact: false };
  }
  return { mx: dx / d, my: dy / d, interact: false };
}

/**
 * Set `state` to a named scene by playing the real game forward with the
 * autopilot. Returns the screen to draw. Deterministic for a fixed seed.
 */
export function stageShot(name, state, seed) {
  reset(state, seed);
  if (name === 'start') return 'title';
  const driver = makeDriver();
  const seconds = name === 'rush' ? 78 : name === 'end' ? 400 : 42;
  for (let i = 0; i < seconds / STEP; i += 1) {
    if (state.over) break;
    step(state, STEP, drive(driver, state));
    state.events.length = 0;
  }
  return state.over ? 'over' : 'play';
}
