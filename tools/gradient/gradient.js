/**
 * Background Gradient Generator — DA (Document Authoring) app.
 *
 * Recreates a branded background as a pure CSS gradient using only the
 * Unify Rare brand palette. Built from the layered "mesh gradient" recipe:
 *   1. Gold highlight (top-right, very low opacity)
 *   2. Right-side cyan bloom
 *   3. Large central cyan glow
 *   4. Deep navy shadow (left-side depth)
 *   5. Bottom darkening
 *   6. Base navy linear gradient
 *
 * Runs inside DA via the global DA_SDK promise, and also works standalone
 * (the "Insert into document" action is hidden when DA is unavailable).
 */

// --- Unify Rare brand palette -------------------------------------------------
const PALETTE = [
  { name: 'Base navy', hex: '#002F6C', rgb: '0,47,108' },
  { name: 'Shadow navy', hex: '#111C4E', rgb: '17,28,78' },
  { name: 'Cyan glow', hex: '#59CBE8', rgb: '89,203,232' },
  { name: 'Warm gold', hex: '#FCA300', rgb: '252,163,0' },
  { name: 'Magenta', hex: '#B5255B', rgb: '181,37,91' },
  { name: 'Orange', hex: '#E35205', rgb: '227,82,5' },
  { name: 'Purple', hex: '#6B3077', rgb: '107,48,119' },
  { name: 'Teal', hex: '#00AB8E', rgb: '0,171,142' },
  { name: 'Sky', hex: '#0084D5', rgb: '0,132,213' },
];

// --- Slider definitions -------------------------------------------------------
// Each control maps to a value used by buildState().
const CONTROLS = [
  { id: 'glow', label: 'Central glow strength', min: 0, max: 0.6, step: 0.005 },
  { id: 'glowRight', label: 'Right-side bloom', min: 0, max: 0.4, step: 0.005 },
  { id: 'gold', label: 'Gold highlight strength', min: 0, max: 0.2, step: 0.002 },
  { id: 'shadow', label: 'Shadow strength', min: 0, max: 0.9, step: 0.01 },
  {
    id: 'glowSize', label: 'Glow size', min: 30, max: 120, step: 1, unit: '%',
  },
  {
    id: 'glowX', label: 'Glow position X', min: 0, max: 100, step: 1, unit: '%',
  },
  {
    id: 'glowY', label: 'Glow position Y', min: 0, max: 100, step: 1, unit: '%',
  },
  {
    id: 'angle', label: 'Base angle', min: 0, max: 360, step: 1, unit: 'deg',
  },
];

// --- Presets ------------------------------------------------------------------
// "hero"  -> the dark navy hero/banner (low contrast, subtle glow)
// "form"  -> the brighter Unify Rare form background (stronger cyan bloom + gold)
const PRESETS = {
  hero: {
    glow: 0.14,
    glowRight: 0.06,
    gold: 0.04,
    shadow: 0.55,
    glowSize: 80,
    glowX: 50,
    glowY: 45,
    angle: 160,
  },
  form: {
    glow: 0.22,
    glowRight: 0.14,
    gold: 0.07,
    shadow: 0.35,
    glowSize: 90,
    glowX: 55,
    glowY: 42,
    angle: 150,
  },
};

const state = { ...PRESETS.hero };

// -----------------------------------------------------------------------------
// Gradient construction. A single source of truth used for both the live
// preview (via CSS custom properties) and the exported CSS string.
// -----------------------------------------------------------------------------
function gradientLayers(s) {
  const navy = '0,47,108';
  const navyB = '6,51,109';
  const navyC = '0,42,94';
  const shadow = '17,28,78';
  const cyan = '89,203,232';
  const gold = '252,163,0';
  const bottomShadow = Math.min(s.shadow * 1.1, 1).toFixed(3);
  return [
    `radial-gradient(55% 45% at 85% 12%, rgba(${gold},${(+s.gold).toFixed(3)}) 0%, rgba(${gold},0) 60%)`,
    `radial-gradient(50% 70% at 90% 50%, rgba(${cyan},${(+s.glowRight).toFixed(3)}) 0%, rgba(${cyan},0) 65%)`,
    `radial-gradient(${s.glowSize}% ${s.glowSize}% at ${s.glowX}% ${s.glowY}%, rgba(${cyan},${(+s.glow).toFixed(3)}) 0%, rgba(${cyan},0) 70%)`,
    `radial-gradient(70% 90% at 6% 50%, rgba(${shadow},${(+s.shadow).toFixed(3)}) 0%, rgba(${shadow},0) 60%)`,
    `radial-gradient(120% 55% at 50% 112%, rgba(${shadow},${bottomShadow}) 0%, rgba(${shadow},0) 60%)`,
    `linear-gradient(${s.angle}deg, rgb(${navy}) 0%, rgb(${navyB}) 50%, rgb(${navyC}) 100%)`,
  ];
}

function buildCss(s) {
  return `background:\n  ${gradientLayers(s).join(',\n  ')};`;
}

// -----------------------------------------------------------------------------
// Helpers: DOM lookup, clipboard, toast
// -----------------------------------------------------------------------------
const $ = (id) => document.getElementById(id);

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.append(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    return true;
  }
}

let toastTimer;
function toast(msg) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

// -----------------------------------------------------------------------------
// Rendering
// -----------------------------------------------------------------------------
function render() {
  $('preview').style.background = gradientLayers(state).join(', ');
  $('css-out').value = buildCss(state);
}

function buildSwatches() {
  const row = $('swatches');
  PALETTE.forEach(({ name, hex }) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'grad-swatch';
    btn.style.setProperty('--c', hex);
    btn.title = `${name} — ${hex} (click to copy)`;
    btn.innerHTML = `<span class="grad-swatch-chip"></span><span class="grad-swatch-hex">${hex}</span>`;
    btn.addEventListener('click', async () => {
      await copy(hex);
      toast(`Copied ${hex}`);
    });
    row.append(btn);
  });
}

function buildControls() {
  const wrap = $('controls');
  CONTROLS.forEach(({
    id, label, min, max, step, unit,
  }) => {
    const field = document.createElement('label');
    field.className = 'grad-slider';
    field.innerHTML = `
      <span class="grad-slider-label">${label}<output id="out-${id}"></output></span>
      <input type="range" id="ctl-${id}" min="${min}" max="${max}" step="${step}" />`;
    wrap.append(field);
    const input = field.querySelector('input');
    const out = field.querySelector('output');
    const sync = () => {
      out.textContent = unit ? `${state[id]}${unit}` : (+state[id]).toFixed(3);
    };
    input.value = state[id];
    sync();
    input.addEventListener('input', () => {
      state[id] = +input.value;
      sync();
      render();
    });
  });
}

function applyPreset(name) {
  Object.assign(state, PRESETS[name]);
  CONTROLS.forEach(({ id, unit }) => {
    const input = $(`ctl-${id}`);
    const out = $(`out-${id}`);
    if (input) input.value = state[id];
    if (out) out.textContent = unit ? `${state[id]}${unit}` : (+state[id]).toFixed(3);
  });
  render();
}

// -----------------------------------------------------------------------------
// Comparison slider
// -----------------------------------------------------------------------------
function setupCompare() {
  const slider = $('compare-slider');
  const clip = $('ref-clip');
  const handle = $('compare-handle');
  const img = $('ref-img');
  const compare = $('compare');

  const position = () => {
    const pct = slider.value;
    clip.style.width = `${pct}%`;
    handle.style.left = `${pct}%`;
    img.style.width = `${compare.clientWidth}px`;
  };
  slider.addEventListener('input', position);
  window.addEventListener('resize', position);

  $('ref-url').addEventListener('change', (e) => {
    const url = e.target.value.trim();
    if (!url) {
      img.removeAttribute('src');
      compare.classList.remove('has-ref');
      return;
    }
    img.src = url;
    img.onload = () => {
      compare.classList.add('has-ref');
      position();
    };
    img.onerror = () => toast('Could not load that image URL');
  });

  position();
}

// -----------------------------------------------------------------------------
// DA integration
// -----------------------------------------------------------------------------
/* global DA_SDK */
async function initDA() {
  const insertBtn = $('insert-btn');
  // DA_SDK is a global promise injected by the DA SDK script. Standalone, it
  // never resolves — so race it against a timeout and degrade gracefully.
  const daSdk = typeof DA_SDK !== 'undefined' ? DA_SDK : null;
  if (!daSdk) return;
  const sdk = await Promise.race([
    daSdk,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error('timeout')), 1500);
    }),
  ]).catch(() => null);

  if (!sdk?.actions?.sendHTML) return;

  insertBtn.hidden = false;
  insertBtn.addEventListener('click', () => {
    // Insert a styled block the author can drop onto a section. The raw CSS
    // (Copy CSS button) is the preferred path for block/section stylesheets.
    const html = `<div style="${buildCss(state).replace(/\n\s*/g, ' ')} min-height: 320px;"></div>`;
    sdk.actions.sendHTML(html);
    sdk.actions.closeLibrary?.();
  });
}

// -----------------------------------------------------------------------------
// Boot
// -----------------------------------------------------------------------------
(function init() {
  buildSwatches();
  buildControls();
  setupCompare();
  render();

  document.querySelectorAll('[data-preset]').forEach((btn) => {
    btn.addEventListener('click', () => applyPreset(btn.dataset.preset));
  });

  $('copy-btn').addEventListener('click', async () => {
    await copy($('css-out').value);
    toast('CSS copied to clipboard');
  });

  document.querySelector('.grad').hidden = false;
  initDA();
}());
