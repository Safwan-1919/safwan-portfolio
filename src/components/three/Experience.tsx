/**
 * The WebGL experience: a single continuous paper corridor with five stations.
 * Textures, geometry and props are all procedural, so there are no 3D assets to
 * download - the only cost is the first-frame texture bake.
 */

import { Suspense, useMemo, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { content } from '../../content/portfolio';
import { useExperience } from '../../lib/store';
import { useReducedMotion } from '../../hooks';
import { CameraRig } from './CameraRig';
import { Corridor } from './Corridor';
import { ChapterDoor } from './Doors';
import { AboutStation, EntranceStation, GalleryStation, MailStation, StudioStation } from './Stations';

const BACKGROUND = '#f2efe9';

export function Experience(): ReactNode {
  const { quality, openRoom, focusProject, unlock } = useExperience();
  const reducedMotion = useReducedMotion();

  const roomStations = useMemo(
    () => content.stations.filter((station) => station.kind === 'room'),
    [],
  );

  return (
    <Canvas
      className="canvas"
      dpr={[1, quality === 'high' ? 2 : 1.4]}
      camera={{ position: [0, 1.75, 6.4], fov: 55, near: 0.08, far: 130 }}
      gl={{
        antialias: quality === 'high',
        powerPreference: 'high-performance',
        alpha: false,
        stencil: false,
        depth: true,
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(BACKGROUND);
      }}
    >
      <color attach="background" args={[BACKGROUND]} />
      <fog attach="fog" args={[BACKGROUND, 22, 74]} />

      {/* Flat, paper-friendly lighting: no shadows, no drama. */}
      <hemisphereLight args={['#fffdf6', '#d9d3c6', 0.85]} />
      <ambientLight intensity={0.32} />
      <directionalLight position={[7, 9, 6]} intensity={1.05} color="#fff8ec" />
      <directionalLight position={[-8, 5, -12]} intensity={0.34} color="#e9f0ff" />

      <Suspense fallback={null}>
        <Corridor detail={quality} />

        {roomStations.map((station) => (
          <ChapterDoor key={station.id} station={station} onEnter={() => openRoom(station.id)} />
        ))}

        <EntranceStation
          onProject={focusProject}
          onPopSkill={() => undefined}
          onOpenRoom={(room) => openRoom(room)}
          onUnlock={unlock}
        />
        <GalleryStation
          onProject={(projectId) => openRoom('gallery', { project: projectId })}
          onPopSkill={() => undefined}
          onOpenRoom={(room) => openRoom(room)}
          onUnlock={unlock}
        />
        <StudioStation
          onProject={focusProject}
          onPopSkill={() => undefined}
          onOpenRoom={(room) => openRoom(room)}
          onUnlock={unlock}
        />
        <AboutStation
          onProject={focusProject}
          onPopSkill={() => undefined}
          onOpenRoom={(room) => openRoom(room)}
          onUnlock={unlock}
        />
        <MailStation
          onProject={focusProject}
          onPopSkill={() => undefined}
          onOpenRoom={(room) => openRoom(room)}
          onUnlock={unlock}
        />
      </Suspense>

      <CameraRig still={reducedMotion} />
    </Canvas>
  );
}