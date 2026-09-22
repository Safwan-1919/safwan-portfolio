/**
 * Render-level test entry: the whole DOM/UI layer rendered with
 * react-dom/server, so every component's render path is executed in Node.
 *
 * Bundled by scripts/run-ssr.mjs and driven from scripts/ssr-render.mjs? No:
 * the runner imports this module and calls `renderAll()`.
 */

import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { content } from '../src/content/portfolio';
import { ExperienceProvider } from '../src/lib/store';
import { AchievementPopup } from '../src/components/ui/AchievementPopup';
import { AchievementsPanel } from '../src/components/ui/AchievementsPanel';
import { CursorLayer } from '../src/components/ui/CursorLayer';
import { HeroOverlay, Hud, Longform, TornBar } from '../src/components/ui/Hud';
import { Nav } from '../src/components/ui/Nav';
import { Preloader } from '../src/components/ui/Preloader';
import { RoomSheet } from '../src/components/ui/RoomSheet';
import { SketchDefs, SketchThumb, SketchMeter, SketchCheck, Squiggle, DoodleIcon } from '../src/components/ui/Sketch';
import { GallerySection } from '../src/components/ui/sections/GallerySection';
import { StudioSection } from '../src/components/ui/sections/StudioSection';
import { AboutSection } from '../src/components/ui/sections/AboutSection';
import { ContactSection } from '../src/components/ui/sections/ContactSection';

function Overlay(): unknown {
  return createElement(
    'div',
    null,
    createElement(SketchDefs),
    createElement(Nav),
    createElement(HeroOverlay),
    createElement(TornBar),
    createElement(Hud),
    createElement(Longform),
    createElement(Longform, { visible: true }),
    createElement(AchievementsPanel, { open: true, onClose: () => undefined }),
    createElement(AchievementsPanel, { open: false, onClose: () => undefined }),
    createElement(AchievementPopup),
    createElement(CursorLayer),
    createElement(RoomSheet),
    createElement(Preloader, { onComplete: () => undefined }),
    createElement(
      'div',
      null,
      createElement(Squiggle, { width: 100, seed: 2 }),
      createElement(SketchCheck, { checked: true, size: 20 }),
      createElement(SketchMeter, { value: 72, seed: 9 }),
      createElement(SketchThumb, { seed: 1207, title: 'Aether', meta: '2025 · Lead' }),
      createElement(DoodleIcon, { kind: 'trophy', alt: 'trophy' }),
    ),
  );
}

/** Renders the overlay for every station state and every open room. */
export function renderAll(): Array<{ name: string; html: string }> {
  const results = [];

  const push = (name, element) => {
    try {
      results.push({ name, html: renderToString(element), ok: true, error: '' });
    } catch (error) {
      results.push({ name, html: '', ok: false, error: error instanceof Error ? error.message : String(error) });
    }
  };

  push('overlay (closed rooms)', createElement(ExperienceProvider, null, createElement(Overlay as never)));
  push(
    'overlay (low quality)',
    createElement(ExperienceProvider, { quality: 'low' }, createElement(Overlay as never)),
  );

  content.stations
    .filter((station) => station.kind === 'room')
    .forEach((station) => {
      push(
        `room sheet: ${station.id}`,
        createElement(
          ExperienceProvider,
          { initialRoom: station.id, initialProject: content.projects[1]?.id ?? null },
          createElement(RoomSheet),
        ),
      );
    });

  push(
    'gallery section (focused project)',
    createElement(
      ExperienceProvider,
      { initialRoom: 'gallery', initialProject: content.projects[0]?.id ?? null },
      createElement(GallerySection, {
        focusedProject: content.projects[0]?.id ?? null,
        onFocusProject: () => undefined,
      }),
    ),
  );
  push('studio section', createElement(ExperienceProvider, null, createElement(StudioSection)));
  push('about section', createElement(ExperienceProvider, null, createElement(AboutSection)));
  push('contact section', createElement(ExperienceProvider, null, createElement(ContactSection)));

  return results;
}

export { content };