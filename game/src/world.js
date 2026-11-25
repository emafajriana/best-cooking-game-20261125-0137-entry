// Sizzle & Serve — the game world: chef, stations, orders, grill, chopping.
// One clear job: the rules. It knows nothing about drawing or input devices;
// step(dt, input) advances the simulation and records sound events for main.js.
import {
  FIELD, BOARD_H, CHEF, CHOP_SECONDS, GRILL_COOK_SECONDS, GRILL_BURN_SECONDS,
  SHIFT_SECONDS, MAX_HEARTS, MAX_ORDERS, INTERACT_RANGE, STATIONS,
} from './config.js';
import { makeRng, pick } from './rng.js';
import { INGREDIENTS, RECIPES, dishMatches, orderInterval, orderTimeLimit, recipeById } from './recipes.js';

export function freshState(seed) {
  return {
    seed,
    rng: makeRng(seed),
    elapsed: 0,
    shiftLeft: SHIFT_SECONDS,
    coins: 0,
    served: 0,
    missed: 0,
    combo: 0,
    bestCombo: 0,
    hearts: MAX_HEARTS,
    started: false,
    over: false,
    chef: { x: 480, y: 380, moving: false, face: 1 },
    carry: null,
    counterPlate: null,
    grill: [null, null],
    chopping: null,
    orders: [],
    nextOrderIn: 6,
    nextOrderId: 1,
    floats: [],
    events: [],
  };
}

function addFloat(state, x, y, text, color) {
  state.floats.push({ x, y, text, color, t: 1.4 });
}

function spawnOrder(state) {
  let recipe = pick(state.rng, RECIPES);
  const recent = state.orders.slice(-2).map((o) => o.recipeId);
  if (recent.length === 2 && recent[0] === recipe.id && recent[1] === recipe.id) {
    recipe = pick(state.rng, RECIPES.filter((r) => r.id !== recipe.id));
  }
  const limit = orderTimeLimit(state.elapsed);
  state.orders.push({ id: state.nextOrderId, recipeId: recipe.id, timeLeft: limit, total: limit });
  state.nextOrderId += 1;
}

/** Stations sorted by distance from the chef, nearest first. */
function stationsByDistance(state) {
  return [...STATIONS]
    .map((s) => {
      const cx = Math.max(s.x, Math.min(state.chef.x, s.x + s.w));
      const cy = Math.max(s.y, Math.min(state.chef.y, s.y + s.h));
      return { station: s, d: Math.hypot(state.chef.x - cx, state.chef.y - cy) };
    })
    .filter((e) => e.d < INTERACT_RANGE)
    .sort((a, b) => a.d - b.d)
    .map((e) => e.station);
}

function collide(state) {
  const c = state.chef;
  c.x = Math.max(8 + CHEF.radius, Math.min(FIELD.width - 8 - CHEF.radius, c.x));
  c.y = Math.max(BOARD_H + CHEF.radius, Math.min(FIELD.height - 8 - CHEF.radius, c.y));
  for (const s of STATIONS) {
    const cx = Math.max(s.x, Math.min(c.x, s.x + s.w));
    const cy = Math.max(s.y, Math.min(c.y, s.y + s.h));
    let dx = c.x - cx;
    let dy = c.y - cy;
    const d2 = dx * dx + dy * dy;
    if (d2 < CHEF.radius * CHEF.radius) {
      if (d2 === 0) {
        c.y = s.y - CHEF.radius;
        continue;
      }
      const d = Math.sqrt(d2);
      dx /= d;
      dy /= d;
      c.x = cx + dx * CHEF.radius;
      c.y = cy + dy * CHEF.radius;
    }
  }
}

/**
 * Try to use one station. Returns true when it did something. Stations sit
 * close together (the bottom crates touch the chopping board's reach), so the
 * caller tries them nearest-first until one acts, instead of trusting the
 * single nearest one.
 */
function useStation(state, station) {
  const carry = state.carry;
  if (station.kind === 'crate') {
    if (carry === null) {
      state.carry = { type: 'item', item: { kind: station.item, chopped: false, cooked: false, burnt: false } };
      state.events.push('pickup');
      return true;
    }
    return false;
  }
  if (station.kind === 'chopping') {
    if (carry && carry.type === 'item' && INGREDIENTS[carry.item.kind].choppable && !carry.item.chopped && !state.chopping) {
      state.chopping = { item: carry.item, t: 0 };
      state.carry = null;
      state.events.push('chop-start');
      return true;
    }
    return false;
  }
  if (station.kind === 'grill') {
    if (carry && carry.type === 'item' && carry.item.kind === 'patty' && !carry.item.cooked) {
      const slot = state.grill.findIndex((g) => g === null);
      if (slot !== -1) {
        state.grill[slot] = { item: carry.item, t: 0 };
        state.carry = null;
        state.events.push('grill-place');
        return true;
      }
      return false;
    }
    if (carry === null) {
      const slot = state.grill.findIndex((g) => g && (g.item.cooked || g.item.burnt));
      if (slot !== -1) {
        state.carry = { type: 'item', item: state.grill[slot].item };
        state.grill[slot] = null;
        state.events.push('pickup');
        return true;
      }
    }
    return false;
  }
  if (station.kind === 'assembly') {
    if (carry && carry.type === 'plate') {
      if (state.counterPlate === null) {
        state.counterPlate = carry;
        state.carry = null;
        state.events.push('place');
        return true;
      }
      return false;
    }
    if (carry && carry.type === 'item') {
      if (state.counterPlate !== null) {
        state.counterPlate.items.push(carry.item);
        state.carry = null;
        state.events.push('place');
        return true;
      }
      return false;
    }
    if (carry === null) {
      if (state.counterPlate === null) {
        state.counterPlate = { type: 'plate', items: [] };
        state.events.push('plate');
      } else {
        state.carry = state.counterPlate;
        state.counterPlate = null;
        state.events.push('pickup');
      }
      return true;
    }
    return false;
  }
  if (station.kind === 'bin') {
    if (carry !== null) {
      state.carry = null;
      state.events.push('trash');
      addFloat(state, state.chef.x, state.chef.y - 28, 'binned', '#888888');
      return true;
    }
    return false;
  }
  if (station.kind === 'serve') {
    if (carry && carry.type === 'plate') {
      const match = state.orders.find((o) => dishMatches(carry.items, recipeById(o.recipeId)));
      if (match) {
        const recipe = recipeById(match.recipeId);
        const tip = Math.round((10 * match.timeLeft) / match.total);
        state.combo += 1;
        state.bestCombo = Math.max(state.bestCombo, state.combo);
        const mult = 1 + Math.min(state.combo - 1, 4) * 0.25;
        const pay = Math.round((recipe.price + tip) * mult);
        state.coins += pay;
        state.served += 1;
        state.orders = state.orders.filter((o) => o !== match);
        addFloat(state, state.chef.x, state.chef.y - 28, `+$${pay}`, '#2e7d32');
        if (state.combo >= 2) addFloat(state, state.chef.x, state.chef.y - 52, `COMBO x${mult.toFixed(2)}`, '#f2b234');
        state.events.push('serve-good');
      } else {
        state.coins = Math.max(0, state.coins - 5);
        state.combo = 0;
        addFloat(state, state.chef.x, state.chef.y - 28, 'Wrong dish! -$5', '#d94f3d');
        state.events.push('serve-bad');
      }
      state.carry = null;
      return true;
    }
    return false;
  }
  return false;
}

function interact(state) {
  for (const station of stationsByDistance(state)) {
    if (useStation(state, station)) return;
  }
}

/** Advance the world one step. input: {mx, my, interact} — mx/my in -1..1. */
export function step(state, dt, input) {
  if (!state.started || state.over) return;
  state.elapsed += dt;
  state.shiftLeft -= dt;

  const c = state.chef;
  const len = Math.hypot(input.mx, input.my);
  c.moving = len > 0.1;
  if (c.moving) {
    const nx = input.mx / len;
    const ny = input.my / len;
    c.x += nx * CHEF.speed * dt;
    c.y += ny * CHEF.speed * dt;
    if (Math.abs(nx) > 0.1) c.face = nx > 0 ? 1 : -1;
  }
  collide(state);

  if (input.interact) interact(state);

  // Chopping: progress while the chef stays at the board; walking away cancels it.
  if (state.chopping) {
    const board = STATIONS.find((s) => s.id === 'chopping');
    const cx = Math.max(board.x, Math.min(c.x, board.x + board.w));
    const cy = Math.max(board.y, Math.min(c.y, board.y + board.h));
    if (Math.hypot(c.x - cx, c.y - cy) > INTERACT_RANGE + 24) {
      state.carry = { type: 'item', item: state.chopping.item };
      state.chopping = null;
      state.events.push('chop-cancel');
    } else {
      state.chopping.t += dt;
      if (state.chopping.t >= CHOP_SECONDS) {
        state.chopping.item.chopped = true;
        state.carry = { type: 'item', item: state.chopping.item };
        state.chopping = null;
        state.events.push('chop-done');
      }
    }
  }

  // Grill: raw -> cooked -> burnt.
  for (const slot of state.grill) {
    if (!slot) continue;
    const wasCooked = slot.item.cooked;
    slot.t += dt;
    if (!wasCooked && slot.t >= GRILL_COOK_SECONDS) {
      slot.item.cooked = true;
      state.events.push('cooked');
      addFloat(state, 520, 492, 'cooked!', '#2e7d32');
    }
    if (!slot.item.burnt && slot.t >= GRILL_BURN_SECONDS) {
      slot.item.burnt = true;
      state.events.push('burnt');
      addFloat(state, 520, 492, 'BURNT!', '#d94f3d');
    }
  }

  // Orders tick down; an expired order costs a heart.
  for (const order of [...state.orders]) {
    order.timeLeft -= dt;
    if (order.timeLeft <= 0) {
      state.orders = state.orders.filter((o) => o !== order);
      state.missed += 1;
      state.hearts -= 1;
      state.combo = 0;
      state.events.push('expire');
      addFloat(state, 480, 60, 'Order missed!', '#d94f3d');
      if (state.hearts <= 0) state.over = true;
    }
  }

  state.nextOrderIn -= dt;
  if (state.nextOrderIn <= 0 && state.orders.length < MAX_ORDERS) {
    spawnOrder(state);
    state.nextOrderIn = orderInterval(state.elapsed);
  }

  for (const f of state.floats) f.t -= dt;
  state.floats = state.floats.filter((f) => f.t > 0);

  if (state.shiftLeft <= 0) {
    state.shiftLeft = 0;
    state.over = true;
    state.events.push('shift-end');
  }
}

/** Start a fresh shift from a seed. */
export function reset(state, seed) {
  const fresh = freshState(seed);
  for (const key of Object.keys(fresh)) state[key] = fresh[key];
  state.started = true;
  spawnOrder(state);
  state.nextOrderIn = orderInterval(0);
}
