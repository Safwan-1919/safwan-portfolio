/**
 * Torn-paper achievement toast, queued by the store. Includes the inline sound
 * switch, which doubles as the audio opt-in for the whole experience.
 */

import { type ReactNode } from 'react';
import { useExperience } from '../../lib/store';
import { SketchCheck } from './Sketch';

export function AchievementPopup(): ReactNode {
  const { popup, dismissPopup, muted, muteSound, unmuteSound } = useExperience();

  if (!popup) return null;

  return (
    <div className="achievement-popup is-visible" role="status" aria-live="polite">
      <span className="achievement-popup__check">
        <SketchCheck checked size={26} />
      </span>

      <div className="achievement-popup__text">
        <span className="achievement-popup__title">{popup.title}</span>
        <span className="achievement-popup__description">
          {popup.description}
          {popup.inlineControl === 'sound' ? (
            <button
              type="button"
              className={`achievement-popup__inline-toggle${muted ? ' is-off' : ''}`}
              onClick={() => {
                if (muted) {
                  unmuteSound();
                } else {
                  muteSound();
                }
              }}
            >
              {muted ? 'turn room tone on' : 'turn room tone off'}
            </button>
          ) : null}
        </span>
      </div>

      <button
        type="button"
        className="achievement-popup__close"
        onClick={dismissPopup}
        aria-label="Dismiss achievement"
      >
        ×
      </button>
    </div>
  );
}