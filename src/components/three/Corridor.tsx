/**
 * The corridor shell: floor, ceiling, walls, beams, skirting and lamp rig.
 * Everything is procedural paper geometry, so the scene loads instantly.
 */

import { useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import { ceilingTexture, floorTexture, wallTexture } from '../../lib/textures';
import { SketchMesh, softInkLineMaterial, wobbleGeometry } from './Ink';

export const WALL_X = 4.6;
export const WALL_H = 5.2;
export const HALL_START = 10;
export const HALL_END = -82;
const HALL_LENGTH = HALL_START - HALL_END;
const HALL_CENTRE = (HALL_START + HALL_END) / 2;

const LAMP_Z = [2, -8, -18, -28, -38, -48, -58, -70];

export interface CorridorProps {
  detail?: 'high' | 'low';
}

export function Corridor({ detail = 'high' }: CorridorProps): ReactNode {
  const materials = useMemo(() => {
    const paper = new THREE.MeshStandardMaterial({
      map: wallTexture(),
      color: 0xffffff,
      roughness: 0.96,
      metalness: 0,
    });
    const floor = new THREE.MeshStandardMaterial({
      map: floorTexture(),
      color: 0xffffff,
      roughness: 0.98,
      metalness: 0,
    });
    const ceiling = new THREE.MeshStandardMaterial({
      map: ceilingTexture(),
      color: 0xffffff,
      roughness: 0.98,
      metalness: 0,
    });
    const beam = new THREE.MeshStandardMaterial({ color: 0xf1eee7, roughness: 0.95 });
    const lamp = new THREE.MeshStandardMaterial({
      color: 0xfffdf6,
      emissive: new THREE.Color(0xfff3d6),
      emissiveIntensity: 0.42,
      roughness: 0.9,
      side: THREE.DoubleSide,
    });
    const wire = new THREE.MeshBasicMaterial({ color: 0x2a2a2a });
    return { paper, floor, ceiling, beam, lamp, wire };
  }, []);

  const geometry = useMemo(() => {
    const floorGeometry = wobbleGeometry(new THREE.PlaneGeometry(WALL_X * 2, HALL_LENGTH, 22, 40), 0.03, 3);
    const ceilingGeometry = wobbleGeometry(new THREE.PlaneGeometry(WALL_X * 2, HALL_LENGTH, 18, 28), 0.04, 5);
    const wallGeometry = wobbleGeometry(new THREE.PlaneGeometry(HALL_LENGTH, WALL_H, 44, 8), 0.035, 9);
    const endGeometry = wobbleGeometry(new THREE.PlaneGeometry(WALL_X * 2, WALL_H, 12, 6), 0.03, 11);
    const beamGeometry = wobbleGeometry(new THREE.BoxGeometry(WALL_X * 2 - 0.2, 0.24, 0.34), 0.02, 13);
    const skirtingGeometry = wobbleGeometry(new THREE.BoxGeometry(HALL_LENGTH, 0.26, 0.16), 0.02, 15);
    const wireGeometry = wobbleGeometry(new THREE.CylinderGeometry(0.015, 0.015, 1.1, 5), 0.012, 17);
    const shadeGeometry = wobbleGeometry(new THREE.ConeGeometry(0.62, 0.6, 14, 1, true), 0.02, 19);
    const bulbGeometry = new THREE.SphereGeometry(0.14, 12, 10);
    return {
      floorGeometry,
      ceilingGeometry,
      wallGeometry,
      endGeometry,
      beamGeometry,
      skirtingGeometry,
      wireGeometry,
      shadeGeometry,
      bulbGeometry,
    };
  }, []);

  const beamPositions = useMemo(
    () => Array.from({ length: detail === 'high' ? 10 : 6 }, (_, index) => 6 - index * (detail === 'high' ? 8 : 13)),
    [detail],
  );

  const lamps = useMemo(() => (detail === 'high' ? LAMP_Z : LAMP_Z.filter((_, index) => index % 2 === 0)), [detail]);

  return (
    <group>
      {/* Floor + ceiling */}
      <mesh
        geometry={geometry.floorGeometry}
        material={materials.floor}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, HALL_CENTRE]}
      />
      <mesh
        geometry={geometry.ceilingGeometry}
        material={materials.ceiling}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, WALL_H, HALL_CENTRE]}
      />

      {/* Side walls */}
      <mesh
        geometry={geometry.wallGeometry}
        material={materials.paper}
        rotation={[0, Math.PI / 2, 0]}
        position={[-WALL_X, WALL_H / 2, HALL_CENTRE]}
      />
      <mesh
        geometry={geometry.wallGeometry}
        material={materials.paper}
        rotation={[0, -Math.PI / 2, 0]}
        position={[WALL_X, WALL_H / 2, HALL_CENTRE]}
      />

      {/* Closed ends */}
      <SketchMesh
        geometry={geometry.endGeometry}
        material={materials.paper}
        outline={0.3}
        position={[0, WALL_H / 2, HALL_END]}
      />
      <SketchMesh
        geometry={geometry.endGeometry}
        material={materials.paper}
        outline={0.3}
        position={[0, WALL_H / 2, HALL_START]}
        rotation={[0, Math.PI, 0]}
      />

      {/* Skirting boards */}
      <SketchMesh
        geometry={geometry.skirtingGeometry}
        material={materials.beam}
        outline={0.5}
        position={[-WALL_X + 0.08, 0.13, HALL_CENTRE]}
      />
      <SketchMesh
        geometry={geometry.skirtingGeometry}
        material={materials.beam}
        outline={0.5}
        position={[WALL_X - 0.08, 0.13, HALL_CENTRE]}
      />

      {/* Cross beams */}
      {beamPositions.map((z) => (
        <SketchMesh
          key={`beam-${z}`}
          geometry={geometry.beamGeometry}
          material={materials.beam}
          outline={0.4}
          position={[0, WALL_H - 0.14, z]}
        />
      ))}

      {/* Hanging lamps */}
      {lamps.map((z, index) => (
        <group key={`lamp-${z}`} position={[0, 0, z]}>
          <mesh geometry={geometry.wireGeometry} material={materials.wire} position={[0, WALL_H - 0.9, 0]} />
          <SketchMesh
            geometry={geometry.shadeGeometry}
            material={materials.lamp}
            outline={0.6}
            position={[0, WALL_H - 1.55, 0]}
          />
          <mesh geometry={geometry.bulbGeometry} material={materials.lamp} position={[0, WALL_H - 1.78, 0]} />
          {detail === 'high' && index % 2 === 0 && (
            <pointLight position={[0, WALL_H - 1.6, 0]} intensity={9} distance={16} decay={2} color="#fff4dd" />
          )}
        </group>
      ))}

      {/* Pencil line where the walls meet the floor. */}
      <lineSegments material={softInkLineMaterial}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array([
                -WALL_X, 0.015, HALL_START, -WALL_X, 0.015, HALL_END, WALL_X, 0.015, HALL_START, WALL_X, 0.015,
                HALL_END,
              ]),
              3,
            ]}
          />
        </bufferGeometry>
      </lineSegments>
    </group>
  );
}