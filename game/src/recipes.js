// Sizzle & Serve — ingredients and recipes.
// One clear job: what food exists, what each dish needs, and how orders
// are picked. An order's items are a multiset: kind + chopped/cooked flags.
export const INGREDIENTS = {
  tomato: { label: 'Tomato', choppable: true, color: '#e2483a', light: '#ff7a6b' },
  lettuce: { label: 'Lettuce', choppable: true, color: '#57a85a', light: '#8ed081' },
  onion: { label: 'Onion', choppable: true, color: '#b678c2', light: '#d3a2dd' },
  cheese: { label: 'Cheese', choppable: false, color: '#f2b234', light: '#ffd968' },
  bun: { label: 'Bun', choppable: false, color: '#e0a458', light: '#f2c98d' },
  patty: { label: 'Patty', choppable: false, color: '#a85f43', light: '#c98a68', grillable: true },
};

export const RECIPES = [
  {
    id: 'salad',
    name: 'Garden Salad',
    price: 14,
    items: [
      { kind: 'tomato', chopped: true },
      { kind: 'lettuce', chopped: true },
      { kind: 'onion', chopped: true },
    ],
  },
  {
    id: 'burger',
    name: 'Classic Burger',
    price: 18,
    items: [
      { kind: 'bun' },
      { kind: 'patty', cooked: true },
      { kind: 'lettuce', chopped: true },
    ],
  },
  {
    id: 'melt',
    name: 'Cheese Melt',
    price: 22,
    items: [
      { kind: 'bun' },
      { kind: 'patty', cooked: true },
      { kind: 'cheese' },
      { kind: 'tomato', chopped: true },
    ],
  },
  {
    id: 'stack',
    name: 'Veggie Stack',
    price: 20,
    items: [
      { kind: 'bun' },
      { kind: 'tomato', chopped: true },
      { kind: 'lettuce', chopped: true },
      { kind: 'cheese' },
    ],
  },
];

export function recipeById(id) {
  return RECIPES.find((r) => r.id === id);
}

/** Two-item key for comparing a dish against a recipe, order-free. */
export function itemKey(item) {
  return `${item.kind}|${item.chopped ? 'chop' : 'raw'}|${item.cooked ? 'cook' : 'uncook'}`;
}

export function dishMatches(plateItems, recipe) {
  if (plateItems.length !== recipe.items.length) return false;
  const have = plateItems.map(itemKey).sort().join(',');
  const want = recipe.items.map(itemKey).sort().join(',');
  return have === want;
}

/** Difficulty ramps with the shift clock: orders arrive faster and expire sooner. */
export function orderInterval(elapsedSeconds) {
  return Math.max(9, 16 - elapsedSeconds / 30);
}

export function orderTimeLimit(elapsedSeconds) {
  return Math.max(36, 54 - elapsedSeconds / 8);
}
