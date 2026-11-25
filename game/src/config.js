// Sizzle & Serve — shared constants: field size, speeds, timings, palette.
// One clear job: every number the rest of the game agrees on lives here.
export const FIELD = { width: 960, height: 600 };
export const BOARD_H = 96;
export const CHEF = { radius: 16, speed: 280 };
export const CHOP_SECONDS = 1.4;
export const GRILL_COOK_SECONDS = 4;
export const GRILL_BURN_SECONDS = 10;
export const SHIFT_SECONDS = 150;
export const MAX_HEARTS = 5;
export const MAX_ORDERS = 4;
export const INTERACT_RANGE = 54;

export const PALETTE = {
  floorA: '#e8c99a',
  floorB: '#dfc08a',
  wall: '#8a5a3b',
  counterTop: '#f3e2c7',
  counterSide: '#b98a5a',
  board: '#2f3a4a',
  boardEdge: '#1d2531',
  cream: '#fff7e6',
  ink: '#2b2118',
  red: '#d94f3d',
  green: '#4d9e57',
  gold: '#f2b234',
};

export const STATIONS = [
  { id: 'crate-tomato', kind: 'crate', item: 'tomato', x: 8, y: 112, w: 132, h: 62 },
  { id: 'crate-lettuce', kind: 'crate', item: 'lettuce', x: 8, y: 186, w: 132, h: 62 },
  { id: 'crate-onion', kind: 'crate', item: 'onion', x: 8, y: 260, w: 132, h: 62 },
  { id: 'crate-cheese', kind: 'crate', item: 'cheese', x: 8, y: 334, w: 132, h: 62 },
  { id: 'crate-bun', kind: 'crate', item: 'bun', x: 8, y: 408, w: 132, h: 62 },
  { id: 'crate-patty', kind: 'crate', item: 'patty', x: 8, y: 482, w: 132, h: 62 },
  { id: 'chopping', kind: 'chopping', x: 176, y: 500, w: 180, h: 88 },
  { id: 'grill', kind: 'grill', x: 400, y: 500, w: 240, h: 88 },
  { id: 'bin', kind: 'bin', x: 676, y: 500, w: 92, h: 88 },
  { id: 'assembly', kind: 'assembly', x: 800, y: 300, w: 152, h: 110 },
  { id: 'serve', kind: 'serve', x: 800, y: 104, w: 152, h: 66 },
];
