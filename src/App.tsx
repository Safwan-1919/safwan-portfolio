/**
 * KRAFT - Premium 3D Hand-Drawn Portfolio Theme
 *
 * App shell: preloader, WebGL corridor, hand-drawn overlay, room sheets,
 * achievement toasts and the corridor controls (wheel, keys, touch).
 */

import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { content } from './content/portfolio';
import { ExperienceProvider, useExperience } from './lib/store';
import { pointer } from './lib/rig';
import { useIsCompact, useIsLowPower, useKeySequence, useReducedMotion } from './hooks';
import { Experience } from './components/three/Experience';
import { AchievementPopup } from './components/ui/AchievementPopup';
import { CursorLayer } from './components/ui/CursorLayer';
import { HeroOverlay, Hud, Longform, TornBar } from './components/ui/Hud';
import { Nav } from './components/ui/Nav';
import { Preloader } from './components/ui/Preloader';
import { RoomSheet } from './components/ui/RoomSheet';
import { SketchDefs } from './components/ui/Sketch';

/* ------------------------------------------------------------------ helpers */

function detectWebGL(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

/** Wheel / keyboard / touch navigation through the corridor. */
function useTravelControls(enabled: boolean): void {
  const { travel, stationIndex } = useExperience();
  const indexRef = useRef(stationIndex);
  indexRef.current = stationIndex;
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!enabled) return;
    const last = content.stations.length - 1;
    const clamp = (index: number) => Math.max(0, Math.min(last, index));
    let accum = 0;
    let lockedUntil = 0;

    const onWheel = (event: WheelEvent) => {
      const now = performance.now();
      if (now < lockedUntil) return;
      accum += event.deltaY;
      if (Math.abs(accum) < 55) return;
      const direction = accum > 0 ? 1 : -1;
      accum = 0;
      lockedUntil = now + 820;
      travel(clamp(indexRef.current + direction));
    };

    let touchY = 0;
    let touchStart = 0;
    const onTouchStart = (event: TouchEvent) => {
      touchY = event.touches[0]?.clientY ?? 0;
      touchStart = performance.now();
    };
    const onTouchEnd = (event: TouchEvent) => {
      const endY = event.changedTouches[0]?.clientY ?? touchY;
      const delta = touchY - endY;
      if (Math.abs(delta) < 55 || performance.now() - touchStart > 900) return;
      travel(clamp(indexRef.current + (delta > 0 ? 1 : -1)));
    };

    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      switch (event.key) {
        case 'ArrowDown':
        case 'PageDown':
          event.preventDefault();
          travel(clamp(indexRef.current + 1));
          break;
        case 'ArrowUp':
        case 'PageUp':
          event.preventDefault();
          travel(clamp(indexRef.current - 1));
          break;
        case 'Home':
          travel(0);
          break;
        case 'End':
          travel(last);
          break;
        default:
          if (/^[1-9]$/.test(event.key)) {
            const index = Number(event.key) - 1;
            if (index <= last) travel(index);
          }
      }
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKey);
    };
  }, [enabled, travel, reducedMotion]);
}

/* --------------------------------------------------------------------- shell */

function Shell({ started, onLoaded, webgl }: { started: boolean; onLoaded: () => void; webgl: boolean }): ReactNode {
  const { activeRoom, started: ready, unlock, markStarted } = useExperience();
  const reducedMotion = useReducedMotion();

  // Hand control to the corridor once the preloader finishes.
  useEffect(() => {
    if (started && !ready) markStarted();
  }, [started, ready, markStarted]);

  useTravelControls(ready && !activeRoom);
  usePointerParallax();

  // The hidden cheat code is the alias in lowercase, so it always matches the brand.
  useKeySequence(content.identity.alias.toLowerCase(), () => unlock('kraft-code'));

  return (
    <>
      <SketchDefs />
      <a className="sr-focusable" href="#kraft-content">
        Skip to the portfolio content
      </a>

      <div className="canvas-wrapper" aria-hidden="true">
        {webgl ? (
          <Suspense fallback={null}>
            <Experience />
          </Suspense>
        ) : (
          <CanvasFallback />
        )}
      </div>

      <div className="grain" aria-hidden="true" />

      <div className="ui-overlay">
        <Nav />
        <HeroOverlay />
        <TornBar />
        <Hud />
        <div id="kraft-content">
          <h2 className="sr-only">
            {content.identity.name} — {content.identity.title}
          </h2>
          <Longform />
        </div>
      </div>

      <div className="sheet-layer">
        <RoomSheet />
      </div>

      <AchievementPopup />
      {reducedMotion ? null : <CursorLayer />}

      {!started ? <Preloader onComplete={onLoaded} /> : null}
    </>
  );
}

export default function App(): ReactNode {
  const [started, setStarted] = useState(false);
  const webgl = useMemo(detectWebGL, []);
  const lowPower = useIsLowPower();
  const compact = useIsCompact();
  const [quality, setQuality] = useState<'high' | 'low'>(lowPower ? 'low' : 'high');

  // Frame-rate probe: drop quality once if the corridor cannot keep up.
  useEffect(() => {
    if (!webgl || quality === 'low') return;
    let frames = 0;
    let frame = 0;
    let start = 0;

    const loop = () => {
      frames += 1;
      const elapsed = performance.now() - start;
      if (elapsed > 2200) {
        const fps = (frames / elapsed) * 1000;
        if (fps < 42) setQuality('low');
        return;
      }
      frame = window.requestAnimationFrame(loop);
    };

    const timer = window.setTimeout(() => {
      start = performance.now();
      frames = 0;
      frame = window.requestAnimationFrame(loop);
    }, 1400);

    return () => {
      window.clearTimeout(timer);
      window.cancelAnimationFrame(frame);
    };
  }, [webgl, quality]);

  // Compact devices start at low quality so the first frame is always smooth.
  useEffect(() => {
    if (compact) setQuality('low');
  }, [compact]);

  const handleLoaded = useCallback(() => setStarted(true), []);

  return (
    <ExperienceProvider quality={quality}>
      <Shell started={started} onLoaded={handleLoaded} webgl={webgl} />
    </ExperienceProvider>
  );
}
function usePointerParallax(): void {
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      pointer.targetX = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.targetY = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);
}

/** Non-WebGL visitors still get the whole portfolio, just without the corridor. */
function CanvasFallback(): ReactNode {
  return (
    <div className="canvas-fallback">
      <p className="sheet__prose">
        This device cannot draw the 3D corridor, so here is the paper version. Nothing is lost: the gallery, the
        studio, the author and the post room are all one click away in the navigation above.
      </p>
    </div>
  );
}