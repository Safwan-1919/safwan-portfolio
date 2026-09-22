/**
 * Reusable sketch primitives for corridor props: paper boxes, ink planes,
 * floating groups and a shared hover/click interaction hook.
 */

import { useMemo, useRef, useState, type ReactNode } from 'react';
import * as THREE from 'three';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { audio } from '../../lib/audio';
import { iconTexture, paperTexture, type IconKind } from '../../lib/textures';
import { SketchMesh, wobbleGeometry } from './Ink';

export interface Vector3Tuple {
  x: number;
  y: number;
  z: number;
}

/** Shared paper material cache so props never allocate duplicate materials. */
export function usePaperMaterial(color = '#fffefb', roughness = 0.95): THREE.MeshStandardMaterial {
  return useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: paperTexture(),
        color,
        roughness,
        metalness: 0,
      }),
    [color, roughness],
  );
}

/** A wobbly paper box with an ink contour. */
export function PaperBox({
  size,
  position,
  rotation = [0, 0, 0],
  color = '#fffefb',
  outline = 0.75,
  seed = 21,
}: {
  size: [number, number, number];
  position: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  outline?: number;
  seed?: number;
}): ReactNode {
  const material = usePaperMaterial(color);
  const geometry = useMemo(
    () => wobbleGeometry(new THREE.BoxGeometry(size[0], size[1], size[2], 2, 2, 2), 0.016, seed),
    [size, seed],
  );
  return <SketchMesh geometry={geometry} material={material} outline={outline} position={position} rotation={rotation} />;
}

/** A flat ink drawing on a transparent plane (icons, labels, decals). */
export function InkPlane({
  kind,
  size,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  onClick,
  onHover,
  name,
  opacity = 1,
  outline = 0,
}: {
  kind: IconKind;
  size: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  onClick?: () => void;
  onHover?: (hovering: boolean) => void;
  name?: string;
  opacity?: number;
  outline?: number;
}): ReactNode {
  const [hovered, setHovered] = useState(false);
  const texture = iconTexture(kind);
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [texture, opacity],
  );
  const geometry = useMemo(() => new THREE.PlaneGeometry(size, size), [size]);

  const interactive = Boolean(onClick);

  return (
    <SketchMesh
      name={name}
      geometry={geometry}
      material={material}
      outline={outline}
      position={position}
      rotation={rotation}
      renderOrder={2}
      scale={hovered ? 1.06 : 1}
      onPointerOver={
        interactive
          ? (event: ThreeEvent<PointerEvent>) => {
              event.stopPropagation();
              setHovered(true);
              onHover?.(true);
              document.body.classList.add('cursor-hover');
              audio.play('scribe', 0.6);
            }
          : undefined
      }
      onPointerOut={
        interactive
          ? () => {
              setHovered(false);
              onHover?.(false);
              document.body.classList.remove('cursor-hover');
            }
          : undefined
      }
      onClick={
        interactive
          ? (event: ThreeEvent<MouseEvent>) => {
              event.stopPropagation();
              audio.play('click');
              onClick?.();
            }
          : undefined
      }
    />
  );
}

/** Gently bobbing group, used for balloons, paper planes and stamps. */
export function FloatGroup({
  children,
  position,
  amplitude = 0.12,
  speed = 1,
  phase = 0,
  rotation,
}: {
  children: ReactNode;
  position: [number, number, number];
  amplitude?: number;
  speed?: number;
  phase?: number;
  rotation?: [number, number, number];
}): ReactNode {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * speed + phase;
    ref.current.position.y = position[1] + Math.sin(t) * amplitude;
    ref.current.rotation.z = Math.sin(t * 0.6) * 0.05;
  });
  return (
    <group ref={ref} position={position} rotation={rotation}>
      {children}
    </group>
  );
}

/** Paper leaf / sheet lying at an angle on the floor or a desk. */
export function PaperSheet({
  size,
  position,
  rotation = [0, 0, 0],
  seed = 5,
  color = '#fffefb',
}: {
  size: number | [number, number];
  position: [number, number, number];
  rotation?: [number, number, number];
  seed?: number;
  color?: string;
}): ReactNode {
  const sizeTuple: [number, number] = typeof size === 'number' ? [size, size] : size;
  const material = usePaperMaterial(color);
  const geometry = useMemo(
    () => wobbleGeometry(new THREE.PlaneGeometry(sizeTuple[0], sizeTuple[1], 5, 5), 0.05, seed),
    [sizeTuple, seed],
  );
  return <SketchMesh geometry={geometry} material={material} outline={0.7} position={position} rotation={rotation} />;
}