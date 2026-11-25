// Sizzle & Serve — tiny synthesised sound effects (WebAudio, no files).
// One clear job: make the kitchen answer at once — chop, sizzle, ding.
// Everything is generated; nothing is loaded, so the game stays offline.
let ctx = null;

function audio() {
  if (ctx) return ctx;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  } catch {
    return null;
  }
  return ctx;
}

export function unlockAudio() {
  const a = audio();
  if (a && a.state === 'suspended') a.resume().catch(() => {});
}

function tone(freq, dur, type, gainValue, when = 0) {
  const a = audio();
  if (!a) return;
  try {
    const t0 = a.currentTime + when;
    const osc = a.createOscillator();
    const gain = a.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(gainValue, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain);
    gain.connect(a.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  } catch {
    /* headless or muted: silence is fine */
  }
}

function noise(dur, gainValue, freq) {
  const a = audio();
  if (!a) return;
  try {
    const len = Math.floor(a.sampleRate * dur);
    const buffer = a.createBuffer(1, len, a.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = a.createBufferSource();
    src.buffer = buffer;
    const filter = a.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    const gain = a.createGain();
    gain.gain.value = gainValue;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(a.destination);
    src.start();
  } catch {
    /* silence is fine */
  }
}

export function playEvent(name) {
  switch (name) {
    case 'pickup':
      tone(520, 0.07, 'sine', 0.12);
      break;
    case 'place':
      tone(340, 0.08, 'triangle', 0.14);
      break;
    case 'plate':
      tone(660, 0.06, 'sine', 0.1);
      tone(880, 0.09, 'sine', 0.1, 0.06);
      break;
    case 'chop-start':
      noise(0.12, 0.2, 1800);
      break;
    case 'chop-done':
      noise(0.1, 0.25, 2400);
      tone(700, 0.08, 'triangle', 0.12, 0.02);
      break;
    case 'chop-cancel':
      tone(220, 0.12, 'sawtooth', 0.06);
      break;
    case 'grill-place':
      noise(0.35, 0.16, 900);
      break;
    case 'cooked':
      tone(740, 0.1, 'sine', 0.14);
      tone(988, 0.14, 'sine', 0.14, 0.1);
      break;
    case 'burnt':
      tone(160, 0.3, 'sawtooth', 0.1);
      break;
    case 'serve-good':
      tone(523, 0.1, 'sine', 0.16);
      tone(659, 0.1, 'sine', 0.16, 0.09);
      tone(784, 0.18, 'sine', 0.18, 0.18);
      break;
    case 'serve-bad':
      tone(200, 0.18, 'square', 0.08);
      tone(150, 0.22, 'square', 0.08, 0.12);
      break;
    case 'expire':
      tone(330, 0.25, 'triangle', 0.12);
      tone(262, 0.3, 'triangle', 0.12, 0.18);
      break;
    case 'trash':
      noise(0.15, 0.18, 500);
      break;
    case 'shift-end':
      tone(523, 0.12, 'sine', 0.16);
      tone(659, 0.12, 'sine', 0.16, 0.12);
      tone(784, 0.12, 'sine', 0.16, 0.24);
      tone(1047, 0.3, 'sine', 0.18, 0.36);
      break;
    default:
      break;
  }
}
