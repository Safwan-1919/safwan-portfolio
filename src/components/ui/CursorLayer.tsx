/**
 * The pencil cursor. Rendered once and animated imperatively so pointer moves
 * never trigger React re-renders.
 */

import { useEffect, useRef, type ReactNode } from 'react';

export function CursorLayer(): ReactNode {
  const node = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    document.body.classList.add('cursor-custom');

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let x = targetX;
    let y = targetY;
    let frame = 0;

    const onMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
    };

    const loop = () => {
      x += (targetX - x) * 0.24;
      y += (targetY - y) * 0.24;
      if (node.current) {
        node.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
      frame = window.requestAnimationFrame(loop);
    };

    // Hover state mirrors the `cursor-hover` class the 3D props toggle.
    const observer = new MutationObserver(() => {
      node.current?.classList.toggle('is-hover', document.body.classList.contains('cursor-hover'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    window.addEventListener('pointermove', onMove, { passive: true });
    frame = window.requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      document.body.classList.remove('cursor-custom');
    };
  }, []);

  return (
    <div className="sketch-cursor" ref={node} aria-hidden="true">
      <svg viewBox="0 0 34 34" width="34" height="34">
        <g fill="none" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 25 L20 9 L25 13 L12 29 Z" fill="#fffefb" />
          <path d="M20 9 L24 5 L29 9 L25 13 Z" fill="#efe6c8" />
          <path d="M12 29 L7 25 L9 32 Z" fill="#1a1a1a" />
        </g>
      </svg>
      <svg className="sketch-cursor__ring" viewBox="0 0 34 34" width="34" height="34">
        <circle cx="17" cy="17" r="15" fill="none" stroke="#1a1a1a" strokeWidth="1.6" strokeDasharray="4 3" />
      </svg>
    </div>
  );
}