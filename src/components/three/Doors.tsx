/**
 * Chapter doors. Each door is a paper leaf on a real hinge: it swings open on
 * hover, and clicking it travels the camera there and opens the room sheet.
 */

import { useMemo, useRef, useState, type ReactNode } from 'react';
import * as THREE from 'three';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { doorTexture, type IconKind } from '../../lib/textures';
import type { Station } from '../../types';
import { SketchMesh, wobbleGeometry } from './Ink';
import { WALL_X } from './Corridor';

const DOOR_ICONS: Record<string, IconKind> = {
  gallery: 'star',
  studio: 'monitor',
  about: 'pencil',
  contact: 'envelope',
};

export interface ChapterDoorProps {
  station: Station;
  onEnter: () => void;
  onHover?: (hovering: boolean) => void;
}

export function ChapterDoor({ station, onEnter, onHover }: ChapterDoorProps): ReactNode {
  const [hovered, setHovered] = useState(false);
  const pivot = useRef<THREE.Group>(null);
  const swing = useRef(0);
  const side = station.camera.doorSide;
  const doorZ = station.camera.doorZ;
  const isLeft = side === 'left';

  const wallX = isLeft ? -WALL_X : WALL_X;
  const surfaceX = wallX + (isLeft ? 0.07 : -0.07);
  const faceRotation = isLeft ? Math.PI / 2 : -Math.PI / 2;
  const seed = 4000 + station.chapter.charCodeAt(0) * 17 + doorZ;

  const texture = useMemo(
    () =>
      doorTexture({
        station: station.id,
        chapter: station.chapter,
        title: station.title,
        tagline: station.tagline,
        icon: DOOR_ICONS[station.id] ?? 'star',
        seed,
      }),
    [station, seed],
  );

  const materials = useMemo(() => {
    const leaf = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.94,
      metalness: 0,
      side: THREE.DoubleSide,
    });
    const frame = new THREE.MeshStandardMaterial({ color: 0xf3f0e9, roughness: 0.95 });
    return { leaf, frame };
  }, [texture]);

  const geometry = useMemo(() => {
    const leaf = wobbleGeometry(new THREE.PlaneGeometry(2.35, 4.6, 6, 12), 0.022, seed + 3);
    const lintel = wobbleGeometry(new THREE.BoxGeometry(0.16, 0.34, 2.78), 0.02, seed + 5);
    const jamb = wobbleGeometry(new THREE.BoxGeometry(0.16, 4.9, 0.2), 0.02, seed + 7);
    const threshold = wobbleGeometry(new THREE.BoxGeometry(0.62, 0.12, 2.6), 0.02, seed + 9);
    const backing = wobbleGeometry(new THREE.PlaneGeometry(2.9, 5.2, 4, 6), 0.02, seed + 11);
    return { leaf, lintel, jamb, threshold, backing };
  }, [seed]);

  // Smooth hinge animation (no allocation per frame).
  useFrame(() => {
    const target = hovered ? 0.46 : 0;
    swing.current += (target - swing.current) * 0.12;
    if (pivot.current) {
      // Right-hand doors swing into the room (+x), left-hand doors into (-x).
      pivot.current.rotation.y = (isLeft ? -1 : 1) * swing.current;
    }
  });

  const handleOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    if (!hovered) {
      setHovered(true);
      onHover?.(true);
      document.body.classList.add('cursor-hover');
    }
  };

  const handleOut = () => {
    setHovered(false);
    onHover?.(false);
    document.body.classList.remove('cursor-hover');
  };

  return (
    <group position={[surfaceX, 0, doorZ]}>
      {/* Recessed backing sheet gives the doorway depth. */}
      <mesh
        geometry={geometry.backing}
        material={materials.frame}
        rotation={[0, faceRotation, 0]}
        position={[isLeft ? -0.06 : 0.06, 2.6, 0]}
      />

      {/* Frame: lintel, jambs, threshold. */}
      <SketchMesh
        geometry={geometry.lintel}
        material={materials.frame}
        outline={0.7}
        position={[isLeft ? -0.04 : 0.04, 5.02, 0]}
      />
      <SketchMesh
        geometry={geometry.jamb}
        material={materials.frame}
        outline={0.7}
        position={[isLeft ? -0.04 : 0.04, 2.45, -1.24]}
      />
      <SketchMesh
        geometry={geometry.jamb}
        material={materials.frame}
        outline={0.7}
        position={[isLeft ? -0.04 : 0.04, 2.45, 1.24]}
      />
      <SketchMesh
        geometry={geometry.threshold}
        material={materials.frame}
        outline={0.5}
        position={[isLeft ? 0.16 : -0.16, 0.08, 0]}
      />

      {/* Hinged leaf. */}
      <group ref={pivot} position={[0, 2.42, -1.2]}>
        <SketchMesh
          geometry={geometry.leaf}
          material={materials.leaf}
          outline={0.55}
          rotation={[0, faceRotation, 0]}
          position={[0, 0, 1.18]}
          onPointerOver={handleOver}
          onPointerOut={handleOut}
          onClick={(event: ThreeEvent<MouseEvent>) => {
            event.stopPropagation();
            onEnter();
          }}
        />
      </group>
    </group>
  );
}