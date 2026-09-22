/**
 * Integration test: boots the real App in a DOM (jsdom) and walks the visitor
 * journey — preloader, corridor HUD, keyboard travel, achievements, opening a
 * room sheet, closing it, sound toggle and the stamp drawer.
 *
 * jsdom cannot create a WebGL context, so App detects the missing WebGL support
 * and renders the paper fallback: the DOM layer, store, GSAP tweens and the
 * achievement pipeline are all exercised without a GPU.
 *
 *   npm run test:app
 */

import { strict as assert } from 'node:assert';
import { JSDOM } from 'jsdom';
import { buildSync } from 'esbuild';
import { mkdirSync, rmSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, '.smoke');
mkdirSync(outDir, { recursive: true });

/* ------------------------------------------------- 1. bundle the app entry */

const bundle = join(outDir, 'app-entry.mjs');
buildSync({
  entryPoints: [join(here, 'app-entry.tsx')],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2020',
  jsx: 'automatic',
  external: ['react', 'react-dom', 'react/jsx-runtime', 'gsap', 'three', '@react-three/fiber', '@react-three/drei'],
  define: { 'import.meta.env.VITE_CONTACT_ENDPOINT': 'undefined' },
  outfile: bundle,
  logLevel: 'warning',
});

/* ------------------------------------------------------- 2. build the DOM */

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'https://kraft.test/',
  pretendToBeVisual: true,
});

const { window: win } = dom;

win.matchMedia = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: () => undefined,
  removeEventListener: () => undefined,
  addListener: () => undefined,
  removeListener: () => undefined,
  dispatchEvent: () => false,
});

win.IntersectionObserver = class {
  constructor(callback) {
    this.callback = callback;
  }

  observe(target) {
    this.callback([{ isIntersecting: true, target }], this);
  }

  unobserve() {
    /* noop */
  }

  disconnect() {
    /* noop */
  }
};

win.HTMLCanvasElement.prototype.getContext = () => null; // no WebGL, no 2D

[
  'window',
  'document',
  'navigator',
  'HTMLElement',
  'HTMLCanvasElement',
  'Element',
  'Node',
  'Event',
  'WheelEvent',
  'KeyboardEvent',
  'MouseEvent',
  'localStorage',
  'requestAnimationFrame',
  'cancelAnimationFrame',
  'getComputedStyle',
  'MutationObserver',
  'IntersectionObserver',
].forEach((key) => {
  if (win[key] === undefined) return;
  try {
    globalThis[key] = win[key];
  } catch {
    // Some globals (navigator) are read-only accessors in modern Node.
    Object.defineProperty(globalThis, key, { value: win[key], configurable: true, writable: true });
  }
});

// React's act() waits for the work queue to drain, which never happens while the
// GSAP ticker keeps requesting animation frames. Flush effects with plain awaits
// instead - the assertions below are about real, observable DOM state.
const act = async (fn) => {
  await fn();
};

/* ------------------------------------------------------------- test runner */

const results = [];
const check = (name, fn) => {
  try {
    fn();
    results.push({ name, ok: true });
  } catch (error) {
    results.push({ name, ok: false, error: error instanceof Error ? error.message : String(error) });
  }
};

const { mountApp, content } = await import(pathToFileURL(bundle).href);
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const container = win.document.getElementById('root');
let unmount = () => undefined;

const originalError = console.error;
console.error = (...args) => {
  if (String(args[0] ?? '').includes('not wrapped in act')) return;
  originalError(...args);
};

const fire = (target, event) => target.dispatchEvent(event);
const key = (name) => new win.KeyboardEvent('keydown', { key: name, bubbles: true });
const text = (node) => (node ? node.textContent ?? '' : '');

await act(async () => {
  unmount = mountApp(container);
  // Let React commit the first render before asserting on it.
  await wait(400);
});

/* --------------------------------------------------------- 3. boot checks */

check('preloader is on screen at boot', () => {
  assert.ok(container.querySelector('.preloader'), 'no .preloader rendered');
  assert.ok(container.querySelector('.preloader__bar-fill'), 'no progress bar');
});

check('skip link, navigation and legend are rendered', () => {
  assert.equal(container.querySelectorAll('.nav__link').length, content.stations.length);
  assert.ok(container.querySelector('.sr-focusable'), 'no skip link');
  assert.ok(container.querySelector('.hud__instructions'), 'no control legend');
});

await act(async () => {
  await wait(4200);
});

check('preloader hands over to the corridor', () => {
  assert.equal(container.querySelector('.preloader'), null, 'preloader still mounted');
});

check('hero copy is visible after the hand-over', () => {
  const hero = container.querySelector('.hero');
  assert.ok(hero, 'no hero section');
  assert.equal(hero.getAttribute('aria-hidden'), 'false');
  assert.ok(text(container.querySelector('.hero__title')).trim().length > 0, 'hero title empty');
  assert.ok(container.querySelector('.hero__stats'), 'stats missing');
});

check('first-visit achievement toast fires with a stamp counter', () => {
  const popup = container.querySelector('.achievement-popup');
  assert.ok(popup, 'no achievement popup');
  assert.ok(text(popup).includes('Welcome to the corridor'), `unexpected copy: ${text(popup)}`);
  assert.ok(/\d+/.test(text(container.querySelector('.nav__tool-badge'))), 'no stamp counter');
});

check('torn scroll bar lists every chapter', () => {
  assert.equal(container.querySelectorAll('.tornbar__tick').length, content.stations.length);
  assert.ok(text(container.querySelector('.tornbar__caption')).includes(content.stations[0].title));
});

/* --------------------------------------------------- 4. travelling the hall */

const pressKey = async (name) => {
  await act(async () => {
    fire(win, key(name));
    await wait(60);
  });
};

const activeStation = () => text(container.querySelector('.nav__link.is-active'));
const stampCount = () => Number(text(container.querySelector('.nav__tool-badge')));

await pressKey('ArrowDown');
await act(async () => {
  await wait(2800);
});

check('ArrowDown travels to the next station', () => {
  const expected = content.stations[1].label;
  assert.ok(activeStation().includes(expected), `expected "${expected}", active station is "${activeStation()}"`);
});

check('arriving unlocks a room stamp', () => {
  assert.ok(stampCount() >= 2, `expected at least 2 stamps, got ${stampCount()}`);
});

await pressKey('5');
await act(async () => {
  await wait(3200);
});

check('number key 5 jumps to the post room', () => {
  const expected = content.stations[4].label;
  assert.ok(activeStation().includes(expected), `expected "${expected}", active station is "${activeStation()}"`);
});

await pressKey('1');
await act(async () => {
  await wait(3400);
});

check('number key 1 returns to the corridor', () => {
  const expected = content.stations[0].label;
  assert.ok(activeStation().includes(expected), `expected "${expected}", active station is "${activeStation()}"`);
});

/* --------------------------------------------------------------- 5. sheets */

// The primary hero call to action opens the projects room.
const ctaButton = container.querySelector('.hero__actions .sketch-btn');

check('the hero call to action exists', () => {
  assert.ok(ctaButton, 'no primary button in the hero');
});

await act(async () => {
  fire(ctaButton, new win.MouseEvent('click', { bubbles: true }));
  await wait(3600);
});

check('the call to action opens the projects sheet', () => {
  const sheet = container.querySelector('.sheet');
  assert.ok(sheet, 'no sheet rendered');
  assert.ok(sheet.className.includes('is-open'), 'sheet never animated open');
  assert.ok(
    text(container.querySelector('.sheet__title')).includes(content.stations[1].title),
    `expected "${content.stations[1].title}", got "${text(container.querySelector('.sheet__title'))}"`,
  );
});

check('case studies render with their stack tags', () => {
  assert.ok(
    container.querySelectorAll('.sheet .card').length >= content.projects.length,
    'case-study cards missing',
  );
  assert.ok(container.querySelectorAll('.sheet .tag').length >= content.projects.length * 3, 'stack tags missing');
});

await act(async () => {
  fire(win, key('Escape'));
  await wait(400);
});

check('Escape closes the room sheet', () => {
  assert.equal(container.querySelector('.sheet'), null, 'sheet still mounted');
});

/* -------------------------------------------------------- 6. sound + stamps */

const toolButton = (label) =>
  Array.from(container.querySelectorAll('.nav__tool')).find((button) => text(button).includes(label));

await act(async () => {
  fire(toolButton('sound'), new win.MouseEvent('click', { bubbles: true }));
  await wait(150);
});

check('sound toggle flips and persists the preference', () => {
  assert.equal(win.localStorage.getItem('kraft:sound'), 'off');
  assert.ok(text(toolButton('sound')).includes('off'), 'label did not update');
});

await act(async () => {
  fire(toolButton('stamps'), new win.MouseEvent('click', { bubbles: true }));
  await wait(150);
});

check('stamp drawer lists every achievement and the unlocked ones', () => {
  const panel = container.querySelector('.achievements-panel');
  assert.ok(panel.className.includes('is-open'), 'drawer did not open');
  assert.equal(panel.querySelectorAll('.achievements-panel__item').length, content.unlocks.length);
  assert.ok(panel.querySelectorAll('.achievements-panel__item.is-unlocked').length >= 2, 'no unlocked stamps');
});

check('achievement progress is persisted for the next visit', () => {
  const stored = JSON.parse(win.localStorage.getItem('kraft:unlocks') ?? '[]');
  assert.ok(Array.isArray(stored) && stored.includes('entered'), `unlocks not persisted: ${stored}`);
});

/* --------------------------------------------------------------- 7. teardown */

await act(async () => {
  unmount();
  await wait(80);
});

check('the app unmounts cleanly', () => {
  assert.equal(container.querySelector('.nav'), null, 'nav still mounted after unmount');
});

console.error = originalError;

/* ------------------------------------------------------------------ report */

const failed = results.filter((entry) => !entry.ok);
results.forEach((entry) => {
  console.log(`${entry.ok ? 'PASS' : 'FAIL'}  ${entry.name}${entry.ok ? '' : ` -> ${entry.error}`}`);
});
console.log(`\n${results.length - failed.length}/${results.length} boot-journey checks passed`);

rmSync(outDir, { recursive: true, force: true });

if (failed.length) {
  console.error('\nApp boot integration test failed.');
  process.exit(1);
}
console.log('App boot integration test passed.');

// The GSAP ticker keeps frames alive; exit explicitly so the runner terminates.
process.exit(0);