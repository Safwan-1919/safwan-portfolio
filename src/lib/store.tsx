/**
 * Experience store: corridor navigation, room sheets, achievements and sound.
 *
 * Kept deliberately small: a context with plain state so the 3D rig can stay
 * outside React while the DOM overlay stays declarative.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { gsap } from 'gsap';
import { content } from '../content/portfolio';
import { audio } from './audio';
import { rig, travelTo } from './rig';
import type { StationId, Unlock } from '../types';

const UNLOCK_KEY = 'kraft:unlocks';
export const ROOM_STATIONS: StationId[] = ['gallery', 'studio', 'about', 'contact'];

export interface ExperienceValue {
  /** Preloader has finished and the corridor is interactive. */
  started: boolean;
  markStarted: () => void;
  /** Index of the station the visitor is at (or travelling to). */
  stationIndex: number;
  stationId: StationId;
  /** Currently open room sheet, if any. */
  activeRoom: StationId | null;
  /** Project highlighted inside the gallery sheet. */
  focusedProject: string | null;
  visitedRooms: StationId[];
  /** Achievements. */
  unlocked: string[];
  unlock: (id: string) => void;
  popup: Unlock | null;
  dismissPopup: () => void;
  muteSound: () => void;
  unmuteSound: () => void;
  muted: boolean;
  quality: 'high' | 'low';
  /** Navigation API used by nav, doors, wheel and keyboard. */
  travel: (index: number, options?: { silent?: boolean }) => void;
  openRoom: (id: StationId, options?: { project?: string; instant?: boolean }) => void;
  closeRoom: () => void;
  focusProject: (projectId: string) => void;
}

const ExperienceContext = createContext<ExperienceValue | null>(null);

function readUnlocks(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(UNLOCK_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export interface ExperienceProviderProps {
  children: ReactNode;
  quality?: 'high' | 'low';
  /** Initial room to open (deep links / tests). */
  initialRoom?: StationId | null;
  /** Initial project highlighted inside the gallery sheet. */
  initialProject?: string | null;
}

export function ExperienceProvider({
  children,
  quality = 'high',
  initialRoom = null,
  initialProject = null,
}: ExperienceProviderProps): ReactNode {
  const [started, setStarted] = useState(false);
  const [stationIndex, setStationIndex] = useState(rig.station);
  const [activeRoom, setActiveRoom] = useState<StationId | null>(initialRoom);
  const [focusedProject, setFocusedProject] = useState<string | null>(initialProject);
  const [visitedRooms, setVisitedRooms] = useState<StationId[]>([]);
  const [unlocked, setUnlocked] = useState<string[]>(readUnlocks);
  const [queue, setQueue] = useState<Unlock[]>([]);
  const [muted, setMuted] = useState(audio.isMuted);
  const pendingCall = useRef<gsap.core.Tween | null>(null);

  /** Queue an achievement popup (only once per id). */
  const unlock = useCallback((id: string) => {
    const entry = content.unlocks.find((item) => item.id === id);
    if (!entry) return;
    setUnlocked((current) => {
      if (current.includes(id)) return current;
      setQueue((pending) => [...pending, entry]);
      return [...current, id];
    });
  }, []);

  // Persist achievements.
  useEffect(() => {
    try {
      window.localStorage.setItem(UNLOCK_KEY, JSON.stringify(unlocked));
    } catch {
      /* storage unavailable (private mode) - achievements stay in memory */
    }
  }, [unlocked]);

  // Keep React in sync with the audio engine (nav toggle + inline popup toggle).
  useEffect(() => audio.subscribe(setMuted), []);

  const travel = useCallback(
    (index: number, options: { silent?: boolean } = {}) => {
      const clamped = Math.max(0, Math.min(content.stations.length - 1, index));
      const duration = travelTo(clamped, { duration: options.silent ? 0.5 : undefined });
      setStationIndex(clamped);
      pendingCall.current?.kill();
      const target = content.stations[clamped];
      if (target.kind === 'room') {
        unlock(`${target.id}-visited`);
      }
      if (duration > 0.6) {
        audio.play('whoosh', 0.8);
      }
    },
    [unlock],
  );

  const openRoom = useCallback(
    (id: StationId, options: { project?: string; instant?: boolean } = {}) => {
      const index = content.stations.findIndex((station) => station.id === id);
      if (index < 0) return;
      const duration = travelTo(index, { duration: options.instant ? 0 : undefined });
      setStationIndex(index);
      if (options.project) setFocusedProject(options.project);
      setVisitedRooms((current) => (current.includes(id) ? current : [...current, id]));
      unlock(`${id}-visited`);
      audio.play('page');

      pendingCall.current?.kill();
      pendingCall.current = gsap.delayedCall(Math.max(0.25, duration * 0.55), () => {
        setActiveRoom(id);
      });
    },
    [unlock],
  );

  const closeRoom = useCallback(() => {
    setActiveRoom(null);
    audio.play('click');
  }, []);

  const focusProject = useCallback((projectId: string) => {
    setFocusedProject(projectId);
    setActiveRoom('gallery');
    audio.play('page');
  }, []);

  const markStarted = useCallback(() => {
    setStarted(true);
    unlock('entered');
  }, [unlock]);

  const dismissPopup = useCallback(() => setQueue((current) => current.slice(1)), []);

  const muteSound = useCallback(() => {
    void audio.setMuted(true);
  }, []);

  const unmuteSound = useCallback(() => {
      void audio.startAmbient();
      void audio.setMuted(false);
      void audio.playTrack('audio/song.mp3');
      unlock('sound-on');
  }, [unlock]);

  // Every room visited → completion achievement.
  useEffect(() => {
    if (ROOM_STATIONS.every((id) => unlocked.includes(`${id}-visited`))) {
      unlock('all-rooms');
    }
  }, [unlocked, unlock]);

  // Hint the visitor that the door plaques are clickable.
  useEffect(() => {
    if (!started) return;
    const timer = window.setTimeout(() => unlock('signs-read'), 15000);
    return () => window.clearTimeout(timer);
  }, [started, unlock]);

  // Auto-dismiss popups so they never pile up on screen.
  useEffect(() => {
    if (!queue.length) return;
    const timer = window.setTimeout(() => setQueue((current) => current.slice(1)), 6400);
    return () => window.clearTimeout(timer);
  }, [queue]);

  useEffect(
    () => () => {
      pendingCall.current?.kill();
    },
    [],
  );

  const value = useMemo<ExperienceValue>(
    () => ({
      started,
      markStarted,
      stationIndex,
      stationId: content.stations[stationIndex]?.id ?? 'corridor',
      activeRoom,
      focusedProject,
      visitedRooms,
      unlocked,
      unlock,
      popup: queue[0] ?? null,
      dismissPopup,
      muteSound,
      unmuteSound,
      muted,
      quality,
      travel,
      openRoom,
      closeRoom,
      focusProject,
    }),
    [
      started,
      markStarted,
      stationIndex,
      activeRoom,
      focusedProject,
      visitedRooms,
      unlocked,
      unlock,
      queue,
      dismissPopup,
      muteSound,
      unmuteSound,
      muted,
      quality,
      travel,
      openRoom,
      closeRoom,
      focusProject,
    ],
  );

  return <ExperienceContext.Provider value={value}>{children}</ExperienceContext.Provider>;
}

export function useExperience(): ExperienceValue {
  const value = useContext(ExperienceContext);
  if (!value) {
    throw new Error('useExperience must be used inside <ExperienceProvider>.');
  }
  return value;
}