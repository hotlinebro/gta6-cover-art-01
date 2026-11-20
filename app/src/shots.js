// Fixed scenes for screenshots: ?shot=editor shows the editor with the demo
// cast loaded; ?shot=cover shows one exported cover alone, at the size the
// `size` query names (wide, square or portrait). window.__shotReady is set
// once the scene has painted, so a screenshot waits for the real render.
export async function runShot(shot, query, helpers) {
  const { loadDemoCast, redraw, sizeKey } = helpers;
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    sizeKey(query.get('size') || 'wide');
  }
  await loadDemoCast();
  redraw();
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
