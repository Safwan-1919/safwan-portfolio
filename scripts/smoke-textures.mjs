/**
 * Runtime smoke test for the procedural sketch engine.
 *
 * The theme draws all of its art on <canvas> 2D contexts. This test stubs a
 * strict 2D context that throws on non-finite drawing arguments, then exercises
 * every public texture + sketch function, so a broken seed or loop is caught
 * outside the browser.
 *
 * Run with: npm run smoke
 */

import { strict as assert } from 'node:assert';
import { installCanvasStub } from './lib/canvas-stub.mjs';

/* ------------------------------------------------------------------ stubs */

const { canvases } = installCanvasStub();

const textures = await import('./.smoke/textures.mjs');
const sketch = await import('./.smoke/sketch.mjs');
const ink = await import('./.smoke/ink.mjs');
const THREE = await import('three');

const cases = [];

function check(name, fn) {
  try {
    fn();
    cases.push({ name, ok: true });
  } catch (error) {
    cases.push({ name, ok: false, error: error instanceof Error ? error.message : String(error) });
  }
}

/* ------------------------------------------------------------ sketch maths */

check('createRandom is deterministic', () => {
  const a = sketch.createRandom(42);
  const b = sketch.createRandom(42);
  const first = [a(), a(), a()];
  const second = [b(), b(), b()];
  assert.deepEqual(first, second);
  first.forEach((value) => assert.ok(Number.isFinite(value) && value >= 0 && value < 1));
});

check('hashString is stable', () => {
  assert.equal(sketch.hashString('KRAFT'), sketch.hashString('KRAFT'));
  assert.notEqual(sketch.hashString('KRAFT'), sketch.hashString('kraft'));
  assert.ok(sketch.hashString('KRAFT') >= 0);
});

check('roughPolyline/roughLine produce finite wobbly points', () => {
  const random = sketch.createRandom(7);
  const points = sketch.roughPolyline(0, 0, 100, 40, random, 4, 6);
  assert.equal(points.length, 7);
  points.forEach((point) => assert.ok(Number.isFinite(point.x) && Number.isFinite(point.y)));
  // Endpoints keep a small deliberate wobble so strokes never look mechanical.
  assert.ok(Math.abs(points[0].x) < 3);
  assert.ok(Math.abs(points[6].x - 100) < 3);
  const d = sketch.roughLine(0, 0, 100, 40, random, 4, 6);
  assert.ok(d.startsWith('M '));
  assert.ok(d.split('L ').length > 5);
  assert.ok(!d.includes('NaN'));
});

check('roughRectPath closes with Z', () => {
  const d = sketch.roughRectPath(200, 120, 11);
  assert.ok(d.includes('Z'));
  assert.ok(!d.includes('NaN'));
});

check('roughEllipsePath is a closed curve', () => {
  const d = sketch.roughEllipsePath(50, 50, 30, 20, 5, 3);
  assert.ok(d.startsWith('M '));
  assert.ok(d.endsWith('Z'));
  assert.ok(!d.includes('NaN'));
});

check('hatch, scribble and doodle arrow are non-empty', () => {
  assert.ok(sketch.hatchLines(0, 0, 120, 60, 6, 3).length > 50);
  assert.ok(sketch.scribbleUnderlinePath(160, 9).includes('M '));
  assert.ok(sketch.doodleArrowPath(4, 90, 24).includes('M '));
});

check('tornClipPath returns a CSS polygon', () => {
  const clip = sketch.tornClipPath(21);
  assert.ok(clip.startsWith('polygon('));
  assert.ok(clip.endsWith(')'));
  assert.ok(!clip.includes('NaN'));
});

/* -------------------------------------------------------- procedural art */

check('paper surface textures build', () => {
  assert.ok(textures.paperTexture().isTexture);
  assert.ok(textures.wallTexture().isTexture);
  assert.ok(textures.floorTexture().isTexture);
  assert.ok(textures.ceilingTexture().isTexture);
});

check('every doodle icon renders', () => {
  const kinds = [
    'bulb',
    'pencil',
    'envelope',
    'coffee',
    'monitor',
    'phone',
    'trophy',
    'star',
    'medal',
    'certificate',
    'plane',
    'cat',
    'arrow',
    'plant',
    'lamp',
  ];
  kinds.forEach((kind) => assert.ok(textures.iconTexture(kind).isTexture, `icon ${kind}`));
});

check('iconDataUrl returns a PNG data URL', () => {
  assert.ok(textures.iconDataUrl('star').startsWith('data:image/png'));
});

check('door faces build for every station', () => {
  const doors = [
    { station: 'gallery', chapter: '02', title: 'The Gallery', tagline: 'Case studies hung like prints.', icon: 'star' },
    { station: 'studio', chapter: '03', title: 'The Studio', tagline: 'The stack and the process.', icon: 'monitor' },
    { station: 'about', chapter: '04', title: 'The Author', tagline: 'Who holds the pencil.', icon: 'pencil' },
    { station: 'contact', chapter: '05', title: 'The Post Room', tagline: 'Write a letter.', icon: 'envelope' },
  ];
  doors.forEach((door, index) =>
    assert.ok(textures.doorTexture({ ...door, seed: 4000 + index }).isTexture, `door ${door.station}`),
  );
});

check('all six wall-art variants render', () => {
  for (let seed = 0; seed < 12; seed += 1) {
    assert.ok(
      textures.artTexture({ id: `art-${seed}`, title: 'Aether', meta: '2025 · Lead', seed }).isTexture,
      `variant ${seed % 6}`,
    );
  }
});

check('avatar flip-book frames render', () => {
  for (let pose = 0; pose < 6; pose += 1) {
    assert.ok(textures.avatarTexture(pose).isTexture, `pose ${pose}`);
  }
  assert.ok(textures.avatarTexture(-3).isTexture);
  assert.ok(textures.avatarTexture(9).isTexture);
});

check('signage renders', () => {
  assert.ok(textures.signTexture('KRAFT', 'let us build something').isTexture);
});

check('caching returns the same instance', () => {
  assert.equal(textures.paperTexture(), textures.paperTexture());
  assert.equal(textures.iconTexture('cat'), textures.iconTexture('cat'));
});

check('clearTextureCache does not throw', () => {
  textures.clearTextureCache();
  assert.ok(textures.paperTexture().isTexture);
});

/* ------------------------------------------------- 3D geometry + ink layer */

check('wobbleGeometry keeps every vertex finite and inside the wobble budget', () => {
  const geometry = new THREE.BoxGeometry(2, 1.4, 0.3);
  const before = geometry.attributes.position.array.slice();
  const amount = 0.02;
  ink.wobbleGeometry(geometry, amount, 13);
  const after = geometry.attributes.position.array;

  assert.equal(after.length, before.length, 'vertex count changed');
  for (let i = 0; i < after.length; i += 1) {
    assert.ok(Number.isFinite(after[i]), `vertex ${i} is not finite`);
    assert.ok(Math.abs(after[i] - before[i]) <= amount, `vertex ${i} moved too far`);
  }
});

check('wobbleGeometry is deterministic and watertight at shared positions', () => {
  const a = ink.wobbleGeometry(new THREE.BoxGeometry(1, 1, 1), 0.03, 21);
  const b = ink.wobbleGeometry(new THREE.BoxGeometry(1, 1, 1), 0.03, 21);

  assert.deepEqual(
    Array.from(a.attributes.position.array),
    Array.from(b.attributes.position.array),
    'same seed produced different wobble',
  );

  // Duplicated corners (one per face) must land in the same place, otherwise
  // the paper surfaces would show cracks.
  const data = a.attributes.position.array;
  const seen = new Map();
  for (let i = 0; i < data.length; i += 3) {
    const key = `${data[i].toFixed(4)}|${data[i + 1].toFixed(4)}|${data[i + 2].toFixed(4)}`;
    seen.set(key, (seen.get(key) ?? 0) + 1);
  }
  const cornerCounts = Array.from(seen.values()).sort((x, y) => y - x);
  assert.ok(cornerCounts[0] >= 2, 'expected duplicated corners to stay welded');
});

check('ink materials are shared singletons', () => {
  assert.ok(ink.inkLineMaterial.isLineBasicMaterial);
  assert.ok(ink.softInkLineMaterial.isLineBasicMaterial);
  assert.notEqual(ink.inkLineMaterial, ink.softInkLineMaterial);
  assert.ok(ink.inkLineMaterial.opacity > ink.softInkLineMaterial.opacity);
});

check('edges geometry extracted from wobbled shapes stays valid', () => {
  const geometry = ink.wobbleGeometry(new THREE.BoxGeometry(0.6, 0.6, 0.6), 0.02, 33);
  const edges = new THREE.EdgesGeometry(geometry, 24);
  const positions = edges.attributes.position.array;
  assert.ok(positions.length > 0, 'no edges extracted');
  for (let i = 0; i < positions.length; i += 1) {
    assert.ok(Number.isFinite(positions[i]), `edge vertex ${i} is not finite`);
  }
});

/* ------------------------------------------------------------------ report */

const failed = cases.filter((entry) => !entry.ok);
cases.forEach((entry) => {
  console.log(`${entry.ok ? 'PASS' : 'FAIL'}  ${entry.name}${entry.ok ? '' : ` -> ${entry.error}`}`);
});

console.log(`\n${cases.length - failed.length}/${cases.length} checks passed · ${canvases.length} canvases drawn`);
if (failed.length) {
  console.error('\nSmoke test failed.');
  process.exit(1);
}
console.log('Sketch engine smoke test passed.');