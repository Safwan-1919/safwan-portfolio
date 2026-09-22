/**
 * The 3D camera rig.
 *
 * The rig is a plain mutable object (not React state) so the render loop can
 * read it every frame without re-rendering the tree. GSAP tweens the rig when
 * the visitor travels between stations, which is what makes the corridor feel
 * scroll-triggered rather than navigated.
 */

import { gsap } from 'gsap';
import { content } from '../content/portfolio';

export interface RigState {
  /** Camera position. */
  x: number;
  y: number;
  z: number;
  /** Camera look-at target. */
  tx: number;
  ty: number;
  tz: number;
  /** Field of view - widens slightly while travelling for speed. */
  fov: number;
  /** Index of the station the rig is heading to / resting at. */
  station: number;
  /** True while a GSAP travel tween is running. */
  travelling: boolean;
  /** Normalised travel speed (0..1), used for motion blur style effects. */
  speed: number;
}

const first = content.stations[0].camera;

export const rig: RigState = {
  x: first.position[0],
  y: first.position[1],
  z: first.position[2],
  tx: first.lookAt[0],
  ty: first.lookAt[1],
  tz: first.lookAt[2],
  fov: 55,
  station: 0,
  travelling: false,
  speed: 0,
};

/** Mutable pointer state (-1..1 on both axes) for parallax head movement. */
export const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };

let activeTween: gsap.core.Tween | null = null;

export interface TravelOptions {
  /** Jump instantly (used by the preloader hand-off). */
  instant?: boolean;
  /** Duration override in seconds. */
  duration?: number;
  /** Skip the audio/visual "whoosh" side effects. */
  silent?: boolean;
}

/**
 * Travel to a station. Returns the tween duration in seconds so callers can
 * temporarily lock input while the camera is in motion.
 */
export function travelTo(index: number, options: TravelOptions = {}): number {
  const clamped = Math.max(0, Math.min(content.stations.length - 1, index));
  const { camera } = content.stations[clamped];
  const [px, py, pz] = camera.position;
  const [lx, ly, lz] = camera.lookAt;
  const distance = Math.abs(rig.z - pz);
  const duration = options.instant ? 0 : options.duration ?? Math.min(2.4, 1.05 + distance * 0.022);

  activeTween?.kill();
  rig.station = clamped;

  if (options.instant || duration === 0) {
    rig.x = px;
    rig.y = py;
    rig.z = pz;
    rig.tx = lx;
    rig.ty = ly;
    rig.tz = lz;
    rig.fov = 55;
    rig.travelling = false;
    rig.speed = 0;
    return 0;
  }

  rig.travelling = true;
  const startFov = rig.fov;
  activeTween = gsap.to(rig, {
    x: px,
    y: py,
    z: pz,
    tx: lx,
    ty: ly,
    tz: lz,
    fov: 59,
    duration,
    ease: 'power2.inOut',
    overwrite: true,
    onUpdate: () => {
      const progress = activeTween?.progress() ?? 0;
      rig.speed = Math.sin(Math.min(1, progress * 1.6) * Math.PI) * 0.9;
    },
    onComplete: () => {
      gsap.to(rig, { fov: 55, duration: 0.45, ease: 'sine.out' });
      rig.travelling = false;
      rig.speed = 0;
      void startFov;
    },
  });

  return duration;
}

/** Step one station forward / backward. */
export function stepStation(direction: 1 | -1, options: TravelOptions = {}): number {
  return travelTo(rig.station + direction, options);
}

/** Where the rig currently is, as a station id. */
export function currentStationId(): string {
  return content.stations[rig.station]?.id ?? 'corridor';
}