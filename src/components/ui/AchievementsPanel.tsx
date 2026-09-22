/**
 * Achievement drawer: the "passport" of everything the visitor collected while
 * walking the corridor. Progress is persisted in localStorage by the store.
 */

import { useEffect, type ReactNode } from 'react';
import { content } from '../../content/portfolio';
import { useExperience } from '../../lib/store';
import { SketchCheck } from './Sketch';

export function AchievementsPanel({ open, onClose }: { open: boolean; onClose: () => void }): ReactNode {
  const { unlocked } = useExperience();
  const total = content.unlocks.length;

  // Escape closes the drawer for keyboard users.
  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <aside
      id="achievements-panel"
      className={`achievements-panel${open ? ' is-open' : ''}`}
      aria-label="Collected stamps"
      aria-hidden={!open}
    >
      <h2 className="achievements-panel__title">Stamps collected</h2>
      <p className="achievements-panel__progress">
        {unlocked.length} of {total} — {unlocked.length === total ? 'the corridor is yours.' : 'keep exploring.'}
      </p>

      <ul className="achievements-panel__list">
        {content.unlocks.map((unlock) => {
          const done = unlocked.includes(unlock.id);
          return (
            <li key={unlock.id} className={`achievements-panel__item${done ? ' is-unlocked' : ''}`}>
              <SketchCheck checked={done} size={20} />
              <div>
                <span className="achievements-panel__name">{unlock.title}</span>
                <p className="achievements-panel__hint">{done ? unlock.description : 'undiscovered…'}</p>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="achievements-panel__note">
        Tip: type <strong>{content.identity.alias}</strong> anywhere for a hidden stamp.
      </p>
    </aside>
  );
}