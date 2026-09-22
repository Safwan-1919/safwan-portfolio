/**
 * Drives the default camera from the rig state every frame: travel tweens come
 * from GSAP, while idle breathing, pointer parallax and camera roll are applied
 * here so the corridor feels hand-held rather than mechanical.
 */

import { useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { pointer, rig } from '../../lib/rig';

export interface CameraRigProps {
  /** Disable idle motion (reduced-motion visitors). */
  still?: boolean;
  /** Extra damping factor. */
  damping?: number;
}

export function CameraRig({ still = false, damping = 4.2 }: CameraRigProps): ReactNode {
  const camera = useThree((state) => state.camera);
  const position = useRef(new THREE.Vector3(rig.x, rig.y, rig.z));
  const look = useRef(new THREE.Vector3(rig.tx, rig.ty, rig.tz));

  useFrame((state, delta) => {
    const step = Math.min(1, delta * damping);
    const time = state.clock.elapsedTime;

    pointer.x += (pointer.targetX - pointer.x) * Math.min(1, delta * 2.4);
    pointer.y += (pointer.targetY - pointer.y) * Math.min(1, delta * 2.4);

    const breathe = still ? 0 : Math.sin(time * 0.55) * 0.022;
    const sway = still ? 0 : Math.sin(time * 0.23) * 0.06;
    const bob = still ? 0 : Math.sin(time * 2.1) * rig.speed * 0.012;

    position.current.set(
      rig.x + sway + pointer.x * 0.22,
      rig.y + breathe + bob - pointer.y * 0.16,
      rig.z,
    );
    camera.position.lerp(position.current, step);

    look.current.set(rig.tx + pointer.x * 0.55, rig.ty - pointer.y * 0.4, rig.tz);
    camera.lookAt(look.current);
    camera.rotation.z += still ? 0 : pointer.x * 0.014;

    const perspective = camera as THREE.PerspectiveCamera;
    const nextFov = perspective.fov + (rig.fov - perspective.fov) * Math.min(1, delta * 3.2);
    if (Math.abs(nextFov - perspective.fov) > 0.001) {
      perspective.fov = nextFov;
      perspective.updateProjectionMatrix();
    }
  });

  return null;
}