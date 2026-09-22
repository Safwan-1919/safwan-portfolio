/**
 * Preloader: two torn paper halves that slide apart while the first frame is
 * baked. It waits for the handwriting webfonts, because the door plaques and
 * the corridor signage are drawn into canvas textures using those fonts.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { content } from '../../content/portfolio';
import { audio, armAudioUnlock } from '../../lib/audio';
import { useExperience } from '../../lib/store';

const STEPS = [
  'sharpening the pencil…',
  'unrolling the paper…',
  'drawing the corridor walls…',
  'hanging the lamps…',
  'framing the case studies…',
  'ready.',
];

export interface PreloaderProps {
  onComplete: () => void;
}

export function Preloader({ onComplete }: PreloaderProps): ReactNode {
  const { unlock } = useExperience();
  const [progress, setProgress] = useState(0);
  const [hiding, setHiding] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const left = useRef<HTMLDivElement>(null);
  const right = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const fontsReady = useRef(false);

  // Wait for the handwriting fonts (+ a minimum dwell time) before revealing.
  useEffect(() => {
    const started = performance.now();
    const minimum = 1500;
    const timer = window.setInterval(() => {
      setProgress((current) => {
        const elapsed = performance.now() - started;
        const ceiling = fontsReady.current ? 100 : 92;
        const target = Math.min(ceiling, (elapsed / minimum) * 100);
        const next = current + (target - current) * 0.18 + 0.35;
        if (next >= 100) {
          window.clearInterval(timer);
          setHiding(true);
          return 100;
        }
        return next;
      });
    }, 60);

    const fonts = document.fonts?.ready ?? Promise.resolve();
    fonts.then(() => {
      fontsReady.current = true;
    });

    return () => window.clearInterval(timer);
  }, []);

  // Split the paper and hand control to the corridor.
  useEffect(() => {
    if (!hiding) return;
    const timeline = gsap.timeline({
      onComplete: () => {
        onComplete();
      },
    });
    timeline
      .to(inner.current, { opacity: 0, duration: 0.35, ease: 'power1.out' })
      .to(
        left.current,
        { xPercent: -102, rotate: -2.5, duration: 1.15, ease: 'power3.inOut' },
        0.25,
      )
      .to(
        right.current,
        { xPercent: 102, rotate: 2.5, duration: 1.15, ease: 'power3.inOut' },
        0.25,
      )
      .to(root.current, { autoAlpha: 0, duration: 0.4 }, 1.05);

    return () => {
      timeline.kill();
    };
  }, [hiding, onComplete]);

  // Arm the audio unlocker on the first gesture of the session.
  useEffect(() => {
    void audio.playTrack('/audio/song.mp3');
    armAudioUnlock();
  }, []);

  const step = STEPS[Math.min(STEPS.length - 1, Math.floor((progress / 100) * STEPS.length))];

  return (
    <div className={`preloader${hiding ? ' is-hiding' : ''}`} ref={root} role="status" aria-live="polite">
      <div className="preloader__half preloader__half--left" ref={left} aria-hidden="true" />
      <div className="preloader__half preloader__half--right" ref={right} aria-hidden="true" />

      <div className="preloader__inner" ref={inner}>
        <span className="preloader__monogram hand">{content.identity.alias}</span>
        <span className="preloader__title">{content.identity.name}</span>
        <span className="preloader__percentage hand">{Math.round(progress)}%</span>
        <div className="preloader__bar" aria-hidden="true">
          <div className="preloader__bar-fill" style={{ width: `${progress}%` }} />
        </div>
        <p className="preloader__note">{step}</p>
        <button
          type="button"
          className="sketch-btn sketch-btn--ghost sketch-btn--small"
          onClick={() => {
            void audio.startAmbient();
            void audio.setMuted(false);
            unlock('sound-on');
          }}
        >
          ♪ turn on room tone
        </button>
      </div>
    </div>
  );
}