/**
 * Corridor stations: the props that turn a hallway into a portfolio.
 * Each station draws its slice of content (projects, skills, awards, contact)
 * with the shared sketch primitives.
 */

import { useMemo, useState, type ReactNode } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { content } from '../../content/portfolio';
import { artTexture, avatarTexture, signTexture } from '../../lib/textures';
import { useInterval } from '../../hooks';
import { SketchMesh, wobbleGeometry } from './Ink';
import { FloatGroup, InkPlane, PaperBox, PaperSheet, usePaperMaterial } from './SketchParts';
import { HALL_END, WALL_X } from './Corridor';

const LEFT_WALL_X = -WALL_X + 0.17;

/** Handwritten DOM label anchored to a 3D position. */
function SketchLabel({
  position,
  title,
  meta,
  tone = 'plain',
}: {
  position: [number, number, number];
  title: string;
  meta?: string;
  tone?: 'plain' | 'tape';
}): ReactNode {
  return (
    <Html position={position} center distanceFactor={9} zIndexRange={[30, 0]} style={{ pointerEvents: 'none' }}>
      <div className={`sketch-label sketch-label--${tone}`}>
        <span className="sketch-label__title">{title}</span>
        {meta ? <span className="sketch-label__meta">{meta}</span> : null}
      </div>
    </Html>
  );
}

export interface StationProps {
  onProject: (projectId: string) => void;
  onPopSkill: (skillId: string) => void;
  onOpenRoom: (room: 'gallery' | 'studio' | 'about' | 'contact') => void;
  onUnlock: (id: string) => void;
}

/* ------------------------------------------------------------------ entrance */

export function EntranceStation({ onOpenRoom, onUnlock }: StationProps): ReactNode {
  const [pose, setPose] = useState(0);
  const signMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: signTexture(content.identity.alias, content.identity.title),
        roughness: 0.95,
      }),
    [],
  );
  const signGeometry = useMemo(() => wobbleGeometry(new THREE.PlaneGeometry(3.2, 1.6, 6, 4), 0.03, 31), []);
  const avatarGeometry = useMemo(() => new THREE.PlaneGeometry(1.9, 3.8, 1, 1), []);
  const avatarMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: avatarTexture(0),
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [],
  );

  // Flip-book: swap the sketched frame so the character keeps waving.
  useInterval(() => setPose((current) => (current + 1) % 6), 240);

  useFrame(() => {
    const next = avatarTexture(pose);
    if (avatarMaterial.map !== next) {
      avatarMaterial.map = next;
      avatarMaterial.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Hanging sign with the alias. */}
      <SketchMesh geometry={signGeometry} material={signMaterial} outline={0.6} position={[0, 3.55, -7.2]} />
      <mesh position={[-0.9, 4.55, -7.2]}>
        <cylinderGeometry args={[0.012, 0.012, 1.4, 5]} />
        <meshBasicMaterial color="#2a2a2a" />
      </mesh>
      <mesh position={[0.9, 4.55, -7.2]}>
        <cylinderGeometry args={[0.012, 0.012, 1.4, 5]} />
        <meshBasicMaterial color="#2a2a2a" />
      </mesh>

      {/* The sketched character, clickable -> About. */}
      <SketchMesh
        geometry={avatarGeometry}
        material={avatarMaterial}
        outline={0}
        position={[-2.05, 1.95, -5.6]}
        onClick={() => onOpenRoom('about')}
        onPointerOver={() => document.body.classList.add('cursor-hover')}
        onPointerOut={() => document.body.classList.remove('cursor-hover')}
      />
      <SketchLabel
        position={[-2.05, 4.15, -5.6]}
        title={content.identity.name}
        meta={content.identity.location}
        tone="tape"
      />

      {/* Plant, mug, pencil, cat, paper plane. */}
      <InkPlane kind="plant" size={2.1} position={[2.7, 1.25, -6.2]} />
      <InkPlane kind="coffee" size={0.95} position={[1.55, 0.5, -2.6]} onClick={() => onUnlock('coffee-found')} />
      <InkPlane
        kind="pencil"
        size={1.5}
        position={[-1.35, 0.45, -1.4]}
        rotation={[0, 0, -0.42]}
        onClick={() => onUnlock('pencil-found')}
      />
      <InkPlane kind="cat" size={1.5} position={[3.5, 0.75, -9.4]} />
      <FloatGroup position={[1.95, 2.6, -0.6]} amplitude={0.22} speed={0.8}>
        <InkPlane kind="plane" size={0.9} rotation={[0, 0, 0.2]} />
      </FloatGroup>

      {/* Scattered studio paper. */}
      <PaperSheet size={0.9} position={[-3.1, 0.014, -3.2]} rotation={[-Math.PI / 2, 0, 0.5]} seed={41} />
      <PaperSheet size={0.7} position={[2.1, 0.014, -8.2]} rotation={[-Math.PI / 2, 0, -0.9]} seed={43} />
    </group>
  );
}

/* ------------------------------------------------------------------- gallery */

export function GalleryStation({ onProject }: StationProps): ReactNode {
  const frameMaterial = usePaperMaterial('#f6f3ec');
  const projects = content.projects;

  const frameGeometry = useMemo(() => wobbleGeometry(new THREE.BoxGeometry(1.78, 1.78, 0.1), 0.02, 61), []);
  const artGeometry = useMemo(() => new THREE.PlaneGeometry(1.56, 1.56), []);
  const railGeometry = useMemo(() => wobbleGeometry(new THREE.BoxGeometry(0.1, 0.12, 12), 0.02, 63), []);

  const artMaterials = useMemo(
    () =>
      projects.map(
        (project, index) =>
          new THREE.MeshStandardMaterial({
            map: artTexture({
              id: project.id,
              title: project.title,
              meta: `${project.year} · ${project.role}`,
              seed: project.artSeed + index,
            }),
            roughness: 0.96,
            metalness: 0,
          }),
      ),
    [projects],
  );

  return (
    <group>
      {projects.map((project, index) => {
        const z = -12.4 - index * 3.1;
        const y = index % 2 === 0 ? 2.15 : 2.35;
        return (
          <group key={project.id} position={[0, 0, z]}>
            <SketchMesh
              geometry={frameGeometry}
              material={frameMaterial}
              outline={0.8}
              position={[-WALL_X + 0.11, y, 0]}
              rotation={[0, Math.PI / 2, 0]}
            />
            <SketchMesh
              geometry={artGeometry}
              material={artMaterials[index]}
              outline={0}
              position={[LEFT_WALL_X, y, 0]}
              rotation={[0, Math.PI / 2, 0]}
              onClick={() => onProject(project.id)}
              onPointerOver={() => document.body.classList.add('cursor-hover')}
              onPointerOut={() => document.body.classList.remove('cursor-hover')}
            />
            <SketchLabel position={[LEFT_WALL_X + 0.45, y - 1.3, 0]} title={project.title} meta={project.subtitle} />
          </group>
        );
      })}

      {/* A bench and a rail so the gallery reads as a room, not a wall. */}
      <PaperBox size={[0.55, 0.14, 2.6]} position={[-0.5, 0.62, -19.4]} seed={71} />
      <PaperBox size={[0.12, 0.6, 0.12]} position={[-0.5, 0.3, -20.5]} seed={73} />
      <PaperBox size={[0.12, 0.6, 0.12]} position={[-0.5, 0.3, -18.3]} seed={75} />
      <SketchMesh geometry={railGeometry} material={frameMaterial} outline={0.5} position={[WALL_X - 0.25, 1.05, -23]} />

      <SketchLabel
        position={[-WALL_X + 0.7, 4.0, -21]}
        title={content.stations.find((station) => station.id === 'gallery')?.title ?? 'Projects'}
        meta={`${projects.length} case studies`}
        tone="tape"
      />
    </group>
  );
}


/* -------------------------------------------------------------------- studio */

export function StudioStation({ onPopSkill, onUnlock }: StationProps): ReactNode {
  const skills = content.skills.slice(0, 6);
  const [popped, setPopped] = useState<string[]>([]);
  const balloonRefs = useMemo(() => skills.map(() => ({ current: null as THREE.Group | null })), [skills]);
  const balloonMaterial = usePaperMaterial('#fffdf6', 0.9);
  const stringMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: 0x2a2a2a }), []);
  const balloonGeometry = useMemo(() => wobbleGeometry(new THREE.SphereGeometry(0.34, 14, 12), 0.02, 81), []);
  const stringGeometry = useMemo(() => new THREE.CylinderGeometry(0.006, 0.006, 1.6, 4), []);

  const pop = (skillId: string, index: number) => {
    if (popped.includes(skillId)) return;
    const node = balloonRefs[index].current;
    setPopped((current) => [...current, skillId]);
    onPopSkill(skillId);
    onUnlock('skill-popped');
    if (node) {
      gsap.to(node.scale, { x: 1.5, y: 0.25, z: 1.5, duration: 0.16, ease: 'power2.out' });
      gsap.to(node.position, { y: node.position.y + 1.0, duration: 0.32, ease: 'power1.out' });
      gsap.to(node.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.24, delay: 0.18, ease: 'back.in(2)' });
    }
  };

  const deskMaterial = usePaperMaterial('#f4efe4');
  const screenMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: artTexture({ id: 'studio-screen', title: 'build.log', meta: 'npm run dev', seed: 3311 }),
        roughness: 0.9,
      }),
    [],
  );
  const monitorGeometry = useMemo(() => wobbleGeometry(new THREE.BoxGeometry(0.12, 1.25, 2.0), 0.02, 91), []);
  const screenGeometry = useMemo(() => new THREE.PlaneGeometry(1.86, 1.14), []);

  return (
    <group>
      {/* Floating skill balloons - pop them for fun. */}
      {skills.map((skill, index) => {
        const x = -2.2 + (index % 3) * 2.2;
        const y = 3.45 + Math.floor(index / 3) * 0.55;
        const z = -31.6 - index * 1.8;
        return (
          <group
            key={skill.id}
            ref={(node) => {
              balloonRefs[index].current = node;
            }}
            position={[x, y, z]}
            visible={!popped.includes(skill.id)}
          >
            <SketchMesh
              geometry={balloonGeometry}
              material={balloonMaterial}
              outline={0.9}
              onClick={() => pop(skill.id, index)}
              onPointerOver={() => document.body.classList.add('cursor-hover')}
              onPointerOut={() => document.body.classList.remove('cursor-hover')}
            />
            <mesh geometry={stringGeometry} material={stringMaterial} position={[0, 1.5, 0]} />
            <SketchLabel position={[0, -0.66, 0]} title={skill.label} meta={`${skill.level}%`} />
          </group>
        );
      })}

      {/* The desk against the right wall. */}
      <PaperBox size={[1.5, 0.1, 3.4]} position={[WALL_X - 1.0, 1.0, -36]} seed={93} />
      <PaperBox size={[0.12, 1.0, 0.12]} position={[WALL_X - 0.4, 0.5, -34.6]} seed={95} />
      <PaperBox size={[0.12, 1.0, 0.12]} position={[WALL_X - 0.4, 0.5, -37.4]} seed={97} />
      <SketchMesh geometry={monitorGeometry} material={deskMaterial} outline={0.8} position={[WALL_X - 1.9, 1.95, -36]} />
      <SketchMesh
        geometry={screenGeometry}
        material={screenMaterial}
        outline={0}
        position={[WALL_X - 1.97, 1.95, -36]}
        rotation={[0, -Math.PI / 2, 0]}
      />
      <InkPlane kind="phone" size={0.7} position={[WALL_X - 1.3, 1.35, -34.4]} rotation={[0, -Math.PI / 2, 0]} />
      <InkPlane kind="coffee" size={0.75} position={[WALL_X - 1.25, 1.4, -37.2]} rotation={[0, -Math.PI / 2, 0]} />
      <InkPlane kind="bulb" size={1.4} position={[WALL_X - 0.2, 3.35, -33.6]} rotation={[0, -Math.PI / 2, 0]} />
      <SketchLabel
        position={[WALL_X - 0.4, 4.15, -36]}
        title={content.stations.find((station) => station.id === 'studio')?.title ?? 'The Studio'}
        meta={`${content.skills.length} skills · ${content.awards.length} hackathons`}
        tone="tape"
      />
    </group>
  );
}

/* --------------------------------------------------------------------- about */

export function AboutStation({ onOpenRoom }: StationProps): ReactNode {
  const boardMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: artTexture({
          id: 'portrait',
          title: content.identity.name,
          meta: content.identity.alias,
          seed: 9090,
        }),
        roughness: 0.95,
      }),
    [],
  );
  const boardGeometry = useMemo(() => new THREE.PlaneGeometry(1.95, 2.35), []);
  const frameGeometry = useMemo(() => wobbleGeometry(new THREE.BoxGeometry(2.1, 2.5, 0.14), 0.02, 101), []);
  const legGeometry = useMemo(() => wobbleGeometry(new THREE.BoxGeometry(0.1, 2.5, 0.1), 0.02, 103), []);
  const frameMaterial = usePaperMaterial('#f5f1e8');

  return (
    <group>
      {/* Easel with the sketched self-portrait. */}
      <group position={[WALL_X - 1.35, 0, -47.6]}>
        <SketchMesh
          geometry={frameGeometry}
          material={frameMaterial}
          outline={0.8}
          position={[0, 1.9, 0]}
          rotation={[0, -Math.PI / 2, 0]}
        />
        <SketchMesh
          geometry={boardGeometry}
          material={boardMaterial}
          outline={0}
          position={[-0.12, 1.9, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          onClick={() => onOpenRoom('about')}
          onPointerOver={() => document.body.classList.add('cursor-hover')}
          onPointerOut={() => document.body.classList.remove('cursor-hover')}
        />
        <SketchMesh
          geometry={legGeometry}
          material={frameMaterial}
          outline={0.5}
          position={[0.5, 1.25, -0.75]}
          rotation={[0, 0, 0.22]}
        />
        <SketchMesh
          geometry={legGeometry}
          material={frameMaterial}
          outline={0.5}
          position={[0.5, 1.25, 0.75]}
          rotation={[0, 0, -0.22]}
        />
        <SketchMesh
          geometry={legGeometry}
          material={frameMaterial}
          outline={0.5}
          position={[0.85, 1.25, 0]}
          rotation={[0, 0, 0.34]}
        />
        <PaperBox size={[1.0, 0.08, 0.34]} position={[-0.12, 0.8, 0]} color="#f7f3ea" seed={105} />
      </group>

      {/* Awards pinned to the wall, one per achievement. */}
      {content.awards.map((award, index) => {
        const z = -49.6 - index * 2.2;
        const y = index % 2 === 0 ? 1.95 : 2.85;
        return (
          <group key={award.id} position={[0, 0, z]}>
            <InkPlane
              kind={award.kind}
              size={1.15}
              position={[WALL_X - 0.2, y, 0]}
              rotation={[0, -Math.PI / 2, 0]}
              onClick={() => onOpenRoom('about')}
            />
            <SketchLabel
              position={[WALL_X - 0.6, y - 0.98, 0]}
              title={award.title}
              meta={`${award.issuer} · ${award.year}`}
            />
          </group>
        );
      })}

      <SketchLabel
        position={[WALL_X - 0.7, 3.85, -53]}
        title={content.stations.find((station) => station.id === 'about')?.title ?? 'About'}
        meta={`${content.timeline.length} roles · ${content.education[0]?.period ?? ''}`}
        tone="tape"
      />

      {/* Paper stack on the floor. */}
      <PaperSheet size={1.1} position={[1.4, 0.014, -50.6]} rotation={[-Math.PI / 2, 0, 0.24]} seed={107} />
      <PaperSheet size={0.9} position={[1.15, 0.05, -50.9]} rotation={[-Math.PI / 2, 0, -0.4]} seed={109} />
      <InkPlane kind="coffee" size={0.95} position={[-1.9, 0.5, -51.8]} onClick={() => onOpenRoom('about')} />
    </group>
  );
}

/* ---------------------------------------------------------------- post room */

export function MailStation({ onOpenRoom, onUnlock }: StationProps): ReactNode {
  const panelMaterial = usePaperMaterial('#f4eee1');
  const signMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: signTexture(content.identity.alias, 'let us build something'),
        roughness: 0.94,
      }),
    [],
  );
  const signGeometry = useMemo(() => wobbleGeometry(new THREE.PlaneGeometry(4.2, 2.1, 8, 5), 0.03, 121), []);
  const panelGeometry = useMemo(() => wobbleGeometry(new THREE.PlaneGeometry(4.6, 2.6), 0.03, 123), []);

  return (
    <group>
      {/* End-of-corridor sign, glowing softly. */}
      <SketchMesh geometry={signGeometry} material={signMaterial} outline={0.7} position={[0, 3.05, HALL_END + 0.4]} />
      <pointLight position={[0, 3.4, HALL_END + 2.6]} intensity={16} distance={24} decay={2} color="#fff0cf" />
      <SketchMesh
        geometry={panelGeometry}
        material={panelMaterial}
        outline={0.6}
        position={[0, 1.4, HALL_END + 0.4]}
        onClick={() => onOpenRoom('contact')}
        onPointerOver={() => document.body.classList.add('cursor-hover')}
        onPointerOut={() => document.body.classList.remove('cursor-hover')}
      />
      <SketchLabel position={[0, 1.4, HALL_END + 1.2]} title="Start a project" meta={content.identity.availability} tone="tape" />

      {/* Mail desk against the left wall. */}
      <PaperBox size={[1.4, 0.1, 3.2]} position={[-WALL_X + 1.0, 1.0, -66]} color="#f4eee1" seed={125} />
      <PaperBox size={[0.12, 1.0, 0.12]} position={[-WALL_X + 0.42, 0.5, -64.6]} seed={127} />
      <PaperBox size={[0.12, 1.0, 0.12]} position={[-WALL_X + 0.42, 0.5, -67.4]} seed={129} />
      <InkPlane
        kind="envelope"
        size={1.5}
        position={[-WALL_X + 1.25, 1.78, -66]}
        rotation={[0, Math.PI / 2, -0.06]}
        onClick={() => {
          onUnlock('letter-sent');
          onOpenRoom('contact');
        }}
      />
      <InkPlane kind="coffee" size={0.8} position={[-WALL_X + 1.2, 1.4, -64.4]} rotation={[0, Math.PI / 2, 0]} />
      <InkPlane kind="cat" size={1.05} position={[-WALL_X + 1.15, 1.55, -67.6]} rotation={[0, Math.PI / 2, 0]} />
      <SketchLabel
        position={[-WALL_X + 1.6, 2.85, -66]}
        title="Send a letter"
        meta={content.identity.email}
        tone="tape"
      />

      {/* Letters in flight. */}
      <FloatGroup position={[1.4, 2.2, -63]} amplitude={0.26} speed={0.9} phase={0.4}>
        <InkPlane kind="envelope" size={0.75} rotation={[0, 0, -0.2]} />
      </FloatGroup>
      <FloatGroup position={[2.1, 3.1, -68]} amplitude={0.3} speed={0.7} phase={1.6}>
        <InkPlane kind="plane" size={0.85} rotation={[0, 0, 0.3]} />
      </FloatGroup>
    </group>
  );
}