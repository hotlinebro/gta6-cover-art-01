// Neon Harbor cover renderer: draws the 7-panel GTA-style poster onto any
// canvas at any of the three post sizes. Pure canvas 2D, no network, no
// library. Every choice the picture needs lives in `state`, so the editor,
// the shot scenes and the export path all draw through this one function.

export const SIZES = {
  square: { w: 1080, h: 1080, label: '1080 x 1080' },
  portrait: { w: 1080, h: 1350, label: '1080 x 1350' },
  wide: { w: 1920, h: 1080, label: '1920 x 1080' },
};

export const ROLES = [
  'THE DRIVER', 'THE KINGPIN', 'THE MECHANIC', 'THE SAILOR',
  'THE RACER', 'THE FIXER', 'THE GETAWAY',
];

// Seven sunset / neon grades. Each grade is one consistent wash over every
// panel plus the title chrome it pairs with, so the whole cover grades as one.
export const GRADES = [
  { id: 'sunset', name: 'Sunset Gold', top: '#ffb347', mid: '#ff5e3a', bottom: '#c2185b', wash: 'rgba(255,110,40,0.20)' },
  { id: 'vice', name: 'Vice Neon', top: '#ff9de2', mid: '#ff2e88', bottom: '#7b2ff7', wash: 'rgba(255,46,136,0.20)' },
  { id: 'dusk', name: 'Magenta Dusk', top: '#ff7ab8', mid: '#d63384', bottom: '#3b0a54', wash: 'rgba(214,51,132,0.22)' },
  { id: 'teal', name: 'Teal Night', top: '#7ef0d4', mid: '#159a8c', bottom: '#123a6d', wash: 'rgba(21,154,140,0.20)' },
  { id: 'amber', name: 'Amber Heat', top: '#ffd76a', mid: '#ff8c1a', bottom: '#8a1c0b', wash: 'rgba(255,140,26,0.22)' },
  { id: 'haze', name: 'Purple Haze', top: '#e0aaff', mid: '#9d4edd', bottom: '#240046', wash: 'rgba(157,78,221,0.20)' },
  { id: 'drive', name: 'Ocean Drive', top: '#ffe29a', mid: '#2ec4b6', bottom: '#011627', wash: 'rgba(46,196,182,0.18)' },
];

// Eight layouts: the 7-panel slanted collage first, then alternates that move
// the hero panel and the split points. Each is top-row splits, bottom-row
// splits and the slant of the panel edges, in pixels at 1080 wide.
export const LAYOUTS = [
  { id: 'collage', name: '7-Panel Collage', top: [0.30, 0.40, 0.30], bot: [0.25, 0.25, 0.25, 0.25], slant: 14 },
  { id: 'even', name: 'Even Grid', top: [0.333, 0.334, 0.333], bot: [0.25, 0.25, 0.25, 0.25], slant: 8 },
  { id: 'hero-left', name: 'Hero Left', top: [0.42, 0.29, 0.29], bot: [0.25, 0.25, 0.25, 0.25], slant: 12 },
  { id: 'hero-right', name: 'Hero Right', top: [0.29, 0.29, 0.42], bot: [0.25, 0.25, 0.25, 0.25], slant: 12 },
  { id: 'wide-bottom', name: 'Wide Bottom', top: [0.333, 0.334, 0.333], bot: [0.30, 0.20, 0.20, 0.30], slant: 16 },
  { id: 'tall-hero', name: 'Tall Hero', top: [0.28, 0.44, 0.28], bot: [0.22, 0.28, 0.28, 0.22], slant: 12 },
  { id: 'diagonal', name: 'Diagonal Cut', top: [0.36, 0.28, 0.36], bot: [0.28, 0.22, 0.22, 0.28], slant: 22 },
  { id: 'stack', name: 'Center Stack', top: [0.25, 0.50, 0.25], bot: [0.20, 0.30, 0.30, 0.20], slant: 6 },
];

export function gradeById(id) {
  return GRADES.find((g) => g.id === id) || GRADES[0];
}

export function layoutById(id) {
  return LAYOUTS.find((l) => l.id === id) || LAYOUTS[0];
}

// Default per-panel crops, tuned to the bundled sample portraits so faces
// land tight in frame: the hero is a close-up, the rest head-and-shoulders.
// zoom multiplies the cover fit; fx/fy is the focal point (0..1) in the photo.
export function defaultCrops() {
  return [
    { zoom: 1.25, fx: 0.52, fy: 0.34, ox: 0, oy: 0 },
    { zoom: 1.35, fx: 0.50, fy: 0.42, ox: 0, oy: 0 },
    { zoom: 1.40, fx: 0.50, fy: 0.42, ox: 0, oy: 0 },
    { zoom: 1.35, fx: 0.50, fy: 0.30, ox: 0, oy: 0 },
    { zoom: 1.15, fx: 0.50, fy: 0.42, ox: 0, oy: 0 },
    { zoom: 1.30, fx: 0.50, fy: 0.42, ox: 0, oy: 0 },
    { zoom: 1.50, fx: 0.22, fy: 0.72, ox: 0, oy: 0 },
  ];
}

export function demoState() {
  return {
    title: 'NEON HARBOR',
    subtitle: 'Chasing the Last Light',
    tagline: 'EVERY CREW NEEDS A WAY OUT',
    quote: 'A SUNSET YOU WILL NEVER FORGET',
    quoteSource: 'SUNSET POST',
    vol: 'VOL. 1',
    seal: 'BEST CAST',
    billing: 'A SUNSET REEL PICTURES PRODUCTION  NEON HARBOR  MUSIC BY MIDNIGHT DRIVE\nEDITED BY L. KOVAC  WRITTEN BY S. MARLOWE & D. OKONKWO  DIRECTED BY A. REYES',
    grade: 'sunset',
    layout: 'collage',
    roles: ROLES.slice(),
    crops: defaultCrops(),
    photos: [],
  };
}

// Panel rectangles for a layout, in canvas pixels. Top row holds panels 0-2,
// a middle band (skyline + title) sits between the rows, bottom row holds
// panels 3-6; the title overlaps the rows a little but clears the role tags.
export function panelRects(w, h, layoutId) {
  const layout = layoutById(layoutId);
  const m = Math.round(w * 0.012);
  const mast = Math.round(h * 0.062);
  const foot = Math.round(h * 0.105);
  const top = mast + m;
  const bottom = h - foot;
  const gap = Math.max(4, Math.round(w * 0.008));
  const contentH = bottom - top;
  const topH = Math.round(contentH * 0.44);
  const bandH = Math.round(contentH * 0.18);
  const rects = [];
  let x = m;
  for (let i = 0; i < 3; i++) {
    const pw = Math.round((w - m * 2 - gap * 2) * layout.top[i]);
    rects.push({ x, y: top, w: pw, h: topH });
    x += pw + gap;
  }
  x = m;
  const botY = top + topH + bandH + gap;
  for (let i = 0; i < 4; i++) {
    const pw = Math.round((w - m * 2 - gap * 3) * layout.bot[i]);
    rects.push({ x, y: botY, w: pw, h: bottom - botY });
    x += pw + gap;
  }
  return { rects, mast, foot, top, bottom, seam: top + topH, bandH, slant: layout.slant * (w / 1080) };
}

function drawPhotoCover(ctx, img, r, crop, grade) {
  if (!img) return;
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const base = Math.max(r.w / iw, r.h / ih) * (crop.zoom || 1);
  const dw = iw * base;
  const dh = ih * base;
  const fx = (crop.fx ?? 0.5) * iw;
  const fy = (crop.fy ?? 0.5) * ih;
  const cx = r.x + r.w / 2 + (crop.ox || 0) * r.w * 0.4;
  const cy = r.y + r.h / 2 + (crop.oy || 0) * r.h * 0.4;
  let dx = cx - (fx / iw) * dw;
  let dy = cy - (fy / ih) * dh;
  // Clamp so the photo always covers the whole panel: the focal point stays
  // centred only while the zoomed photo still overflows on that side.
  if (dw > r.w) dx = Math.max(r.x + r.w - dw, Math.min(r.x, dx)); else dx = r.x + (r.w - dw) / 2;
  if (dh > r.h) dy = Math.max(r.y + r.h - dh, Math.min(r.y, dy)); else dy = r.y + (r.h - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
  // One consistent grade wash over the photo, warm at the foot.
  const wash = ctx.createLinearGradient(0, r.y, 0, r.y + r.h);
  wash.addColorStop(0, 'rgba(255,180,90,0.05)');
  wash.addColorStop(0.55, grade.wash);
  wash.addColorStop(1, 'rgba(120,10,80,0.28)');
  ctx.fillStyle = wash;
  ctx.fillRect(r.x, r.y, r.w, r.h);
}

function slantedPath(ctx, r, slant) {
  ctx.beginPath();
  ctx.moveTo(r.x + slant, r.y);
  ctx.lineTo(r.x + r.w, r.y);
  ctx.lineTo(r.x + r.w - slant, r.y + r.h);
  ctx.lineTo(r.x, r.y + r.h);
  ctx.closePath();
}

function drawRoleTag(ctx, r, role, slant, scale) {
  const tagH = Math.max(20, r.h * 0.14);
  const ty = r.y + r.h - tagH - r.h * 0.03;
  const pad = tagH * 0.55;
  ctx.font = `${Math.round(tagH * 0.52)}px Anton, sans-serif`;
  const tw = ctx.measureText(role).width + pad * 2;
  const tx = r.x + slant * 0.5;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(tx + slant * 0.6, ty);
  ctx.lineTo(tx + tw, ty);
  ctx.lineTo(tx + tw - slant * 0.6, ty + tagH);
  ctx.lineTo(tx, ty + tagH);
  ctx.closePath();
  ctx.fillStyle = 'rgba(12,6,24,0.92)';
  ctx.fill();
  // Gold slash at the tag's leading edge.
  ctx.beginPath();
  ctx.moveTo(tx + slant * 0.6, ty);
  ctx.lineTo(tx + slant * 0.6 + tagH * 0.28, ty);
  ctx.lineTo(tx + tagH * 0.28, ty + tagH);
  ctx.lineTo(tx, ty + tagH);
  ctx.closePath();
  ctx.fillStyle = '#ffc93c';
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(role, tx + pad + tagH * 0.2, ty + tagH / 2 + 1);
  ctx.restore();
}

function drawSkyline(ctx, w, y, h, grade) {
  const sky = ctx.createLinearGradient(0, y, 0, y + h);
  sky.addColorStop(0, grade.top);
  sky.addColorStop(0.55, grade.mid);
  sky.addColorStop(1, grade.bottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, y, w, h);
  // Low sun disc behind the towers, then the silhouette over it.
  const sun = ctx.createRadialGradient(w * 0.5, y + h * 0.6, 2, w * 0.5, y + h * 0.6, h * 0.85);
  sun.addColorStop(0, 'rgba(255,240,180,0.9)');
  sun.addColorStop(0.5, 'rgba(255,180,80,0.4)');
  sun.addColorStop(1, 'rgba(255,120,60,0)');
  ctx.fillStyle = sun;
  ctx.fillRect(0, y, w, h);
  // Deterministic skyline silhouette: narrow towers step across the band.
  ctx.fillStyle = 'rgba(20,6,32,0.92)';
  const towers = [0.05, 0.11, 0.09, 0.16, 0.12, 0.2, 0.1, 0.15, 0.08, 0.18, 0.12, 0.07, 0.14, 0.1, 0.17, 0.09];
  let x = 0;
  const step = w / towers.length;
  for (const t of towers) {
    const th = h * (0.25 + t * 1.6);
    ctx.fillRect(x, y + h - th, step * 0.55, th);
    x += step;
  }
  ctx.fillStyle = 'rgba(255,201,60,0.7)';
  ctx.fillRect(0, y + h - 2, w, 2);
}

function drawChromeTitle(ctx, text, cx, cy, w, grade) {
  let size = Math.round(w * 0.088);
  ctx.font = `${size}px Anton, sans-serif`;
  while (ctx.measureText(text).width > w * 0.96 && size > 24) {
    size -= 4;
    ctx.font = `${size}px Anton, sans-serif`;
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // 3D extrusion, stacked down-right in deep plum.
  ctx.fillStyle = '#2a0a3d';
  for (let i = 7; i >= 1; i--) ctx.fillText(text, cx + i * 1.6, cy + i * 2.4);
  // Striped retro-chrome gradient: the fill itself alternates light and dark
  // bands down the letters, gold to orange to magenta.
  const g = ctx.createLinearGradient(0, cy - size * 0.55, 0, cy + size * 0.55);
  const bands = [
    [0, '#ffe98a'], [0.14, '#ffcf4d'], [0.18, '#e89b1e'], [0.30, '#ffb347'],
    [0.44, '#ff8a2a'], [0.48, '#e85d10'], [0.60, '#ff7a1a'], [0.72, '#ff4d7e'],
    [0.76, '#d61e63'], [0.88, '#ff2e88'], [1, '#c81d6b'],
  ];
  for (const [stop, color] of bands) g.addColorStop(stop, color);
  ctx.fillStyle = g;
  ctx.fillText(text, cx, cy);
  // White outline so the title reads at phone size.
  ctx.lineWidth = Math.max(2, size * 0.035);
  ctx.strokeStyle = 'rgba(255,255,255,0.92)';
  ctx.strokeText(text, cx, cy);
  return size;
}

function drawSeal(ctx, cx, cy, r, label) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.21);
  ctx.fillStyle = '#f5b81d';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#7a4d00';
  ctx.lineWidth = Math.max(2, r * 0.06);
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.82, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#3d2200';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${Math.round(r * 0.34)}px Anton, sans-serif`;
  ctx.fillText('★', 0, -r * 0.42);
  ctx.font = `${Math.round(r * 0.30)}px Anton, sans-serif`;
  const words = label.split(' ');
  ctx.fillText(words[0] || '', 0, -r * 0.02);
  ctx.fillText(words[1] || '', 0, r * 0.32);
  ctx.restore();
}

function drawBarcode(ctx, x, y, w, h) {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - 6, y - 6, w + 12, h + 22);
  ctx.fillStyle = '#111111';
  let bx = x;
  const bars = [3, 1, 2, 1, 1, 3, 1, 2, 4, 1, 1, 2, 1, 3, 2, 1, 1, 1, 3, 2, 1, 4, 1, 2];
  for (const b of bars) {
    const bw = b * (w / 52);
    if (bx + bw > x + w) break;
    ctx.fillRect(bx, y, bw, h);
    bx += bw * 2;
  }
  ctx.font = `${Math.max(9, Math.round(w * 0.11))}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('0 18472 85991 8', x + w / 2, y + h + 13);
}

function drawRibbon(ctx, text, cx, cy, w, grade) {
  ctx.font = `${Math.round(w * 0.016)}px Anton, sans-serif`;
  const tw = ctx.measureText(text).width + w * 0.06;
  const rh = Math.max(22, w * 0.028);
  const x = cx - tw / 2;
  const g = ctx.createLinearGradient(x, 0, x + tw, 0);
  g.addColorStop(0, grade.mid);
  g.addColorStop(1, '#ff7a1a');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x, cy - rh / 2);
  ctx.lineTo(x + tw, cy - rh / 2);
  ctx.lineTo(x + tw - rh * 0.5, cy + rh / 2);
  ctx.lineTo(x + rh * 0.5, cy + rh / 2);
  ctx.closePath();
  ctx.fill();
  // Folded ribbon ends.
  ctx.fillStyle = 'rgba(60,0,40,0.85)';
  ctx.beginPath();
  ctx.moveTo(x, cy - rh / 2);
  ctx.lineTo(x - rh * 0.55, cy);
  ctx.lineTo(x, cy + rh / 2);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + tw, cy - rh / 2);
  ctx.lineTo(x + tw + rh * 0.55, cy);
  ctx.lineTo(x + tw, cy + rh / 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, cx, cy + 1);
}

// The whole poster. `state.photos` holds up to 7 images (or nulls); panel 7
// may reuse the first sample as a getaway-car scene when no seventh face is
// loaded, so the collage is always complete.
export function drawCoverArt(canvas, state, sizeKey) {
  const size = SIZES[sizeKey] || SIZES.square;
  canvas.width = size.w;
  canvas.height = size.h;
  const ctx = canvas.getContext('2d');
  const { w, h } = size;
  const grade = gradeById(state.grade);
  const scale = w / 1080;
  ctx.fillStyle = '#160a24';
  ctx.fillRect(0, 0, w, h);

  const geo = panelRects(w, h, state.layout);
  const photos = state.photos || [];
  geo.rects.forEach((r, i) => {
    const img = photos[i] || (i === 6 ? photos[0] : null);
    const crop = (state.crops && state.crops[i]) || { zoom: 1.4, fx: 0.5, fy: 0.35, ox: 0, oy: 0 };
    ctx.save();
    slantedPath(ctx, r, geo.slant);
    ctx.clip();
    if (img) drawPhotoCover(ctx, img, r, crop, grade);
    else {
      const g = ctx.createLinearGradient(0, r.y, 0, r.y + r.h);
      g.addColorStop(0, '#3d1a5e');
      g.addColorStop(1, '#1a0b2e');
      ctx.fillStyle = g;
      ctx.fillRect(r.x, r.y, r.w, r.h);
    }
    ctx.restore();
    // Panel frame.
    ctx.save();
    slantedPath(ctx, r, geo.slant);
    ctx.strokeStyle = 'rgba(255,201,60,0.55)';
    ctx.lineWidth = Math.max(2, 3 * scale);
    ctx.stroke();
    ctx.restore();
    drawRoleTag(ctx, r, (state.roles && state.roles[i]) || ROLES[i], geo.slant, scale);
  });

  // Sunset skyline band + giant chrome title across the middle band.
  const bandH = geo.bandH;
  const bandY = geo.seam;
  drawSkyline(ctx, w, bandY, bandH, grade);
  const titleSize = drawChromeTitle(ctx, (state.title || 'NEON HARBOR').toUpperCase(), w / 2, bandY + bandH * 0.5, w, grade);

  // Script subtitle under the title, neon pink with a glow.
  ctx.save();
  ctx.font = `italic bold ${Math.round(titleSize * 0.36)}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#ff2e88';
  ctx.shadowBlur = Math.round(18 * scale);
  ctx.fillStyle = '#ff7ad9';
  ctx.fillText(state.subtitle || '', w / 2, bandY + bandH * 0.5 + titleSize * 0.58);
  ctx.restore();

  // Ribbon tagline below the subtitle.
  drawRibbon(ctx, (state.tagline || '').toUpperCase(), w / 2, bandY + bandH + titleSize * 0.42, w, grade);

  // Masthead: stars, press quote, VOL badge.
  ctx.fillStyle = '#160a24';
  ctx.fillRect(0, 0, w, geo.mast);
  ctx.fillStyle = '#ffc93c';
  ctx.font = `${Math.round(geo.mast * 0.42)}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('★★★★★', w * 0.015, geo.mast * 0.52);
  ctx.font = `${Math.round(geo.mast * 0.34)}px Anton, sans-serif`;
  ctx.fillStyle = '#ffe9a8';
  ctx.textAlign = 'center';
  ctx.fillText(`“${(state.quote || '').toUpperCase()}”  —  ${(state.quoteSource || '').toUpperCase()}`, w / 2, geo.mast * 0.52);
  const vol = state.vol || 'VOL. 1';
  ctx.font = `${Math.round(geo.mast * 0.32)}px Anton, sans-serif`;
  const vw = ctx.measureText(vol).width + geo.mast * 0.5;
  ctx.strokeStyle = '#ffc93c';
  ctx.lineWidth = Math.max(2, 2.5 * scale);
  ctx.strokeRect(w - vw - w * 0.015, geo.mast * 0.16, vw, geo.mast * 0.68);
  ctx.fillStyle = '#ffc93c';
  ctx.fillText(vol, w - vw / 2 - w * 0.015, geo.mast * 0.52);

  // Gold seal, overlapping the title band's right end.
  drawSeal(ctx, w * 0.90, bandY + bandH * 0.92, Math.round(w * 0.048), state.seal || 'BEST CAST');

  // Footer: billing block, barcode, COMING SOON.
  const footY = h - geo.foot;
  ctx.fillStyle = '#160a24';
  ctx.fillRect(0, footY, w, geo.foot);
  ctx.strokeStyle = 'rgba(255,201,60,0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(w * 0.015, footY);
  ctx.lineTo(w * 0.985, footY);
  ctx.stroke();
  ctx.fillStyle = '#e8dcc8';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const lines = (state.billing || '').split('\n');
  const bSize = Math.max(9, Math.round(w * 0.0115));
  ctx.font = `${bSize}px sans-serif`;
  lines.forEach((line, i) => {
    ctx.fillText(line.trim(), w * 0.42, footY + geo.foot * (0.32 + i * 0.26));
  });
  drawBarcode(ctx, w * 0.885, footY + geo.foot * 0.18, w * 0.085, geo.foot * 0.42);
  ctx.fillStyle = '#ff9d5c';
  ctx.font = `${Math.round(w * 0.020)}px Anton, sans-serif`;
  ctx.fillText('—  COMING SOON  —', w * 0.42, footY + geo.foot * 0.86);
  return size;
}
