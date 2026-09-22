/**
 * The ink layer: every solid in the corridor is drawn twice - a paper-white
 * surface plus a wobbly black contour - which is what sells the hand-drawn look.
 */

import { useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import type { ThreeElements } from '@react-three/fiber';

/** Shared contour material (never disposed: it lives for the app's lifetime). */
export const inkLineMaterial = new THREE.LineBasicMaterial({
  color: 0x1a1a1a,
  transparent: true,
  opacity: 0.82,
  depthWrite: true,
});

/** Softer contour used for background/structural shapes. */
export const softInkLineMaterial = new THREE.LineBasicMaterial({
  color: 0x3a3a3a,
  transparent: true,
  opacity: 0.32,
});

/**
 * Deterministic vertex jitter so straight geometry reads as hand-drawn.
 *
 * Vertices that share the same position (box seams, duplicated face corners)
 * receive the same offset, which keeps surfaces watertight.
 */
export function wobbleGeometry(geometry: THREE.BufferGeometry, amount = 0.012, seed = 7): THREE.BufferGeometry {
  if (amount <= 0) return geometry;
  const position = geometry.attributes.position as THREE.BufferAttribute;
  const hash = (value: number) => {
    const s = Math.sin(value * 127.1 + seed * 311.7) * 43758.5453;
    return s - Math.floor(s);
  };

  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);
    const key = Math.round(x * 1000) * 7.13 + Math.round(y * 1000) * 3.71 + Math.round(z * 1000) * 1.37;
    position.setXYZ(
      i,
      x + (hash(key) - 0.5) * amount,
      y + (hash(key + 11.3) - 0.5) * amount,
      z + (hash(key + 27.9) - 0.5) * amount,
    );
  }
  position.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

export interface SketchMeshProps extends Omit<ThreeElements['mesh'], 'geometry' | 'material'> {
  geometry: THREE.BufferGeometry;
  material: THREE.Material | THREE.Material[];
  /** Contour opacity; 0 disables the outline. */
  outline?: number;
  /** Edge threshold passed to EdgesGeometry. */
  threshold?: number;
  children?: ReactNode;
}

/** A paper surface with its hand-drawn contour. */
export function SketchMesh({
  geometry,
  material,
  outline = 0.82,
  threshold = 24,
  children,
  ...props
}: SketchMeshProps): ReactNode {
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry, threshold), [geometry, threshold]);

  return (
    <mesh geometry={geometry} material={material} {...props}>
      {outline > 0 && (
        <lineSegments geometry={edges} material={outline >= 0.6 ? inkLineMaterial : softInkLineMaterial} />
      )}
      {children}
    </mesh>
  );
}