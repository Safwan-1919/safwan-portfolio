/**
 * 2D hand-drawn (sketch) geometry helpers.
 *
 * Everything here is deterministic: the same seed always produces the same
 * wobble, so React re-renders and CanvasTexture rebuilds stay pixel-stable.
 */

/** Tiny deterministic PRNG (mulberry32). */
export function createRandom(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Stable string -> number hash so text can seed a sketch. */
export function hashString(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export interface Point {
  x: number;
  y: number;
}

/** A single wobbly pen stroke, sampled as a polyline of points. */
export function roughPolyline(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  random: () => number,
  roughness = 2.2,
  segments = 5,
): Point[] {
  const points: Point[] = [{ x: x1, y: y1 }];
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;

  for (let i = 1; i <= segments; i += 1) {
    const t = i / segments;
    const wobble = (random() - 0.5) * roughness * (Math.sin(t * Math.PI) * 0.7 + 0.3);
    points.push({ x: x1 + dx * t + nx * wobble, y: y1 + dy * t + ny * wobble });
  }
  return points;
}

/** A single wobbly pen stroke, sampled as an SVG path fragment. */
export function roughLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  random: () => number,
  roughness = 2.2,
  segments = 5,
): string {
  return roughPolyline(x1, y1, x2, y2, random, roughness, segments)
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ');
}

/** Closed, hand-drawn rectangle path (drawn in a "double pass" pen style). */
export function roughRectPath(
  width: number,
  height: number,
  seed: number,
  options: { roughness?: number; inset?: number; doubleStroke?: boolean } = {},
): string {
  const { roughness = 3.2, inset = 2, doubleStroke = true } = options;
  const random = createRandom(seed);
  const x0 = inset;
  const y0 = inset;
  const x1 = width - inset;
  const y1 = height - inset;

  const corners: Point[] = [
    { x: x0, y: y0 },
    { x: x1, y: y0 },
    { x: x1, y: y1 },
    { x: x0, y: y1 },
  ];

  const pass = (jitter: number) => {
    let d = '';
    corners.forEach((point, index) => {
      const next = corners[(index + 1) % corners.length];
      const ox = (random() - 0.5) * jitter;
      const oy = (random() - 0.5) * jitter;
      const start = index === 0 ? `M ${(point.x + ox).toFixed(2)} ${(point.y + oy).toFixed(2)} ` : '';
      if (index === 0) {
        d += start;
      } else {
        d += `L ${(point.x + ox).toFixed(2)} ${(point.y + oy).toFixed(2)} `;
      }
      d += `${roughLine(point.x + ox, point.y + oy, next.x + ox * 0.6, next.y + oy * 0.6, random, roughness, 4)} `;
    });
    return `${d}Z`;
  };

  return doubleStroke ? `${pass(1.6)} ${pass(2.6)}` : pass(0);
}

/** Closed hand-drawn ellipse (pencil circle). */
export function roughEllipsePath(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  seed: number,
  roughness = 3,
): string {
  const random = createRandom(seed);
  const steps = 22;
  const parts: string[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const angle = (i / steps) * Math.PI * 2;
    const wobble = 1 + ((random() - 0.5) * roughness) / Math.max(rx, ry);
    const x = cx + Math.cos(angle) * rx * wobble;
    const y = cy + Math.sin(angle) * ry * wobble;
    parts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return `${parts.join(' ')} Z`;
}

/** Cross-hatching block: used to fake pencil shading in SVG + canvas. */
export function hatchLines(
  x: number,
  y: number,
  width: number,
  height: number,
  gap: number,
  seed: number,
): string {
  const random = createRandom(seed);
  const parts: string[] = [];
  for (let i = -height; i < width; i += gap) {
    const jitter = (random() - 0.5) * 2;
    parts.push(roughLine(x + i, y + height, x + i + height, y + jitter * 0.4, random, 1.2, 3));
  }
  return parts.join(' ');
}

/** Wobbly "torn paper" polygon points for CSS clip-paths. */
export function tornPolygonPoints(seed: number, steps = 22, jitter = 2.4): string {
  const random = createRandom(seed);
  const points: string[] = [];
  const push = (x: number, y: number) => points.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);

  push(0, 0);
  for (let i = 1; i < steps; i += 1) {
    push((i / steps) * 100, (random() - 0.5) * jitter);
  }
  push(100, 0);
  for (let i = 1; i < steps; i += 1) {
    push(100 - (i / steps) * 4 - (random() - 0.5) * jitter, (i / steps) * 100);
  }
  push(100, 100);
  for (let i = steps - 1; i > 0; i -= 1) {
    push((i / steps) * 100, 100 - (random() - 0.5) * jitter);
  }
  push(0, 100);
  for (let i = steps - 1; i > 0; i -= 1) {
    push((i / steps) * 4 + (random() - 0.5) * jitter, 100 - (i / steps) * 100);
  }
  return points.join(', ');
}

/** CSS clip-path value for a torn paper sheet. */
export function tornClipPath(seed: number): string {
  return `polygon(${tornPolygonPoints(seed)})`;
}

/** Doodle arrow used to point at things (SVG path data). */
export function doodleArrowPath(seed: number, length = 90, curve = 24): string {
  const random = createRandom(seed);
  const body = roughLine(4, 4, length, 4, random, 3, 6);
  const head = `M ${length - 14} ${4 - 9} ${roughLine(length - 14, 4 - 9, length, 4, random, 2, 2)} ${roughLine(
    length - 12,
    4 + 10,
    length,
    4,
    random,
    2,
    2,
  )}`;
  const tail = roughLine(4, 4, 4, 4 + curve, random, 2.5, 3);
  return `${body} ${head} ${tail}`;
}

/** Underline scribble (two passes, like a real pen). */
export function scribbleUnderlinePath(width: number, seed: number, y = 6): string {
  const random = createRandom(seed);
  return `${roughLine(0, y, width, y, random, 2.4, 7)} ${roughLine(2, y + 3.5, width - 6, y + 2.5, random, 2, 5)}`;
}