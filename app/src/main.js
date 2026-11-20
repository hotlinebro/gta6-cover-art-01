// Wires the editor: photos, samples, layout and grade picks, per-panel crop
// sliders, editable caption text, and PNG export in all three post sizes.
// A `?shot=` query sets up a fixed scene for a screenshot instead (shots.js).
import { drawCoverArt, demoState, GRADES, LAYOUTS, SIZES, ROLES } from './cover.js';
import { runShot } from './shots.js';

const SAMPLES = ['boulevard', 'hero', 'mechanic', 'pier', 'racer', 'fixer'];
const canvas = document.getElementById('cover');
const status = document.getElementById('status');
const state = demoState();
state.photos = new Array(7).fill(null);
let sizeKey = 'square';
let panel = 1; // the hero panel is selected first

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function redraw() {
  drawCoverArt(canvas, state, sizeKey);
}

function syncPanelControls() {
  const crop = state.crops[panel];
  document.getElementById('zoom').value = crop.zoom;
  document.getElementById('ox').value = crop.ox;
  document.getElementById('oy').value = crop.oy;
  document.getElementById('role').value = state.roles[panel];
  document.getElementById('panelName').textContent = `${panel + 1} · ${state.roles[panel]}`;
  document.querySelectorAll('#panelRow button').forEach((b, i) => b.classList.toggle('on', i === panel));
}

function buildChoices() {
  const layoutBox = document.getElementById('layouts');
  LAYOUTS.forEach((l) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = l.name;
    b.classList.toggle('on', l.id === state.layout);
    b.addEventListener('click', () => {
      state.layout = l.id;
      layoutBox.querySelectorAll('button').forEach((x) => x.classList.remove('on'));
      b.classList.add('on');
      redraw();
    });
    layoutBox.appendChild(b);
  });
  const gradeBox = document.getElementById('grades');
  GRADES.forEach((g) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'swatch';
    b.title = g.name;
    b.setAttribute('aria-label', g.name);
    b.style.background = `linear-gradient(135deg, ${g.top}, ${g.mid} 55%, ${g.bottom})`;
    b.classList.toggle('on', g.id === state.grade);
    b.addEventListener('click', () => {
      state.grade = g.id;
      gradeBox.querySelectorAll('button').forEach((x) => x.classList.remove('on'));
      b.classList.add('on');
      redraw();
    });
    gradeBox.appendChild(b);
  });
  const sizeBox = document.getElementById('sizes');
  Object.entries(SIZES).forEach(([key, s]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = s.label;
    b.classList.toggle('on', key === sizeKey);
    b.addEventListener('click', () => {
      sizeKey = key;
      sizeBox.querySelectorAll('button').forEach((x) => x.classList.remove('on'));
      b.classList.add('on');
      redraw();
    });
    sizeBox.appendChild(b);
  });
  const row = document.getElementById('panelRow');
  ROLES.forEach((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = i + 1;
    b.addEventListener('click', () => { panel = i; syncPanelControls(); });
    row.appendChild(b);
  });
  const samplesBox = document.getElementById('samples');
  SAMPLES.forEach((name) => {
    const img = document.createElement('img');
    img.src = `samples/${name}.jpg`;
    img.alt = `${name} sample portrait`;
    img.addEventListener('click', async () => {
      const loaded = await loadImage(img.src);
      state.photos[panel] = loaded;
      samplesBox.querySelectorAll('img').forEach((x) => x.classList.remove('on'));
      img.classList.add('on');
      redraw();
    });
    samplesBox.appendChild(img);
  });
}

async function loadDemoCast() {
  const order = ['boulevard', 'hero', 'mechanic', 'pier', 'racer', 'fixer', 'boulevard'];
  state.photos = await Promise.all(order.map((n) => loadImage(`samples/${n}.jpg`)));
  status.textContent = 'Demo cast loaded — 7 panels, 6 portraits.';
  redraw();
}

function bindInputs() {
  const text = (id, key) => {
    document.getElementById(id).addEventListener('input', (e) => { state[key] = e.target.value; redraw(); });
  };
  text('title', 'title');
  text('subtitle', 'subtitle');
  text('tagline', 'tagline');
  text('quote', 'quote');
  document.getElementById('role').addEventListener('input', (e) => {
    state.roles[panel] = e.target.value.toUpperCase();
    document.getElementById('panelName').textContent = `${panel + 1} · ${state.roles[panel]}`;
    redraw();
  });
  document.getElementById('zoom').addEventListener('input', (e) => { state.crops[panel].zoom = Number(e.target.value); redraw(); });
  document.getElementById('ox').addEventListener('input', (e) => { state.crops[panel].ox = Number(e.target.value); redraw(); });
  document.getElementById('oy').addEventListener('input', (e) => { state.crops[panel].oy = Number(e.target.value); redraw(); });
  document.getElementById('photo').addEventListener('change', async (e) => {
    const files = [...e.target.files];
    if (!files.length) return;
    for (const file of files) {
      state.photos[panel] = await loadImage(URL.createObjectURL(file));
      panel = (panel + 1) % 7;
    }
    syncPanelControls();
    status.textContent = `${files.length} photo${files.length > 1 ? 's' : ''} loaded.`;
    redraw();
  });
  document.getElementById('demo').addEventListener('click', loadDemoCast);
  document.getElementById('export').addEventListener('click', () => {
    const off = document.createElement('canvas');
    drawCoverArt(off, state, sizeKey);
    off.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `neon-harbor-${SIZES[sizeKey].w}x${SIZES[sizeKey].h}.png`;
      a.click();
      status.textContent = `Saved ${a.download}`;
    }, 'image/png');
  });
}

// Export helper the shot scenes use: draw the demo cover at a size and hand
// the canvas back, so a screenshot shows exactly what export writes.
export async function exportCover(size) {
  await loadDemoCast();
  const off = document.createElement('canvas');
  drawCoverArt(off, state, size);
  return off;
}

const shot = new URLSearchParams(location.search).get('shot');
buildChoices();
bindInputs();
syncPanelControls();
if (shot) {
  runShot(shot, new URLSearchParams(location.search), { state, loadImage, loadDemoCast, redraw, canvas, sizeKey: (k) => { sizeKey = k; } });
} else {
  loadDemoCast();
}
