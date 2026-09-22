/**
 * Top navigation: the station index, the sound switch and the achievement
 * drawer. Travel is instant from here - the camera rig does the walking.
 */

import { useState, type ReactNode } from 'react';
import { content } from '../../content/portfolio';
import { useExperience } from '../../lib/store';
import { Squiggle } from './Sketch';
import { AchievementsPanel } from './AchievementsPanel';

export function Nav(): ReactNode {
  const { stationId, travel, muted, muteSound, unmuteSound, unlocked } = useExperience();
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <>
      <nav className="nav" aria-label="Corridor chapters">
        <div className="nav__brand">
          <span className="nav__monogram hand">{content.identity.alias}</span>
          <span className="nav__alias">{content.identity.name}</span>
        </div>

        <div className="nav__links">
          {content.stations.map((station, index) => (
            <button
              key={station.id}
              type="button"
              className={`nav__link${stationId === station.id ? ' is-active' : ''}`}
              aria-current={stationId === station.id ? 'true' : undefined}
              onClick={() => travel(index)}
            >
              <span className="nav__link-index">{station.chapter}</span>
              {station.label}
              <Squiggle className="nav__link-mark" width={110} seed={index + 2} />
            </button>
          ))}
        </div>

        <div className="nav__tools">
          <button
            type="button"
            className={`nav__tool${muted ? '' : ' is-on'}`}
            aria-pressed={!muted}
            onClick={() => {
              if (muted) {
                unmuteSound();
              } else {
                muteSound();
              }
            }}
          >
            {muted ? '♪ sound on' : '♪ sound off'}
          </button>

          <button
            type="button"
            className={`nav__tool${panelOpen ? ' is-on' : ''}`}
            aria-expanded={panelOpen}
            aria-controls="achievements-panel"
            onClick={() => setPanelOpen((open) => !open)}
          >
            stamps
            <span className="nav__tool-badge">{unlocked.length}</span>
          </button>
        </div>
      </nav>

      <AchievementsPanel open={panelOpen} onClose={() => setPanelOpen(false)} />
    </>
  );
}