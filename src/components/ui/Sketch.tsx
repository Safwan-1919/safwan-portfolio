/**
 * DOM-side doodles: SVG filters, squiggle underlines, sketch thumbnails,
 * checkmarks, meters and the pencil cursor. Everything is seeded, so the wobble
 * stays stable across renders.
 */

import { useMemo, type ReactNode } from 'react';
import {
  createRandom,
  hatchLines,
  roughEllipsePath,
  roughLine,
  roughRectPath,
  scribbleUnderlinePath,
} from '../../lib/sketch';
import { iconDataUrl, type IconKind } from '../../lib/textures';

/** Global SVG filters used for the "wobbly ink" look on DOM elements. */
export function SketchDefs(): ReactNode {
  return (
    <svg className="sketch-defs" aria-hidden="true" focusable="false" width="0" height="0">
      <defs>
        <filter id="kraft-wobble" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02 0.03" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.4" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="kraft-wobble-strong" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035 0.05" numOctaves="2" seed="11" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}

/** Double-pass hand-drawn underline. */
export function Squiggle({
  width = 120,
  seed = 1,
  className,
}: {
  width?: number;
  seed?: number;
  className?: string;
}): ReactNode {
  const path = useMemo(() => scribbleUnderlinePath(width, seed), [width, seed]);
  return (
    <svg className={className} viewBox={`0 0 ${width} 12`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path d={path} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

/** Hand-drawn checkbox used by the achievement list and popups. */
export function SketchCheck({ checked, size = 22 }: { checked: boolean; size?: number }): ReactNode {
  const ticks = useMemo(() => {
    const random = createRandom(checked ? 3 : 9);
    return `${roughLine(size * 0.22, size * 0.54, size * 0.44, size * 0.76, random, 1.4, 3)} ${roughLine(
      size * 0.44,
      size * 0.76,
      size * 0.8,
      size * 0.24,
      random,
      1.6,
      3,
    )}`;
  }, [checked, size]);
  const box = useMemo(() => roughRectPath(size, size, 21, { roughness: 1.6, inset: 1, doubleStroke: true }), [size]);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" focusable="false">
      <path d={box} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      {checked ? (
        <path
          className="sketch-check__tick"
          d={ticks}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          style={{ animation: 'drawCheck 0.4s ease forwards' }}
        />
      ) : null}
    </svg>
  );
}

/** Award / skill glyph rendered from the shared canvas doodle library. */
export function DoodleIcon({ kind, size = 54, alt }: { kind: IconKind; size?: number; alt: string }): ReactNode {
  const url = useMemo(() => iconDataUrl(kind), [kind]);
  return <img className="award__icon" src={url} width={size} height={size} alt={alt} loading="lazy" />;
}

/** Hand-drawn progress meter used by the skill list. */
export function SketchMeter({ value, seed }: { value: number; seed: number }): ReactNode {
  const { track, fill, ticks } = useMemo(() => {
    const random = createRandom(seed);
    return {
      track: roughRectPath(100, 12, seed, { roughness: 1.4, inset: 1, doubleStroke: true }),
      fill: roughRectPath(Math.max(2, value), 12, seed + 1, { roughness: 1.2, inset: 1, doubleStroke: false }),
      ticks: Array.from({ length: 9 }, (_, index) =>
        roughLine((index + 1) * 10, 2, (index + 1) * 10 + (random() - 0.5) * 2, 10, random, 1, 2),
      ).join(' '),
    };
  }, [value, seed]);

  return (
    <svg viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path d={track} fill="none" stroke="#cfcbc1" strokeWidth="1.4" />
      <path d={fill} fill="rgba(26,26,26,0.62)" stroke="#1a1a1a" strokeWidth="1.2" />
      <path d={ticks} fill="none" stroke="#1a1a1a" strokeWidth="0.5" opacity="0.25" />
    </svg>
  );
}

/** The pencil cursor that follows the pointer on desktop. */
export function SketchCursor({ x, y, hovering }: { x: number; y: number; hovering: boolean }): ReactNode {
  return (
    <div
      className={`sketch-cursor${hovering ? ' is-hover' : ''}`}
      style={{ transform: `translate3d(${x}px, ${y}px, 0)` }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 34 34" width="34" height="34">
        <g fill="none" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 26 L20 8 L25 12 L11 30 Z" fill="#fffefb" />
          <path d="M20 8 L24 4 L29 8 L25 12 Z" fill="#efe6c8" />
          <path d="M11 30 L6 26 L8 32 Z" fill="#1a1a1a" />
        </g>
      </svg>
      <svg className="sketch-cursor__ring" viewBox="0 0 34 34" width="34" height="34">
        <path
          d={roughEllipsePath(17, 17, 15, 15, 5, 4)}
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="1.6"
          strokeDasharray="4 3"
        />
      </svg>
    </div>
  );
}

/** Sketchy card thumbnail for a project, seeded by the project's art seed. */
export function SketchThumb({
  seed,
  title,
  meta,
  width = 320,
  height = 190,
}: {
  seed: number;
  title: string;
  meta: string;
  width?: number;
  height?: number;
}): ReactNode {
  const { border, art, underline } = useMemo(() => {
    const random = createRandom(seed);
    const variant = seed % 5;
    let artPath = '';

    if (variant === 0) {
      for (let i = 0; i < 5; i += 1) {
        artPath += `${roughEllipsePath(width / 2, height / 2 - 14, 20 + i * 15, 16 + i * 12, seed + i, 3)} `;
      }
    } else if (variant === 1) {
      for (let i = 0; i < 5; i += 1) {
        const x = 44 + i * 22;
        artPath += `${roughLine(x, height - 58, x, height - 58 - (22 + random() * 62), random, 3, 4)} `;
      }
      artPath += `${hatchLines(38, height - 120, width - 84, 42, 7, seed + 2)} `;
    } else if (variant === 2) {
      for (let row = 0; row < 4; row += 1) {
        artPath += `${roughLine(48, 42 + row * 26, width - 48, 42 + row * 26 + (random() - 0.5) * 6, random, 3.4, 7)} `;
      }
    } else if (variant === 3) {
      for (let i = 0; i < 16; i += 1) {
        const angle = (i / 16) * Math.PI;
        artPath += `${roughLine(
          width / 2 + Math.cos(angle) * 84,
          height / 2 - 14 + Math.sin(angle) * 54,
          width / 2 + Math.cos(angle) * 26,
          height / 2 - 14 + Math.sin(angle) * 18,
          random,
          2.6,
          3,
        )} `;
      }
    } else {
      for (let i = 0; i < 20; i += 1) {
        const x = 42 + random() * (width - 84);
        const y = 36 + random() * (height - 96);
        artPath += `${roughLine(x, y, x + (random() - 0.5) * 54, y + (random() - 0.5) * 40, random, 3.6, 3)} `;
      }
    }

    return {
      border: roughRectPath(width, height, seed, { roughness: 4, inset: 6, doubleStroke: true }),
      art: artPath,
      underline: scribbleUnderlinePath(width * 0.34, seed + 5, height - 30),
    };
  }, [seed, width, height]);

  return (
    <svg
      className="card__thumb"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`${title} — ${meta}`}
      style={{ filter: 'url(#kraft-wobble)' }}
    >
      <rect width={width} height={height} fill="#fffefb" />
      <path d={art} fill="none" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
      <path d={border} fill="none" stroke="#1a1a1a" strokeWidth="2.4" strokeLinejoin="round" />
      <text x={width / 2} y={height - 12} textAnchor="middle" fill="#1a1a1a" style={{ font: '700 26px Caveat, cursive' }}>
        {title}
      </text>
      <path d={underline} fill="none" stroke="#8a8a8a" strokeWidth="1.6" strokeLinecap="round" />
      <text x={width - 14} y={24} textAnchor="end" fill="#8a8a8a" style={{ font: '400 13px "Patrick Hand", cursive' }}>
        {meta}
      </text>
    </svg>
  );
}