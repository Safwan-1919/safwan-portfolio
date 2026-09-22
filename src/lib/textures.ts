/**
 * Procedural hand-drawn textures.
 *
 * The theme ships zero image assets: every wall, door, print and icon is drawn
 * on a <canvas> with a "pencil" stroke helper and cached as a THREE.CanvasTexture.
 * Generation happens once, after the handwriting webfonts have loaded, so the
 * baked-in lettering uses Caveat / Patrick Hand.
 */

import * as THREE from 'three';
import { createRandom, roughPolyline } from './sketch';
import type { StationId } from '../types';

export type IconKind =
  | 'bulb'
  | 'pencil'
  | 'envelope'
  | 'coffee'
  | 'monitor'
  | 'phone'
  | 'trophy'
  | 'star'
  | 'medal'
  | 'certificate'
  | 'plane'
  | 'cat'
  | 'arrow'
  | 'plant'
  | 'lamp';

export const INK = '#1a1a1a';
export const INK_SOFT = '#4a4a4a';
export const PAPER = '#fbfaf7';

const cache = new Map<string, THREE.CanvasTexture>();
const dataUrlCache = new Map<string, string>();

interface Surface {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
}

function surface(width: number, height: number, background?: string): Surface {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);
  }
  return { canvas, ctx };
}

/** Deterministic pencil stroke: one or two wobbly passes between two points. */
function pencilStroke(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  random: () => number,
  options: { width?: number; roughness?: number; segments?: number; alpha?: number; passes?: number } = {},
): void {
  const { width = 2, roughness = 2, segments = 5, alpha = 1, passes = 1 } = options;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (let pass = 0; pass < passes; pass += 1) {
    const points = roughPolyline(x1, y1, x2, y2, random, roughness, segments);
    ctx.globalAlpha = pass === 0 ? alpha : alpha * 0.5;
    ctx.strokeStyle = pass === 0 ? INK : INK_SOFT;
    ctx.lineWidth = pass === 0 ? width : width * 0.75;
    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();
  }
  ctx.restore();
}

/** Hand-drawn rectangle (double stroke, like a real sketch). */
function pencilRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  random: () => number,
  options: { roughness?: number; passes?: number; lineWidth?: number; alpha?: number } = {},
): void {
  const { roughness = 3, passes = 2, lineWidth = 2.2, alpha = 1 } = options;
  const corners: [number, number][] = [
    [x, y],
    [x + width, y],
    [x + width, y + height],
    [x, y + height],
  ];
  corners.forEach(([cx, cy], index) => {
    const [nx, ny] = corners[(index + 1) % corners.length];
    const jitterX = (random() - 0.5) * 2.2;
    const jitterY = (random() - 0.5) * 2.2;
    pencilStroke(ctx, cx + jitterX, cy + jitterY, nx + jitterX * 0.5, ny + jitterY * 0.5, random, {
      width: lineWidth,
      roughness,
      segments: 5,
      passes,
      alpha,
    });
  });
}

/** Diagonal cross-hatch shading block. */
function hatch(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  gap: number,
  random: () => number,
  alpha = 0.28,
): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();
  for (let i = -height; i < width; i += gap) {
    pencilStroke(ctx, x + i, y + height, x + i + height, y, random, {
      width: 1.4,
      roughness: 1.4,
      segments: 3,
      alpha,
    });
  }
  ctx.restore();
}

function toTexture({ canvas }: Surface, options: { repeat?: [number, number]; anisotropy?: number } = {}): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  if (options.repeat) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(options.repeat[0], options.repeat[1]);
  }
  texture.anisotropy = options.anisotropy ?? 4;
  texture.needsUpdate = true;
  return texture;
}

function memo(key: string, build: () => THREE.CanvasTexture): THREE.CanvasTexture {
  const found = cache.get(key);
  if (found) return found;
  const created = build();
  cache.set(key, created);
  return created;
}

/** Speckled paper grain used for every surface + the DOM overlay. */
function sprinklePaper(ctx: CanvasRenderingContext2D, width: number, height: number, seed: number): void {
  const random = createRandom(seed);
  ctx.save();
  for (let i = 0; i < width * height * 0.012; i += 1) {
    const x = random() * width;
    const y = random() * height;
    const size = random() * 1.8 + 0.3;
    ctx.globalAlpha = 0.02 + random() * 0.05;
    ctx.fillStyle = random() > 0.55 ? INK : '#8a8578';
    ctx.fillRect(x, y, size, size);
  }
  ctx.globalAlpha = 0.045;
  ctx.strokeStyle = '#8a8578';
  ctx.lineWidth = 0.7;
  for (let i = 0; i < 90; i += 1) {
    const x = random() * width;
    const y = random() * height;
    const angle = random() * Math.PI;
    const length = 8 + random() * 44;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + Math.cos(angle) * length * 0.5 + 4, y + Math.sin(angle) * length, x + Math.cos(angle) * length, y + Math.sin(angle) * length * 0.35);
    ctx.stroke();
  }
  ctx.restore();
}

const HAND_FONT = 'Caveat, "Patrick Hand", cursive';
const HAND_ALT_FONT = '"Patrick Hand", Caveat, cursive';
const DOODLE_FONT = '"Gloria Hallelujah", Caveat, cursive';

/** Plain paper: used for wall panels, signage, sheets and DOM backdrops. */
export function paperTexture(): THREE.CanvasTexture {
  return memo('paper', () => {
    const s = surface(512, 512, PAPER);
    sprinklePaper(s.ctx, 512, 512, 991);
    return toTexture(s, { repeat: [4, 4], anisotropy: 8 });
  });
}

/** Corridor wall: paper + faint plaster patches + pencil seams. */
export function wallTexture(): THREE.CanvasTexture {
  return memo('wall', () => {
    const width = 512;
    const height = 512;
    const s = surface(width, height, '#f7f5f0');
    const random = createRandom(4242);
    sprinklePaper(s.ctx, width, height, 77);
    for (let i = 0; i < 22; i += 1) {
      hatch(s.ctx, random() * width, random() * height, 40 + random() * 160, 20 + random() * 90, 5 + random() * 4, random, 0.05);
    }
    for (let i = 0; i < 9; i += 1) {
      const x = (i / 9) * width + random() * 12;
      pencilStroke(s.ctx, x, 0, x + (random() - 0.5) * 6, height, random, {
        width: 1.1,
        roughness: 3,
        segments: 6,
        alpha: 0.08,
      });
    }
    return toTexture(s, { repeat: [3, 1.4], anisotropy: 8 });
  });
}

/** Floor: hand-drawn planks with hatched grain. */
export function floorTexture(): THREE.CanvasTexture {
  return memo('floor', () => {
    const width = 1024;
    const height = 512;
    const s = surface(width, height, '#f4f1ea');
    const random = createRandom(8181);
    sprinklePaper(s.ctx, width, height, 313);

    const plankHeight = height / 6;
    for (let row = 0; row < 6; row += 1) {
      const y = row * plankHeight;
      pencilStroke(s.ctx, 0, y, width, y, random, { width: 2, roughness: 3.4, segments: 12, alpha: 0.45, passes: 2 });
      const offset = row % 2 === 0 ? 220 : 640;
      [offset, offset + 512].forEach((x) => {
        if (x < width) {
          pencilStroke(s.ctx, x, y, x + (random() - 0.5) * 8, y + plankHeight, random, {
            width: 1.6,
            roughness: 2.6,
            segments: 4,
            alpha: 0.32,
          });
        }
      });
      for (let i = 0; i < 5; i += 1) {
        const gy = y + 10 + random() * (plankHeight - 20);
        pencilStroke(s.ctx, random() * width * 0.5, gy, width * 0.5 + random() * width * 0.4, gy + (random() - 0.5) * 6, random, {
          width: 1.1,
          roughness: 2.4,
          segments: 6,
          alpha: 0.16,
        });
      }
      hatch(s.ctx, 0, y + plankHeight * 0.55, width, plankHeight * 0.45, 9, random, 0.06);
    }
    return toTexture(s, { repeat: [2.2, 2.6], anisotropy: 8 });
  });
}

/** Ceiling: pale paper with a soft cross-beam rhythm. */
export function ceilingTexture(): THREE.CanvasTexture {
  return memo('ceiling', () => {
    const width = 512;
    const height = 512;
    const s = surface(width, height, '#f9f8f4');
    const random = createRandom(5150);
    sprinklePaper(s.ctx, width, height, 512);
    for (let i = 0; i < 4; i += 1) {
      const y = (i / 4) * height;
      pencilStroke(s.ctx, 0, y, width, y, random, { width: 3, roughness: 4, segments: 10, alpha: 0.14, passes: 2 });
      hatch(s.ctx, 0, y, width, 14, 7, random, 0.05);
    }
    return toTexture(s, { repeat: [3, 1.6], anisotropy: 8 });
  });
}

/** Wraps text into lines that fit the given width. */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  });
  if (current) lines.push(current);
  return lines;
}

/** Door leaf: outer frame, two recessed panels, hinges and a knob. */
function drawDoorLeaf(ctx: CanvasRenderingContext2D, width: number, height: number, seed: number): void {
  const random = createRandom(seed);
  pencilRect(ctx, 8, 8, width - 16, height - 16, random, { roughness: 4, passes: 2, lineWidth: 3 });
  pencilRect(ctx, 46, 52, width - 92, height - 132, random, { roughness: 3.4, passes: 2, lineWidth: 2.2 });
  pencilRect(ctx, 66, 322, width - 132, 168, random, { roughness: 3, passes: 1, lineWidth: 1.8 });
  pencilRect(ctx, 66, height - 300, width - 132, 176, random, { roughness: 3, passes: 1, lineWidth: 1.8 });

  [96, height - 132].forEach((y) => {
    pencilRect(ctx, 20, y, 26, 34, random, { roughness: 2, passes: 2, lineWidth: 2 });
    hatch(ctx, 20, y, 26, 34, 5, random, 0.3);
  });

  const knobX = width - 84;
  const knobY = height * 0.55;
  ctx.save();
  ctx.strokeStyle = INK;
  for (let pass = 0; pass < 2; pass += 1) {
    ctx.globalAlpha = pass === 0 ? 1 : 0.5;
    ctx.lineWidth = pass === 0 ? 2.4 : 1.8;
    ctx.beginPath();
    const radius = pass === 0 ? 15 : 17.5;
    for (let i = 0; i <= 26; i += 1) {
      const angle = (i / 26) * Math.PI * 2;
      const wobble = 1 + (random() - 0.5) * 0.08;
      const x = knobX + Math.cos(angle) * radius * wobble;
      const y = knobY + Math.sin(angle) * radius * wobble;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();
  hatch(ctx, knobX - 24, knobY - 24, 48, 48, 6, random, 0.12);

  // Coffee ring stain - the studio always smells like coffee.
  ctx.save();
  ctx.globalAlpha = 0.1;
  ctx.strokeStyle = '#8a6a3f';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(width - 96, height - 186, 34, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/** Hanging plaque with chapter number, title and tagline. */
function drawDoorPlaque(
  ctx: CanvasRenderingContext2D,
  width: number,
  top: number,
  chapter: string,
  title: string,
  tagline: string,
  seed: number,
): void {
  const random = createRandom(seed + 3);
  const plaqueX = 54;
  const plaqueW = width - 108;
  const plaqueH = 172;

  ctx.save();
  ctx.fillStyle = '#fffefb';
  ctx.fillRect(plaqueX - 8, top - 10, plaqueW + 16, plaqueH + 20);
  ctx.restore();
  pencilRect(ctx, plaqueX - 8, top - 10, plaqueW + 16, plaqueH + 20, random, { roughness: 3, passes: 2, lineWidth: 2.4 });
  pencilStroke(ctx, width / 2 - 30, 40, plaqueX + 20, top - 6, random, { width: 1.6, roughness: 2, segments: 3, alpha: 0.5 });
  pencilStroke(ctx, width / 2 + 30, 40, plaqueX + plaqueW - 20, top - 6, random, { width: 1.6, roughness: 2, segments: 3, alpha: 0.5 });

  ctx.save();
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.font = `400 32px ${DOODLE_FONT}`;
  ctx.fillText(`CH. ${chapter}`, width / 2, top + 40);
  ctx.font = `700 52px ${HAND_FONT}`;
  const titleLines = wrapText(ctx, title, plaqueW - 24).slice(0, 2);
  titleLines.forEach((line, index) => {
    ctx.fillText(line, width / 2, top + 96 + index * 48);
  });
  ctx.globalAlpha = 0.72;
  ctx.font = `400 27px ${HAND_ALT_FONT}`;
  const tagLines = wrapText(ctx, tagline, plaqueW - 12).slice(0, 2);
  tagLines.forEach((line, index) => {
    ctx.fillText(line, width / 2, top + 100 + titleLines.length * 48 + index * 30);
  });
  ctx.restore();
}

/** A full hand-drawn door face, cached per station. */
export function doorTexture(options: {
  station: StationId;
  chapter: string;
  title: string;
  tagline: string;
  icon: IconKind;
  seed: number;
}): THREE.CanvasTexture {
  return memo(`door-${options.station}`, () => {
    const width = 420;
    const height = 840;
    const s = surface(width, height, '#fdfcf8');
    const { ctx } = s;
    const random = createRandom(options.seed);
    sprinklePaper(ctx, width, height, options.seed + 12);
    drawDoorLeaf(ctx, width, height, options.seed);
    drawDoorPlaque(ctx, width, 108, options.chapter, options.title, options.tagline, options.seed);
    drawIcon(ctx, options.icon, width / 2 - 70, height - 296, 140, options.seed + 5, 1.35);

    ctx.save();
    ctx.fillStyle = INK_SOFT;
    ctx.font = `400 30px ${HAND_ALT_FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('open me', width / 2, height - 74);
    ctx.restore();
    pencilStroke(ctx, width / 2 - 46, height - 60, width / 2 + 48, height - 62, random, {
      width: 1.8,
      roughness: 2.4,
      segments: 4,
      alpha: 0.45,
    });

    return toTexture(s);
  });
}

/** Abstract framed artwork for the gallery wall, derived from a project seed. */
export function artTexture(options: { id: string; title: string; meta: string; seed: number }): THREE.CanvasTexture {
  return memo(`art-${options.id}`, () => {
    const size = 512;
    const s = surface(size, size, '#fffefb');
    const { ctx } = s;
    const random = createRandom(options.seed);
    sprinklePaper(ctx, size, size, options.seed + 31);

    const variant = options.seed % 6;
    const margin = 46;
    const inner = size - margin * 2;
    const centre = size / 2;

    if (variant === 0) {
      for (let i = 0; i < 7; i += 1) {
        const radius = 26 + i * 24;
        ctx.save();
        ctx.strokeStyle = INK;
        ctx.lineWidth = 1.8;
        ctx.globalAlpha = 0.85 - i * 0.07;
        ctx.beginPath();
        for (let j = 0; j <= 30; j += 1) {
          const angle = (j / 30) * Math.PI * 2;
          const wobble = 1 + (random() - 0.5) * 0.05;
          const x = centre + Math.cos(angle) * radius * wobble;
          const y = centre + Math.sin(angle) * radius * wobble;
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      }
      hatch(ctx, centre - 70, centre - 70, 140, 140, 8, random, 0.18);
    } else if (variant === 1) {
      const cells = 4;
      const cell = inner / cells;
      for (let row = 0; row < cells; row += 1) {
        for (let col = 0; col < cells; col += 1) {
          const x = margin + col * cell;
          const y = margin + row * cell;
          pencilRect(ctx, x + 4, y + 4, cell - 8, cell - 8, random, { roughness: 3, passes: 1, lineWidth: 1.6 });
          if ((row + col) % 3 === 0) hatch(ctx, x + 8, y + 8, cell - 16, cell - 16, 7, random, 0.22);
          if ((row * cells + col) % 5 === 0) {
            ctx.save();
            ctx.globalAlpha = 0.55;
            ctx.fillStyle = INK;
            ctx.beginPath();
            ctx.arc(x + cell / 2, y + cell / 2, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }
      }
    } else if (variant === 2) {
      for (let i = 0; i < 24; i += 1) {
        const y = margin + (i / 23) * inner;
        ctx.save();
        ctx.strokeStyle = INK;
        ctx.globalAlpha = 0.7;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(margin, y);
        for (let x = margin; x <= size - margin; x += 10) {
          ctx.lineTo(x, y + Math.sin(x * 0.05 + i * 0.35) * (4 + Math.sin(i * 0.6) * 12));
        }
        ctx.stroke();
        ctx.restore();
      }
    } else if (variant === 3) {
      const bars = 8;
      const barWidth = inner / (bars * 2);
      for (let i = 0; i < bars; i += 1) {
        const height = 40 + random() * (inner - 80);
        const x = margin + i * (barWidth * 2);
        pencilRect(ctx, x, size - margin - height, barWidth, height, random, { roughness: 2.4, passes: 1, lineWidth: 1.6 });
        if (i % 2 === 0) hatch(ctx, x, size - margin - height, barWidth, height, 6, random, 0.2);
      }
      ctx.save();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      for (let i = 0; i < 12; i += 1) {
        const x = margin + (i / 11) * inner;
        const y = size - margin - 30 - random() * (inner - 100);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
    } else if (variant === 4) {
      const radius = inner / 2.4;
      for (let i = 0; i < 44; i += 1) {
        const angle = (i / 44) * Math.PI;
        pencilStroke(
          ctx,
          centre + Math.cos(angle) * radius,
          centre + Math.sin(angle) * radius,
          centre + Math.cos(angle) * radius * 0.3,
          centre + Math.sin(angle) * radius * 0.3,
          random,
          { width: 1.4, roughness: 3, segments: 3, alpha: 0.5 },
        );
      }
      hatch(ctx, centre - radius, centre - radius, radius * 2, radius, 8, random, 0.14);
    } else {
      for (let i = 0; i < 46; i += 1) {
        const x = margin + random() * inner;
        const y = margin + random() * inner;
        pencilStroke(ctx, x, y, x + (random() - 0.5) * 70, y + (random() - 0.5) * 70, random, {
          width: 1.2 + random() * 1.6,
          roughness: 3.4,
          segments: 3,
          alpha: 0.3 + random() * 0.5,
        });
      }
    }

    // Museum plate: title + meta in handwriting.
    ctx.save();
    ctx.fillStyle = INK;
    ctx.textAlign = 'center';
    ctx.font = `700 40px ${HAND_FONT}`;
    ctx.fillText(options.title, centre, size - 52);
    ctx.globalAlpha = 0.7;
    ctx.font = `400 24px ${HAND_ALT_FONT}`;
    ctx.fillText(options.meta, centre, size - 24);
    ctx.restore();
    pencilStroke(ctx, centre - 70, size - 42, centre + 70, size - 44, random, {
      width: 1.4,
      roughness: 2,
      segments: 4,
      alpha: 0.4,
    });

    return toTexture(s);
  });
}

/**
 * The shared doodle library. Everything is drawn inside a normalised 0..1 box,
 * so the same icon works standalone on a plane or composed onto a door face.
 */
function drawIcon(
  ctx: CanvasRenderingContext2D,
  kind: IconKind,
  x: number,
  y: number,
  size: number,
  seed: number,
  strokeScale = 1,
): void {
  const random = createRandom(seed + kind.length * 37);
  const px = (u: number) => x + u * size;
  const py = (v: number) => y + v * size;
  const line = (x1: number, y1: number, x2: number, y2: number, width = 2.6, roughness = 2.6) =>
    pencilStroke(ctx, px(x1), py(y1), px(x2), py(y2), random, {
      width: width * strokeScale,
      roughness: roughness * strokeScale,
      segments: 5,
    });
  const circle = (cx: number, cy: number, r: number, width = 2.6) => {
    for (let pass = 0; pass < 2; pass += 1) {
      ctx.save();
      ctx.strokeStyle = INK;
      ctx.lineWidth = (pass === 0 ? width : width * 0.7) * strokeScale;
      ctx.globalAlpha = pass === 0 ? 1 : 0.5;
      ctx.beginPath();
      for (let i = 0; i <= 24; i += 1) {
        const angle = (i / 24) * Math.PI * 2;
        const wobble = 1 + (random() - 0.5) * 0.07;
        const ax = px(cx) + Math.cos(angle) * r * size * wobble;
        const ay = py(cy) + Math.sin(angle) * r * size * wobble;
        if (i === 0) ctx.moveTo(ax, ay);
        else ctx.lineTo(ax, ay);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
  };
  const box = (bx: number, by: number, bw: number, bh: number) =>
    pencilRect(ctx, px(bx), py(by), bw * size, bh * size, random, {
      roughness: 2.8 * strokeScale,
      passes: 2,
      lineWidth: 2.4 * strokeScale,
    });

  switch (kind) {
    case 'lamp':
      line(0.5, 0, 0.5, 0.34, 2.2);
      line(0.3, 0.34, 0.7, 0.34, 2.2);
      line(0.3, 0.34, 0.22, 0.62, 2.6);
      line(0.7, 0.34, 0.78, 0.62, 2.6);
      line(0.22, 0.62, 0.78, 0.62, 2.6);
      circle(0.5, 0.72, 0.12);
      break;
    case 'bulb':
      circle(0.5, 0.42, 0.28);
      line(0.42, 0.72, 0.58, 0.72, 2.6);
      line(0.44, 0.82, 0.56, 0.82, 2.4);
      line(0.42, 0.9, 0.58, 0.9, 2.4);
      line(0.42, 0.42, 0.42, 0.54, 1.6, 3.4);
      line(0.58, 0.42, 0.58, 0.54, 1.6, 3.4);
      line(0.42, 0.54, 0.58, 0.54, 1.4, 3);
      for (let i = 0; i < 8; i += 1) {
        const angle = (i / 8) * Math.PI * 2;
        line(
          0.5 + Math.cos(angle) * 0.36,
          0.42 + Math.sin(angle) * 0.36,
          0.5 + Math.cos(angle) * 0.46,
          0.42 + Math.sin(angle) * 0.46,
          1.8,
          2,
        );
      }
      break;
    case 'pencil':
      line(0.14, 0.82, 0.72, 0.16, 3);
      line(0.2, 0.9, 0.8, 0.22, 3);
      line(0.72, 0.16, 0.8, 0.22, 3);
      line(0.14, 0.82, 0.2, 0.9, 3);
      line(0.8, 0.22, 0.9, 0.12, 3);
      line(0.86, 0.2, 0.94, 0.28, 3);
      line(0.9, 0.12, 0.94, 0.28, 3);
      hatch(ctx, px(0.2), py(0.6), size * 0.28, size * 0.24, 5 * strokeScale, random, 0.22);
      break;
    case 'envelope':
      box(0.08, 0.26, 0.84, 0.5);
      line(0.08, 0.26, 0.5, 0.56, 2.4);
      line(0.92, 0.26, 0.5, 0.56, 2.4);
      box(0.68, 0.32, 0.16, 0.14);
      break;
    case 'coffee':
      line(0.18, 0.34, 0.74, 0.34, 2.8);
      line(0.22, 0.34, 0.28, 0.82, 2.6);
      line(0.7, 0.34, 0.64, 0.82, 2.6);
      line(0.28, 0.82, 0.64, 0.82, 2.6);
      line(0.74, 0.42, 0.88, 0.5, 2.2);
      line(0.88, 0.5, 0.84, 0.66, 2.2);
      line(0.84, 0.66, 0.72, 0.64, 2.2);
      line(0.36, 0.26, 0.34, 0.12, 1.8, 3.4);
      line(0.46, 0.24, 0.46, 0.08, 1.8, 3.4);
      line(0.56, 0.26, 0.58, 0.12, 1.8, 3.4);
      break;
    case 'monitor':
      box(0.06, 0.16, 0.88, 0.56);
      line(0.5, 0.72, 0.5, 0.84, 2.6);
      line(0.34, 0.86, 0.66, 0.86, 2.8);
      line(0.16, 0.3, 0.42, 0.3, 1.8, 3.2);
      line(0.16, 0.4, 0.6, 0.4, 1.8, 3.2);
      line(0.16, 0.5, 0.5, 0.5, 1.8, 3.2);
      line(0.16, 0.6, 0.68, 0.6, 1.8, 3.2);
      break;
    case 'phone':
      box(0.3, 0.08, 0.4, 0.84);
      line(0.44, 0.16, 0.56, 0.16, 2);
      line(0.38, 0.28, 0.62, 0.28, 1.6, 3.2);
      line(0.38, 0.4, 0.62, 0.4, 1.6, 3.2);
      line(0.38, 0.52, 0.56, 0.52, 1.6, 3.2);
      circle(0.5, 0.78, 0.06);
      break;
    case 'trophy':
      line(0.34, 0.16, 0.66, 0.16, 2.8);
      line(0.34, 0.16, 0.38, 0.48, 2.6);
      line(0.66, 0.16, 0.62, 0.48, 2.6);
      line(0.38, 0.48, 0.62, 0.48, 2.6);
      line(0.5, 0.48, 0.5, 0.7, 2.4);
      line(0.3, 0.78, 0.7, 0.78, 2.8);
      line(0.26, 0.88, 0.74, 0.88, 3);
      line(0.34, 0.2, 0.2, 0.28, 2.2);
      line(0.2, 0.28, 0.28, 0.44, 2.2);
      line(0.66, 0.2, 0.8, 0.28, 2.2);
      line(0.8, 0.28, 0.72, 0.44, 2.2);
      break;
    case 'star': {
      ctx.save();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.6 * strokeScale;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let i = 0; i <= 10; i += 1) {
        const radius = i % 2 === 0 ? 0.42 : 0.18;
        const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
        const sx = px(0.5 + Math.cos(angle) * radius);
        const sy = py(0.5 + Math.sin(angle) * radius);
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
      hatch(ctx, px(0.32), py(0.34), size * 0.36, size * 0.32, 5 * strokeScale, random, 0.2);
      break;
    }
    case 'medal':
      circle(0.5, 0.6, 0.28);
      line(0.32, 0.36, 0.2, 0.08, 2.6);
      line(0.68, 0.36, 0.8, 0.08, 2.6);
      line(0.2, 0.08, 0.34, 0.2, 2.4);
      line(0.8, 0.08, 0.66, 0.2, 2.4);
      line(0.4, 0.6, 0.46, 0.72, 2.4);
      line(0.46, 0.72, 0.6, 0.5, 2.4);
      break;
    case 'certificate':
      box(0.08, 0.1, 0.84, 0.72);
      line(0.2, 0.28, 0.66, 0.28, 1.8, 3.2);
      line(0.2, 0.4, 0.72, 0.4, 1.8, 3.2);
      line(0.2, 0.52, 0.54, 0.52, 1.8, 3.2);
      circle(0.7, 0.66, 0.12);
      line(0.64, 0.76, 0.6, 0.94, 2.2);
      line(0.76, 0.76, 0.8, 0.94, 2.2);
      break;
    case 'plane':
      line(0.1, 0.6, 0.92, 0.18, 2.8);
      line(0.92, 0.18, 0.44, 0.82, 2.6);
      line(0.44, 0.82, 0.4, 0.56, 2.4);
      line(0.4, 0.56, 0.1, 0.6, 2.4);
      line(0.5, 0.42, 0.86, 0.28, 1.6, 3.4);
      break;
    case 'cat':
      circle(0.5, 0.5, 0.26);
      line(0.3, 0.32, 0.26, 0.12, 2.6);
      line(0.26, 0.12, 0.42, 0.26, 2.6);
      line(0.7, 0.32, 0.74, 0.12, 2.6);
      line(0.74, 0.12, 0.58, 0.26, 2.6);
      circle(0.41, 0.46, 0.05);
      circle(0.59, 0.46, 0.05);
      line(0.44, 0.64, 0.56, 0.64, 1.8, 3.2);
      line(0.24, 0.54, 0.02, 0.5, 1.4, 3.4);
      line(0.24, 0.6, 0.02, 0.62, 1.4, 3.4);
      line(0.76, 0.54, 0.98, 0.5, 1.4, 3.4);
      line(0.76, 0.6, 0.98, 0.62, 1.4, 3.4);
      break;
    case 'arrow':
      line(0.1, 0.5, 0.8, 0.5, 2.8);
      line(0.8, 0.5, 0.6, 0.32, 2.6);
      line(0.8, 0.5, 0.6, 0.7, 2.6);
      break;
    case 'plant':
      line(0.28, 0.62, 0.72, 0.62, 2.6);
      line(0.28, 0.62, 0.34, 0.9, 2.6);
      line(0.72, 0.62, 0.66, 0.9, 2.6);
      line(0.34, 0.9, 0.66, 0.9, 2.6);
      line(0.5, 0.6, 0.5, 0.2, 2.4);
      line(0.5, 0.4, 0.3, 0.26, 2.2);
      line(0.5, 0.5, 0.72, 0.34, 2.2);
      circle(0.3, 0.24, 0.1);
      circle(0.72, 0.32, 0.1);
      circle(0.5, 0.16, 0.11);
      break;
    // KRAFT_ICON_CASES
    default:
      break;
  }
}

/** Standalone transparent icon texture, ready for a plane mesh. */
export function iconTexture(kind: IconKind): THREE.CanvasTexture {
  return memo(`icon-${kind}`, () => {
    const s = surface(256, 256);
    drawIcon(s.ctx, kind, 18, 18, 220, kind.length * 101, 1);
    return toTexture(s);
  });
}

/**
 * The same doodle as a PNG data URL, so the DOM layer (award cards, SVG buttons)
 * can reuse the canvas sketch library instead of duplicating shapes.
 */
export function iconDataUrl(kind: IconKind): string {
  const key = `icon-url-${kind}`;
  const cached = dataUrlCache.get(key);
  if (cached) return cached;
  const texture = iconTexture(kind);
  const url = (texture.image as HTMLCanvasElement).toDataURL('image/png');
  dataUrlCache.set(key, url);
  return url;
}

/** Hanging studio sign with the alias, used at the entrance. */
export function signTexture(label: string, subtitle: string): THREE.CanvasTexture {
  return memo('sign', () => {
    const width = 512;
    const height = 256;
    const s = surface(width, height, '#fffefb');
    const { ctx } = s;
    const random = createRandom(6060);
    sprinklePaper(ctx, width, height, 88);
    pencilRect(ctx, 14, 14, width - 28, height - 28, random, { roughness: 4, passes: 2, lineWidth: 3 });

    ctx.save();
    ctx.fillStyle = INK;
    ctx.textAlign = 'center';
    ctx.font = `700 96px ${HAND_FONT}`;
    ctx.fillText(label, width / 2, height / 2 + 6);
    ctx.font = `400 32px ${DOODLE_FONT}`;
    ctx.globalAlpha = 0.7;
    ctx.fillText(subtitle, width / 2, height - 50);
    ctx.restore();
    pencilStroke(ctx, width / 2 - 120, height / 2 + 26, width / 2 + 120, height / 2 + 22, random, {
      width: 2.6,
      roughness: 3,
      segments: 7,
      alpha: 0.6,
      passes: 2,
    });
    return toTexture(s);
  });
}

/**
 * The sketched avatar. Six hand-drawn frames act as a flip-book so the
 * character in the corridor waves without any skeletal animation.
 */
export function avatarTexture(pose: number): THREE.CanvasTexture {
  const index = ((pose % 6) + 6) % 6;
  return memo(`avatar-${index}`, () => {
    const width = 256;
    const height = 512;
    const s = surface(width, height);
    const { ctx } = s;
    const random = createRandom(3131 + index);
    const wave = Math.sin((index / 6) * Math.PI * 2);
    const bob = Math.cos((index / 6) * Math.PI * 2) * 4;

    // Head outline.
    ctx.save();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i <= 28; i += 1) {
      const angle = (i / 28) * Math.PI * 2;
      const radius = 46 + (random() - 0.5) * 2.4;
      const x = 128 + Math.cos(angle) * radius;
      const y = 96 + bob + Math.sin(angle) * radius * 1.06;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    // Hair scribble.
    for (let i = 0; i < 16; i += 1) {
      pencilStroke(ctx, 96 + i * 4, 62 + bob, 92 + i * 5, 30 + bob + (i % 3) * 6, random, {
        width: 2.2,
        roughness: 3.4,
        segments: 3,
        alpha: 0.85,
      });
    }

    // Face.
    pencilStroke(ctx, 110, 92 + bob, 110, 100 + bob, random, { width: 3, roughness: 1.6, segments: 3 });
    pencilStroke(ctx, 146, 92 + bob, 146, 100 + bob, random, { width: 3, roughness: 1.6, segments: 3 });
    pencilStroke(ctx, 116, 100 + bob, 126, 96 + bob, random, { width: 2, roughness: 1.6, segments: 3, alpha: 0.7 });
    pencilStroke(ctx, 132, 96 + bob, 140, 100 + bob, random, { width: 2, roughness: 1.6, segments: 3, alpha: 0.7 });
    pencilStroke(ctx, 112, 116 + bob, 122, 126 + bob, random, { width: 2.4, roughness: 2, segments: 3 });
    pencilStroke(ctx, 122, 126 + bob, 134, 126 + bob, random, { width: 2.4, roughness: 2, segments: 3 });
    pencilStroke(ctx, 134, 126 + bob, 146, 116 + bob, random, { width: 2.4, roughness: 2, segments: 3 });
    pencilStroke(ctx, 100, 108 + bob, 108, 110 + bob, random, { width: 1.8, roughness: 2, segments: 3, alpha: 0.6 });

    // Neck + torso (a drawn shirt with hatching).
    pencilStroke(ctx, 118, 148 + bob, 118, 168 + bob, random, { width: 3, roughness: 2, segments: 3 });
    pencilStroke(ctx, 140, 148 + bob, 140, 168 + bob, random, { width: 3, roughness: 2, segments: 3 });
    pencilStroke(ctx, 88, 300, 92, 190 + bob, random, { width: 3, roughness: 3, segments: 6 });
    pencilStroke(ctx, 170, 300, 166, 190 + bob, random, { width: 3, roughness: 3, segments: 6 });
    pencilStroke(ctx, 92, 190 + bob, 120, 176 + bob, random, { width: 3, roughness: 2.4, segments: 4 });
    pencilStroke(ctx, 166, 190 + bob, 138, 176 + bob, random, { width: 3, roughness: 2.4, segments: 4 });
    pencilStroke(ctx, 92, 190 + bob, 166, 190 + bob, random, { width: 2.4, roughness: 2.4, segments: 5, alpha: 0.6 });
    pencilStroke(ctx, 128, 196 + bob, 128, 300, random, { width: 2, roughness: 2.6, segments: 6, alpha: 0.45 });
    for (let i = 0; i < 4; i += 1) {
      pencilStroke(ctx, 104, 244 + i * 14, 152, 244 + i * 14, random, {
        width: 1.6,
        roughness: 2.6,
        segments: 4,
        alpha: 0.45,
      });
    }

    // Arms: the last frames lift the left arm into a wave.
    const armLift = -40 - wave * 34;
    pencilStroke(ctx, 170, 196 + bob, 196, 236 + bob, random, { width: 3, roughness: 2.6, segments: 4 });
    pencilStroke(ctx, 196, 236 + bob, 208, 268 + bob, random, { width: 3, roughness: 2.6, segments: 4 });
    pencilStroke(ctx, 88, 196 + bob, 66, 232 + bob, random, { width: 3, roughness: 2.6, segments: 4 });
    pencilStroke(ctx, 66, 232 + bob, 78, 258 + bob + armLift * 0.6, random, { width: 3, roughness: 2.6, segments: 4 });
    pencilStroke(ctx, 78, 258 + bob + armLift * 0.6, 62 + wave * 8, 220 + bob + armLift, random, {
      width: 3,
      roughness: 2.8,
      segments: 4,
    });
    pencilStroke(ctx, 62 + wave * 8 - 7, 220 + bob + armLift - 9, 62 + wave * 8 + 9, 220 + bob + armLift + 6, random, {
      width: 2.4,
      roughness: 2.4,
      segments: 3,
    });

    // Legs + shoes.
    pencilStroke(ctx, 108, 300, 104, 400, random, { width: 3.2, roughness: 2.6, segments: 5 });
    pencilStroke(ctx, 150, 300, 152, 400, random, { width: 3.2, roughness: 2.6, segments: 5 });
    pencilStroke(ctx, 104, 400, 96, 436, random, { width: 3.2, roughness: 2.4, segments: 4 });
    pencilStroke(ctx, 152, 400, 160, 436, random, { width: 3.2, roughness: 2.4, segments: 4 });
    pencilStroke(ctx, 96, 436, 74, 444, random, { width: 3.4, roughness: 2.4, segments: 4 });
    pencilStroke(ctx, 160, 436, 184, 444, random, { width: 3.4, roughness: 2.4, segments: 4 });

    // Pencil tucked behind the ear.
    pencilStroke(ctx, 158, 74 + bob, 182, 58 + bob, random, { width: 3.4, roughness: 2, segments: 3 });
    pencilStroke(ctx, 156, 74 + bob, 152, 60 + bob, random, { width: 1.6, roughness: 2, segments: 3, alpha: 0.7 });

    return toTexture(s);
  });
}

/** Drop every cached texture (used by hot reload / quality switches). */
export function clearTextureCache(): void {
  cache.forEach((texture) => texture.dispose());
  cache.clear();
}
