import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/** Reactive media query. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  );

  useEffect(() => {
    const list = window.matchMedia(query);
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);
    setMatches(list.matches);
    list.addEventListener('change', handler);
    return () => list.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

/** True when the visitor asked for reduced motion. */
export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/** True on phones / small tablets where the 3D scene is simplified. */
export function useIsCompact(): boolean {
  const narrow = useMediaQuery('(max-width: 900px)');
  const touch = useMediaQuery('(hover: none)');
  return narrow || touch;
}

/** True when the visitor is on a low-core device (quality downshift). */
export function useIsLowPower(): boolean {
  return useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    const cores = navigator.hardwareConcurrency ?? 4;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
    return cores <= 4 || memory <= 4;
  }, []);
}

/**
 * Fire-and-forget scroll-reveal: adds `is-visible` to every element with the
 * `data-reveal` attribute once it enters the viewport.
 */
export function useRevealObserver(dependency?: unknown): void {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (!nodes.length) return;

    if (!('IntersectionObserver' in window)) {
      nodes.forEach((node) => node.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
    );

    nodes.forEach((node) => {
      if (!node.classList.contains('is-visible')) observer.observe(node);
    });
    return () => observer.disconnect();
  }, [dependency]);
}

/** Interval helper that pauses automatically. */
export function useInterval(callback: () => void, delay: number | null): void {
  const saved = useRef(callback);
  useEffect(() => {
    saved.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;
    const id = window.setInterval(() => saved.current(), delay);
    return () => window.clearInterval(id);
  }, [delay]);
}

/** Keyboard sequence detector, used for the KRAFT cheat code. */
export function useKeySequence(sequence: string, onMatch: () => void): void {
  const buffer = useRef('');
  const handler = useCallback(
    (event: KeyboardEvent) => {
      if (event.key.length !== 1) return;
      const target = event.target as HTMLElement | null;
      // Ignore typing inside form fields.
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      buffer.current = (buffer.current + event.key.toLowerCase()).slice(-sequence.length);
      if (buffer.current === sequence) {
        onMatch();
        buffer.current = '';
      }
    },
    [sequence, onMatch],
  );

  useEffect(() => {
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handler]);
}