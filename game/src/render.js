// Sizzle & Serve — everything the player sees: kitchen, food, HUD, screens.
// One clear job: draw the world state onto the canvas. No rules here, only
// pictures — every ingredient is drawn from paths, so the game needs no art files.
import { FIELD, BOARD_H, PALETTE, STATIONS, MAX_HEARTS, CHOP_SECONDS, GRILL_COOK_SECONDS, GRILL_BURN_SECONDS, SHIFT_SECONDS } from './config.js';
import { INGREDIENTS, RECIPES, recipeById, itemKey } from './recipes.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, align = 'center', weight = 'bold') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

/** One ingredient icon. flags: {chopped, cooked, burnt}. */
export function drawFood(ctx, kind, x, y, r, flags = {}) {
  const ing = INGREDIENTS[kind];
  ctx.save();
  ctx.translate(x, y);
  if (flags.burnt) {
    ctx.fillStyle = '#1c1c1c';
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(120,120,120,0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r * 0.3, -r * 0.6);
    ctx.quadraticCurveTo(-r * 0.5, -r * 1.3, -r * 0.1, -r * 1.5);
    ctx.stroke();
    ctx.restore();
    return;
  }
  if (kind === 'tomato') {
    if (flags.chopped) {
      ctx.fillStyle = ing.color;
      for (let i = -1; i <= 1; i += 1) {
        ctx.beginPath();
        ctx.arc(i * r * 0.55, 0, r * 0.42, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#ff9a8a';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = ing.color;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = ing.light;
      ctx.beginPath();
      ctx.arc(-r * 0.3, -r * 0.3, r * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3f7d3a';
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.9);
      ctx.lineTo(-r * 0.35, -r * 0.45);
      ctx.lineTo(0, -r * 0.6);
      ctx.lineTo(r * 0.35, -r * 0.45);
      ctx.closePath();
      ctx.fill();
    }
  } else if (kind === 'lettuce') {
    if (flags.chopped) {
      ctx.fillStyle = ing.color;
      for (let i = 0; i < 5; i += 1) {
        ctx.fillRect(-r + (i % 3) * r * 0.7, -r * 0.5 + Math.floor(i / 3) * r * 0.7, r * 0.55, r * 0.4);
      }
    } else {
      ctx.fillStyle = ing.light;
      ctx.beginPath();
      ctx.arc(-r * 0.35, 0, r * 0.62, 0, Math.PI * 2);
      ctx.arc(r * 0.35, 0, r * 0.62, 0, Math.PI * 2);
      ctx.arc(0, -r * 0.3, r * 0.62, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = ing.color;
      ctx.beginPath();
      ctx.arc(0, r * 0.15, r * 0.55, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (kind === 'onion') {
    if (flags.chopped) {
      ctx.strokeStyle = ing.light;
      ctx.lineWidth = r * 0.22;
      for (let i = 0; i < 3; i += 1) {
        ctx.beginPath();
        ctx.arc(0, r * 0.3, r * (0.9 - i * 0.28), Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = '#efe3f2';
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = ing.color;
      ctx.lineWidth = r * 0.18;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.62, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#7fb069';
      ctx.fillRect(-r * 0.08, -r * 1.35, r * 0.16, r * 0.5);
    }
  } else if (kind === 'cheese') {
    ctx.fillStyle = ing.color;
    ctx.beginPath();
    ctx.moveTo(-r, r * 0.7);
    ctx.lineTo(r, r * 0.7);
    ctx.lineTo(0, -r * 0.9);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#d18f1f';
    ctx.beginPath();
    ctx.arc(-r * 0.25, r * 0.25, r * 0.16, 0, Math.PI * 2);
    ctx.arc(r * 0.3, r * 0.05, r * 0.13, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'bun') {
    ctx.fillStyle = ing.color;
    ctx.beginPath();
    ctx.arc(0, r * 0.25, r, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#8a5a2b';
    ctx.beginPath();
    ctx.arc(0, r * 0.25, r, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff3d6';
    ctx.beginPath();
    ctx.arc(-r * 0.4, -r * 0.35, r * 0.09, 0, Math.PI * 2);
    ctx.arc(r * 0.1, -r * 0.55, r * 0.09, 0, Math.PI * 2);
    ctx.arc(r * 0.5, -r * 0.2, r * 0.09, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'patty') {
    ctx.fillStyle = flags.cooked ? '#7a4a2b' : ing.color;
    rr(ctx, -r, -r * 0.55, r * 2, r * 1.1, r * 0.5);
    ctx.fill();
    if (flags.cooked) {
      ctx.strokeStyle = '#5d3419';
      ctx.lineWidth = 2;
      for (let i = -1; i <= 1; i += 1) {
        ctx.beginPath();
        ctx.moveTo(i * r * 0.6 - r * 0.25, -r * 0.5);
        ctx.lineTo(i * r * 0.6 + r * 0.25, r * 0.5);
        ctx.stroke();
      }
    }
  }
  ctx.restore();
}

function drawPlate(ctx, items, x, y, r) {
  ctx.fillStyle = '#f4f4f4';
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c9c9c9';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#e2e2e2';
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.62, r * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  const n = items.length;
  items.forEach((item, i) => {
    const spread = n <= 1 ? 0 : (i / (n - 1) - 0.5) * r * 1.1;
    drawFood(ctx, item.kind, x + spread, y - r * 0.18 - i * 2, r * 0.42, item);
  });
}

function drawHeart(ctx, x, y, size, filled) {
  ctx.fillStyle = filled ? '#e2483a' : 'rgba(255,255,255,0.25)';
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.9);
  ctx.bezierCurveTo(x - size * 1.2, y, x - size * 0.6, y - size, x, y - size * 0.25);
  ctx.bezierCurveTo(x + size * 0.6, y - size, x + size * 1.2, y, x, y + size * 0.9);
  ctx.fill();
}

function drawOrderCard(ctx, order, x, y, w, h) {
  const recipe = recipeById(order.recipeId);
  const urgent = order.timeLeft < 12;
  ctx.fillStyle = urgent ? '#fff0e8' : '#ffffff';
  rr(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.strokeStyle = urgent ? '#d94f3d' : '#d8c9a8';
  ctx.lineWidth = urgent ? 3 : 2;
  ctx.stroke();
  text(ctx, `#${order.id} ${recipe.name}`, x + w / 2, y + 14, 12, PALETTE.ink);
  recipe.items.forEach((item, i) => {
    drawFood(ctx, item.kind, x + 22 + i * 30, y + 36, 11, item);
  });
  text(ctx, `$${recipe.price}`, x + w - 26, y + 36, 13, '#8a6d1f', 'center');
  const frac = Math.max(0, order.timeLeft / order.total);
  ctx.fillStyle = '#e8ddc4';
  rr(ctx, x + 10, y + h - 12, w - 20, 6, 3);
  ctx.fill();
  ctx.fillStyle = frac > 0.5 ? '#4d9e57' : frac > 0.25 ? '#f2b234' : '#d94f3d';
  if (frac > 0) {
    rr(ctx, x + 10, y + h - 12, (w - 20) * frac, 6, 3);
    ctx.fill();
  }
  text(ctx, `${Math.ceil(order.timeLeft)}s`, x + w / 2, y + h - 24, 10, urgent ? '#d94f3d' : '#7a6a4f');
}

function drawChef(ctx, state) {
  const c = state.chef;
  const bob = c.moving ? Math.sin(state.elapsed * 14) * 2 : 0;
  ctx.save();
  ctx.translate(c.x, c.y + bob * 0.3);
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(0, 15, 17, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  // body (apron)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, 2, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3f6fb5';
  rr(ctx, -9, 2, 18, 12, 5);
  ctx.fill();
  // head
  ctx.fillStyle = '#f2c99a';
  ctx.beginPath();
  ctx.arc(0, -12, 10, 0, Math.PI * 2);
  ctx.fill();
  // toque
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-6, -20, 6, 0, Math.PI * 2);
  ctx.arc(0, -23, 7, 0, Math.PI * 2);
  ctx.arc(6, -20, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-9, -21, 18, 5);
  // face
  ctx.fillStyle = '#2b2118';
  ctx.beginPath();
  ctx.arc(-3.5 + c.face * 1.5, -12, 1.4, 0, Math.PI * 2);
  ctx.arc(3.5 + c.face * 1.5, -12, 1.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2b2118';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(c.face * 1.5, -9, 3.5, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  ctx.restore();
  // carried item floats above the chef
  if (state.carry) {
    const cy = c.y - 34 + Math.sin(state.elapsed * 4) * 2;
    if (state.carry.type === 'plate') {
      drawPlate(ctx, state.carry.items, c.x, cy, 20);
    } else {
      drawFood(ctx, state.carry.item.kind, c.x, cy, 13, state.carry.item);
    }
  }
}

function drawStation(ctx, s, state) {
  const labelColor = '#5a4632';
  if (s.kind === 'crate') {
    ctx.fillStyle = '#a4713f';
    rr(ctx, s.x, s.y, s.w, s.h, 8);
    ctx.fill();
    ctx.fillStyle = PALETTE.counterTop;
    rr(ctx, s.x + 4, s.y + 4, s.w - 8, s.h - 8, 6);
    ctx.fill();
    drawFood(ctx, s.item, s.x + 26, s.y + s.h / 2, 15, s.item === 'patty' ? {} : {});
    text(ctx, INGREDIENTS[s.item].label, s.x + 58, s.y + s.h / 2 - 2, 13, labelColor, 'left');
    text(ctx, 'E: take', s.x + 58, s.y + s.h / 2 + 15, 10, '#9a8468', 'left', 'normal');
  } else if (s.kind === 'chopping') {
    ctx.fillStyle = '#8a5a3b';
    rr(ctx, s.x, s.y, s.w, s.h, 8);
    ctx.fill();
    ctx.fillStyle = '#f7ead0';
    rr(ctx, s.x + 6, s.y + 6, s.w - 12, s.h - 12, 6);
    ctx.fill();
    text(ctx, 'CHOPPING BOARD', s.x + s.w / 2, s.y + 16, 11, labelColor);
    if (state.chopping) {
      drawFood(ctx, state.chopping.item.kind, s.x + s.w / 2, s.y + 46, 16, state.chopping.item);
      const frac = state.chopping.t / CHOP_SECONDS;
      ctx.strokeStyle = '#4d9e57';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(s.x + s.w / 2, s.y + 46, 24, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.strokeStyle = '#b9b9b9';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(s.x + s.w / 2 - 18, s.y + 62);
      ctx.lineTo(s.x + s.w / 2 + 18, s.y + 34);
      ctx.stroke();
      ctx.fillStyle = '#8a8a8a';
      ctx.fillRect(s.x + s.w / 2 + 12, s.y + 30, 16, 5);
      text(ctx, 'hold E here with veg', s.x + s.w / 2, s.y + 72, 10, '#9a8468', 'center', 'normal');
    }
  } else if (s.kind === 'grill') {
    ctx.fillStyle = '#3a3a3a';
    rr(ctx, s.x, s.y, s.w, s.h, 8);
    ctx.fill();
    ctx.fillStyle = '#555555';
    for (let i = 1; i < 6; i += 1) {
      ctx.fillRect(s.x + 10, s.y + 8 + i * 12, s.w - 20, 3);
    }
    text(ctx, 'GRILL', s.x + s.w / 2, s.y + 14, 11, '#ffffff');
    state.grill.forEach((slot, i) => {
      const gx = s.x + 60 + i * 120;
      const gy = s.y + 52;
      if (slot) {
        drawFood(ctx, 'patty', gx, gy, 17, slot.item);
        const frac = Math.min(1, slot.t / GRILL_COOK_SECONDS);
        ctx.strokeStyle = slot.item.burnt ? '#d94f3d' : slot.item.cooked ? '#4d9e57' : '#f2b234';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(gx, gy, 24, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
        ctx.stroke();
        if (slot.item.cooked && !slot.item.burnt) text(ctx, 'READY', gx, gy - 32, 10, '#4d9e57');
        if (slot.item.burnt) text(ctx, 'BURNT!', gx, gy - 32, 10, '#d94f3d');
      } else {
        ctx.strokeStyle = '#777777';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(gx, gy, 18, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });
  } else if (s.kind === 'bin') {
    ctx.fillStyle = '#7d8894';
    rr(ctx, s.x, s.y, s.w, s.h, 8);
    ctx.fill();
    ctx.fillStyle = '#5d6670';
    rr(ctx, s.x + 8, s.y + 8, s.w - 16, 14, 4);
    ctx.fill();
    text(ctx, 'BIN', s.x + s.w / 2, s.y + 48, 12, '#ffffff');
    text(ctx, 'toss it', s.x + s.w / 2, s.y + 66, 10, '#d8dde2', 'center', 'normal');
  } else if (s.kind === 'assembly') {
    ctx.fillStyle = PALETTE.counterSide;
    rr(ctx, s.x, s.y, s.w, s.h, 8);
    ctx.fill();
    ctx.fillStyle = PALETTE.counterTop;
    rr(ctx, s.x + 4, s.y + 4, s.w - 8, s.h - 8, 6);
    ctx.fill();
    text(ctx, 'ASSEMBLY', s.x + s.w / 2, s.y + 16, 11, labelColor);
    if (state.counterPlate) {
      drawPlate(ctx, state.counterPlate.items, s.x + s.w / 2, s.y + 62, 30);
      if (state.counterPlate.items.length === 0) text(ctx, 'empty plate', s.x + s.w / 2, s.y + 92, 10, '#9a8468', 'center', 'normal');
    } else {
      ctx.strokeStyle = '#c9b48a';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.ellipse(s.x + s.w / 2, s.y + 62, 34, 12, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      text(ctx, 'E: new plate', s.x + s.w / 2, s.y + 92, 10, '#9a8468', 'center', 'normal');
    }
  } else if (s.kind === 'serve') {
    ctx.fillStyle = '#8a2f24';
    rr(ctx, s.x, s.y, s.w, s.h, 8);
    ctx.fill();
    for (let i = 0; i < 6; i += 1) {
      ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#d94f3d';
      ctx.fillRect(s.x + 6 + i * 24, s.y + 4, 24, 14);
    }
    ctx.fillStyle = '#fff7e6';
    rr(ctx, s.x + 6, s.y + 20, s.w - 12, s.h - 26, 6);
    ctx.fill();
    text(ctx, 'SERVE  •  E to deliver', s.x + s.w / 2, s.y + 42, 12, '#8a2f24');
  }
}

function drawBoard(ctx, state) {
  ctx.fillStyle = PALETTE.board;
  ctx.fillRect(0, 0, FIELD.width, BOARD_H);
  ctx.fillStyle = PALETTE.boardEdge;
  ctx.fillRect(0, BOARD_H - 4, FIELD.width, 4);
  text(ctx, 'ORDERS', 14, 16, 11, '#9fb2cc', 'left');
  state.orders.forEach((order, i) => {
    drawOrderCard(ctx, order, 70 + i * 168, 8, 160, 80);
  });
  if (state.orders.length === 0) {
    text(ctx, 'No orders yet — the lunch rush is coming…', 380, 48, 13, '#9fb2cc', 'center', 'normal');
  }
  // When the board has room, show the menu — it fills the gap and tells the
  // judge the recipes at a glance.
  if (state.orders.length <= 2) {
    const mx = 70 + state.orders.length * 168;
    ctx.fillStyle = 'rgba(255,247,230,0.10)';
    rr(ctx, mx, 8, 160, 80, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(242,178,52,0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    text(ctx, "TODAY'S MENU", mx + 80, 20, 11, '#f2b234');
    RECIPES.forEach((r, i) => {
      text(ctx, `${r.name} — $${r.price}`, mx + 80, 38 + i * 13, 10, '#e8ddc4', 'center', 'normal');
    });
  }
  // HUD: coins, hearts, shift timer
  text(ctx, `$${state.coins}`, 800, 22, 20, '#f2b234', 'right');
  text(ctx, 'COINS', 800, 42, 10, '#9fb2cc', 'right', 'normal');
  for (let i = 0; i < MAX_HEARTS; i += 1) drawHeart(ctx, 822 + i * 20, 22, 7, i < state.hearts);
  if (state.combo >= 2) text(ctx, `COMBO x${(1 + Math.min(state.combo - 1, 4) * 0.25).toFixed(2)}`, 880, 46, 12, '#f2b234', 'left');
  const mins = Math.floor(state.shiftLeft / 60);
  const secs = Math.floor(state.shiftLeft % 60);
  text(ctx, `SHIFT ${mins}:${String(secs).padStart(2, '0')}`, 880, 70, 13, '#ffffff', 'left');
  const frac = state.shiftLeft / SHIFT_SECONDS;
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  rr(ctx, 700, 82, 246, 6, 3);
  ctx.fill();
  ctx.fillStyle = frac > 0.3 ? '#4d9e57' : '#d94f3d';
  rr(ctx, 700, 82, 246 * frac, 6, 3);
  ctx.fill();
}

function drawFloor(ctx) {
  const size = 48;
  for (let y = BOARD_H; y < FIELD.height; y += size) {
    for (let x = 0; x < FIELD.width; x += size) {
      const odd = ((x / size) + (y / size)) % 2 === 0;
      ctx.fillStyle = odd ? PALETTE.floorA : PALETTE.floorB;
      ctx.fillRect(x, y, size, size);
    }
  }
  ctx.fillStyle = 'rgba(0,0,0,0.05)';
  ctx.fillRect(0, BOARD_H, FIELD.width, 6);
  // A worn rug in the middle of the room, where the chef spends the shift.
  ctx.fillStyle = 'rgba(178,74,60,0.13)';
  rr(ctx, 300, 220, 360, 190, 14);
  ctx.fill();
  ctx.strokeStyle = 'rgba(178,74,60,0.30)';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 6]);
  rr(ctx, 312, 232, 336, 166, 10);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawFloats(ctx, state) {
  for (const f of state.floats) {
    ctx.globalAlpha = Math.min(1, f.t);
    text(ctx, f.text, f.x, f.y - (1.4 - f.t) * 24, 15, f.color);
  }
  ctx.globalAlpha = 1;
}

function drawTitle(ctx, state) {
  ctx.fillStyle = 'rgba(20,16,12,0.72)';
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  text(ctx, 'SIZZLE & SERVE', FIELD.width / 2, 150, 52, '#f2b234');
  text(ctx, 'Rush Hour Kitchen', FIELD.width / 2, 198, 24, '#fff7e6', 'center', 'normal');
  text(ctx, 'Orders are coming in. Chop it, grill it, plate it, serve it — before the timer runs out.', FIELD.width / 2, 248, 15, '#e8ddc4', 'center', 'normal');
  const lines = [
    'WASD / Arrows — move   •   E / Space — grab, chop, grill, plate, serve',
    'Click a station to walk over and use it',
    'Chop veg on the board • Grill patties — take them off before they burn',
    'Match the plate to an order • Serve fast for tips • Combos pay more',
    `${MAX_HEARTS} missed orders ends the shift early`,
  ];
  lines.forEach((line, i) => text(ctx, line, FIELD.width / 2, 296 + i * 26, 14, '#fff7e6', 'center', 'normal'));
  const pulse = 0.7 + Math.sin(state.elapsed * 4) * 0.3;
  ctx.globalAlpha = pulse;
  text(ctx, 'Click or press ENTER to start the shift', FIELD.width / 2, 452, 18, '#f2b234');
  ctx.globalAlpha = 1;
}

function drawOver(ctx, state) {
  ctx.fillStyle = 'rgba(20,16,12,0.78)';
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  text(ctx, 'SHIFT OVER', FIELD.width / 2, 140, 44, '#f2b234');
  text(ctx, `You earned $${state.coins}  •  ${state.served} dishes served  •  ${state.missed} missed`, FIELD.width / 2, 196, 17, '#fff7e6', 'center', 'normal');
  const stars = state.coins >= 150 ? 3 : state.coins >= 90 ? 2 : state.coins >= 40 ? 1 : 0;
  for (let i = 0; i < 3; i += 1) {
    const x = FIELD.width / 2 + (i - 1) * 64;
    ctx.fillStyle = i < stars ? '#f2b234' : 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    for (let k = 0; k < 10; k += 1) {
      const ang = -Math.PI / 2 + (k * Math.PI) / 5;
      const rad = k % 2 === 0 ? 26 : 11;
      const px = x + Math.cos(ang) * rad;
      const py = 250 + Math.sin(ang) * rad;
      if (k === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }
  text(ctx, stars === 3 ? 'Head Chef material!' : stars === 2 ? 'A solid shift — the regulars are happy.' : stars === 1 ? 'The kitchen survived. Barely.' : 'Rough shift. The rush ate you alive.', FIELD.width / 2, 300, 15, '#e8ddc4', 'center', 'normal');
  text(ctx, `Best combo x${(1 + Math.min(state.bestCombo - 1, 4) * 0.25).toFixed(2)}  •  ${state.served} served`, FIELD.width / 2, 332, 13, '#9fb2cc', 'center', 'normal');
  const pulse = 0.7 + Math.sin(state.elapsed * 4) * 0.3;
  ctx.globalAlpha = pulse;
  text(ctx, 'Press R or click to cook again', FIELD.width / 2, 400, 17, '#f2b234');
  ctx.globalAlpha = 1;
}

function nearestStationName(state) {
  let best = null;
  let bestD = 54;
  for (const s of STATIONS) {
    const cx = Math.max(s.x, Math.min(state.chef.x, s.x + s.w));
    const cy = Math.max(s.y, Math.min(state.chef.y, s.y + s.h));
    const d = Math.hypot(state.chef.x - cx, state.chef.y - cy);
    if (d < bestD) {
      bestD = d;
      best = s;
    }
  }
  return best;
}

const HINTS = {
  crate: 'E — take ingredient',
  chopping: 'E — start chopping',
  grill: 'E — grill / take patty',
  assembly: 'E — plate / add / take',
  serve: 'E — serve the plate',
  bin: 'E — throw it away',
};

/** Draw the whole game. screen: 'title' | 'play' | 'over'. */
export function drawGame(ctx, state, screen) {
  ctx.clearRect(0, 0, FIELD.width, FIELD.height);
  drawFloor(ctx);
  for (const s of STATIONS) drawStation(ctx, s, state);
  drawChef(ctx, state);
  drawBoard(ctx, state);
  drawFloats(ctx, state);
  if (screen === 'play' && state.started && !state.over) {
    const near = nearestStationName(state);
    if (near) {
      text(ctx, HINTS[near.kind], state.chef.x, state.chef.y - 52, 12, '#2b2118');
    }
  }
  if (screen === 'title') drawTitle(ctx, state);
  if (screen === 'over') drawOver(ctx, state);
}

export { itemKey };
