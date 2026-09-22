/**
 * Room sheets: the full-screen paper pages a door opens. Each station has its
 * own section composition, plus prev/next chapter travel in the footer.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { content } from '../../content/portfolio';
import { useExperience } from '../../lib/store';
import { useRevealObserver } from '../../hooks';
import { AboutSection } from './sections/AboutSection';
import { ContactSection } from './sections/ContactSection';
import { GallerySection } from './sections/GallerySection';
import { StudioSection } from './sections/StudioSection';

export function RoomSheet(): ReactNode {
  const { activeRoom, closeRoom, focusedProject, focusProject, travel, stationIndex } = useExperience();
  const paper = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);

  // Mount first, animate on the next frame, so the paper really rises in.
  useEffect(() => {
    if (!activeRoom) {
      setEntered(false);
      return;
    }
    const frame = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(frame);
  }, [activeRoom]);

  // Scroll the sheet to the top whenever a new room is opened.
  useEffect(() => {
    if (activeRoom && paper.current) {
      paper.current.scrollTop = 0;
    }
  }, [activeRoom]);

  // Lock page-level shortcuts while a sheet is open.
  useEffect(() => {
    document.body.classList.toggle('is-sheet-open', Boolean(activeRoom));
    return () => document.body.classList.remove('is-sheet-open');
  }, [activeRoom]);

  // Escape closes the room.
  useEffect(() => {
    if (!activeRoom) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRoom();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeRoom, closeRoom]);

  // Reveal animations for the sheet content.
  useRevealObserver(activeRoom);

  const station = content.stations.find((entry) => entry.id === activeRoom);
  const index = station ? content.stations.findIndex((entry) => entry.id === station.id) : -1;
  const previous = index > 0 ? content.stations[index - 1] : null;
  const next = index >= 0 && index < content.stations.length - 1 ? content.stations[index + 1] : null;

  if (!station) return null;

  return (
    <div
      className={`sheet${entered ? ' is-open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={station.title}
    >
      <div className="sheet__backdrop" onClick={closeRoom} aria-hidden="true" />

      <div className="sheet__paper" ref={paper} tabIndex={-1}>
        <div className="sheet__grip">
          <button type="button" className="sheet__close" onClick={closeRoom}>
            close <span aria-hidden="true">×</span>
          </button>
        </div>

        <header className="sheet__head">
          <p className="sheet__chapter">
            chapter {station.chapter} — {station.label}
          </p>
          <h2 className="sheet__title">{station.title}</h2>
          <p className="sheet__lede">{station.tagline}</p>
          <div className="sheet__chips">
            <span className="sheet__chip">scroll inside this page</span>
            <span className="sheet__chip">Esc closes the room</span>
            <span className="sheet__chip">{content.identity.availability}</span>
          </div>
        </header>

        {station.id === 'gallery' ? (
          <GallerySection focusedProject={focusedProject} onFocusProject={focusProject} />
        ) : null}
        {station.id === 'studio' ? <StudioSection /> : null}
        {station.id === 'about' ? <AboutSection /> : null}
        {station.id === 'contact' ? <ContactSection /> : null}

        <footer className="sheet__foot">
          <div className="card__actions">
            {previous ? (
              <button
                type="button"
                className="sketch-btn sketch-btn--ghost sketch-btn--small"
                onClick={() => travel(content.stations.findIndex((entry) => entry.id === previous.id))}
              >
                <span className="sketch-btn__arrow">←</span> {previous.title}
              </button>
            ) : null}
            {next ? (
              <button
                type="button"
                className="sketch-btn sketch-btn--small"
                onClick={() => travel(content.stations.findIndex((entry) => entry.id === next.id))}
              >
                {next.title} <span className="sketch-btn__arrow">→</span>
              </button>
            ) : null}
          </div>
          <p className="sheet__foot-note">
            you are deep inside chapter {station.chapter} of {content.stations.length} · current stop: {station.title}
            {stationIndex === index ? '' : ' (travelling)'}
          </p>
        </footer>
      </div>
    </div>
  );
}