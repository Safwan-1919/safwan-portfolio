/**
 * The corridor HUD: hero copy for the entrance station, long-form copy for
 * crawlers, the torn scroll bar and the control legend.
 */

import { useMemo, type ReactNode } from 'react';
import { content } from '../../content/portfolio';
import { useExperience } from '../../lib/store';
import { Squiggle } from './Sketch';

/* --------------------------------------------------------------------- hero */

export function HeroOverlay(): ReactNode {
  const { stationId, activeRoom, started, openRoom } = useExperience();
  const visible = started && stationId === 'corridor' && !activeRoom;
  const identity = content.identity;

  return (
    <section
      className="hero"
      aria-hidden={!visible}
      style={{
        opacity: visible ? 1 : 0,
        visibility: visible ? 'visible' : 'hidden',
        transform: visible ? 'none' : 'translateY(18px)',
        transition: 'opacity 0.6s var(--ease-paper), transform 0.6s var(--ease-paper)',
      }}
    >
      <p className="hero__chapter">chapter 01 — the corridor</p>
      <h1 className="hero__title">
        <span aria-hidden="true">{identity.alias}</span>
        <span className="sr-only">
          {identity.name} — {identity.title}
        </span>
      </h1>
      <Squiggle className="ink-underline" width={320} seed={3} />
      <p className="hero__tagline">
        {identity.title} · {identity.location}
      </p>
      <p className="hero__intro">{identity.intro}</p>

      <div className="hero__actions">
        <button type="button" className="sketch-btn" onClick={() => openRoom('gallery')}>
          Walk the projects <span className="sketch-btn__arrow">→</span>
        </button>
        <button type="button" className="sketch-btn sketch-btn--ghost" onClick={() => openRoom('contact')}>
          Start a project
        </button>
        <a className="sketch-btn sketch-btn--ghost sketch-btn--small" href={`mailto:${identity.email}`}>
          {identity.email}
        </a>
      </div>

      <dl className="hero__stats">
        {identity.stats.map((stat) => (
          <div key={stat.label}>
            <dt className="hero__stat-label">{stat.label}</dt>
            <dd className="hero__stat-value">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* ------------------------------------------------------------------ longform */

/** Long-form copy: crawlable in the DOM, readable inside the About sheet. */
export function Longform({ visible = false }: { visible?: boolean }): ReactNode {
  return (
    <div className={visible ? 'longform' : 'sr-only'}>
      {content.seo.map((block) => (
        <article key={block.heading}>
          <h3 className="longform__heading">{block.heading}</h3>
          {block.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 32)} className="longform__text">
              {paragraph}
            </p>
          ))}
          {block.bullets ? (
            <ul className="longform__bullets">
              {block.bullets.map((bullet) => (
                <li key={bullet.strong}>
                  <strong>{bullet.strong}</strong> {bullet.text}
                </li>
              ))}
            </ul>
          ) : null}
        </article>
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------- torn bar */

export function TornBar(): ReactNode {
  const { stationIndex, activeRoom, travel, started } = useExperience();
  const stations = content.stations;
  const progress = stations.length > 1 ? stationIndex / (stations.length - 1) : 0;
  const interactive = started && !activeRoom;
  const position = 8 + progress * 92;
  const current = stations[stationIndex] ?? stations[0];
  const route = useMemo(() => progress, [progress]);

  return (
    <div
      className="tornbar"
      aria-hidden={!interactive}
      style={{
        opacity: started ? (activeRoom ? 0.25 : 1) : 0,
        visibility: interactive ? 'visible' : 'hidden',
        transition: 'opacity 0.5s var(--ease-paper)',
      }}
    >
      <div className="tornbar__track">
        <div className="tornbar__fill" style={{ width: `${position}%` }} />
        <div className="tornbar__ticks">
          {stations.map((station, index) => (
            <button
              key={station.id}
              type="button"
              className={`tornbar__tick${index === stationIndex ? ' is-active' : ''}`}
              onClick={() => travel(index)}
              aria-label={`Travel to ${station.title}`}
            >
              {station.chapter}
            </button>
          ))}
        </div>
        <span className="tornbar__thumb" style={{ left: `${position}%` }}>
          <svg viewBox="0 0 26 38" aria-hidden="true" focusable="false">
            <path
              d="M13 1 L25 19 L13 37 L1 19 Z"
              fill="#fffefb"
              stroke="#1a1a1a"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path
              d="M9 14 L17 14 M9 19 L17 19 M9 24 L17 24"
              stroke="#1a1a1a"
              strokeWidth="1.4"
              strokeDasharray="2 2"
            />
          </svg>
        </span>
      </div>
      <p className="tornbar__caption">
        {current.chapter} — {current.title}. {current.tagline}
      </p>
      <span className="sr-only">corridor progress {Math.round(route * 100)} percent</span>
    </div>
  );
}

/* ---------------------------------------------------------------------- hud */

export function Hud(): ReactNode {
  const { stationId, activeRoom, started } = useExperience();
  const visible = started && !activeRoom;

  return (
    <div
      className="hud"
      style={{
        opacity: visible ? 1 : 0,
        visibility: visible ? 'visible' : 'hidden',
        transition: 'opacity 0.5s var(--ease-paper)',
      }}
      aria-hidden={!visible}
    >
      <p className="hud__hint">
        <span className="hud__hint-arrow" aria-hidden="true">
          ↓
        </span>
        {stationId === 'corridor'
          ? 'scroll to walk the corridor'
          : 'click a door plaque, a framed print or a balloon'}
      </p>
      <p className="hud__instructions">
        scroll to travel · <kbd>↑</kbd> <kbd>↓</kbd> step · <kbd>1</kbd>–<kbd>5</kbd> jump · <kbd>Esc</kbd> close a room
      </p>
    </div>
  );
}