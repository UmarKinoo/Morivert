
import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useScroll, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Pencil } from './Pencil';
import { TextureType } from '../App';

interface ExperienceProps {
  texture: TextureType;
  isMobile?: boolean;
}

const MOBILE_BREAKPOINT = 768;

// Fix: Use capitalized constants to bypass missing JSX intrinsic types
const Group = 'group' as any;
const Mesh = 'mesh' as any;
const PlaneGeometry = 'planeGeometry' as any;
const ShadowMaterial = 'shadowMaterial' as any;

// Reusable quaternions (allocated once, reused every frame)
const _qTilt = new THREE.Quaternion();
const _qSpin = new THREE.Quaternion();
const _chromaticTilt = new THREE.Quaternion();
const _chromaticSpin = new THREE.Quaternion();
const _yAxis = new THREE.Vector3(0, 1, 0); // pencil long axis is Y in local space
const _euler = new THREE.Euler();

export const Experience: React.FC<ExperienceProps> = ({ texture, isMobile: isMobileProp }) => {
  const scroll = useScroll();
  const { size } = useThree();
  const pencilRef = useRef<THREE.Group>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  const isMobile = isMobileProp ?? size.width < MOBILE_BREAKPOINT;
  const pencilScale = isMobile ? 0.72 : 1;
  const heroOffsetX = isMobile ? 0.35 : 0.9;

  // Growth animation state
  const sproutState = useRef(0);
  const usedState = useRef(0);
  const spinAngle = useRef(0);
  const chromaticSpinAngle = useRef(0);
  const chromaticQuatRef = useRef(new THREE.Quaternion());

  useFrame((_, delta) => {
    const offset = scroll.offset; // 0 to 1

    if (pencilRef.current) {
      pencilRef.current.scale.setScalar(pencilScale);

      // Scale scroll offsets based on 9 pages
      
      // SECTION 0 -> 0.15: Intro — strong diagonal tilt like a pen resting on paper
      const s1 = THREE.MathUtils.smoothstep(offset, 0, 0.12);
      const introRotZ = THREE.MathUtils.lerp(-Math.PI * 0.2, 0, s1);   // ~36° diagonal, tip lower-right
      const introRotX = THREE.MathUtils.lerp(Math.PI * 0.08, 0, s1);   // slight forward lean
      pencilRef.current.position.y = THREE.MathUtils.lerp(0.3, 0, s1);
      pencilRef.current.position.x = THREE.MathUtils.lerp(heroOffsetX, 0, s1);

      // Hero spin: slow continuous rotation around the pencil's own tilted axis
      // Fades from full spin in the hero to the scroll-driven Y rotation further down
      const heroBlend = 1 - THREE.MathUtils.smoothstep(offset, 0, 0.12);
      spinAngle.current += delta * 0.4; // slow elegant spin speed
      chromaticSpinAngle.current += delta * 0.8; // smooth spin for Chromatic Life section

      // Scroll-driven Y rotation for the rest of the page
      const scrollRotY = THREE.MathUtils.lerp(0, Math.PI * 4, offset);

      // SECTION: Bold Statement / Awards (Floating movement)
      const s2 = THREE.MathUtils.smoothstep(offset, 0.1, 0.3);
      const camX = THREE.MathUtils.lerp(0, -1, s2);
      const camY = THREE.MathUtils.lerp(0, 0.2, s2);
      const camZ = THREE.MathUtils.lerp(5, 4, s2);
      
      // SECTION: Capsule Close-up — active when "A Living Capsule" section is at top 0 (start earlier)
      const s3 = THREE.MathUtils.smoothstep(offset, 0.22, 0.48);
      const camX3 = THREE.MathUtils.lerp(camX, 0.6, s3);
      const camY3 = THREE.MathUtils.lerp(camY, 1.4, s3);
      const camZ3 = THREE.MathUtils.lerp(camZ, 2.2, s3);
      
      // SECTION: Chromatic Life — horizontal pencil in right-side negative space next to text
      // Camera shifts left so pencil appears on the right, raised to align with the heading
      const s4 = THREE.MathUtils.smoothstep(offset, 0.48, 0.58);
      const camX4 = THREE.MathUtils.lerp(camX3, -1.8, s4);
      const camY4 = THREE.MathUtils.lerp(camY3, 0.35, s4);
      const camZ4 = THREE.MathUtils.lerp(camZ3, 5, s4);

      // SECTION: Planting orientation — starts earlier so pencil begins moving ~20% into chromatic
      const s5 = THREE.MathUtils.smoothstep(offset, 0.58, 0.78);
      const plantingRotX = THREE.MathUtils.lerp(introRotX, Math.PI, s5);
      
      const camY5 = THREE.MathUtils.lerp(camY4, -1.2, s5);
      const camZ5 = THREE.MathUtils.lerp(camZ4, 4.5, s5);
      // Staged X so camera actually holds on capsule close-up (camX3) then moves to pattern view (camX4)
      const camXStaged = THREE.MathUtils.lerp(THREE.MathUtils.lerp(camX, camX3, s3), camX4, s4);

      // SECTION: Footer approach — pencil becomes "used up" and sinks behind footer
      // Used-up animation: body shrinks, tip/lead vanish, only capsule remains
      // Start later on mobile (more sections per scroll) to keep planting pose longer
      const usedStart = isMobile ? 0.85 : 0.82;
      const sUsed = THREE.MathUtils.smoothstep(offset, usedStart, 0.97);
      usedState.current = sUsed;
      sproutState.current = THREE.MathUtils.smoothstep(offset, 0.94, 1.0);

      // Sink down behind the footer — less distance needed since the pencil is shrinking too
      pencilRef.current.position.y = THREE.MathUtils.lerp(0, -1.8, sUsed);

      // Keep planting orientation all the way to footer — no diagonal override
      const finalRotX = plantingRotX;
      const finalRotZ = introRotZ;

      // Build rotation: tilt first, then spin around the pencil's local Y axis
      _euler.set(finalRotX, scrollRotY, finalRotZ);
      _qTilt.setFromEuler(_euler);
      _qSpin.setFromAxisAngle(_yAxis, spinAngle.current);

      // Chromatic Life: pencil horizontal with gentle tilt — tip pointing slightly down-right
      _euler.set(Math.PI * 0.05, 0, Math.PI * 0.45);
      _chromaticTilt.setFromEuler(_euler);
      _chromaticSpin.setFromAxisAngle(_yAxis, chromaticSpinAngle.current);
      _chromaticTilt.multiply(_chromaticSpin);
      chromaticQuatRef.current.copy(_chromaticTilt);

      // Chromatic blend: ramp in 0.48→0.55, hold, then fade out as planting section (s5) takes over
      const chromaticIn = THREE.MathUtils.smoothstep(offset, 0.48, 0.55);
      const chromaticBlend = chromaticIn * (1 - s5);

      // Blend: hero = tilt+local spin; Chromatic Life = horizontal+fast spin; else = scroll rotation
      if (heroBlend > 0.001) {
        const heroTiltEuler = _euler.set(introRotX, 0, introRotZ);
        const heroQuat = _qTilt.setFromEuler(heroTiltEuler);
        heroQuat.multiply(_qSpin.setFromAxisAngle(_yAxis, spinAngle.current));
        const scrollEuler = _euler.set(finalRotX, scrollRotY, finalRotZ);
        const scrollQuat = _qSpin.setFromEuler(scrollEuler);
        pencilRef.current.quaternion.copy(heroQuat).slerp(scrollQuat, 1 - heroBlend);
      } else if (chromaticBlend > 0.001) {
        const scrollEuler = _euler.set(finalRotX, scrollRotY, finalRotZ);
        const scrollQuat = _qSpin.setFromEuler(scrollEuler);
        pencilRef.current.quaternion.copy(scrollQuat).slerp(chromaticQuatRef.current, chromaticBlend);
      } else {
        pencilRef.current.rotation.set(finalRotX, scrollRotY, finalRotZ);
      }

      if (cameraRef.current) {
        cameraRef.current.position.x = camXStaged;
        cameraRef.current.position.y = camY5;
        cameraRef.current.position.z = camZ5;
        // Capsule section (s3): look at capsule top; Chromatic Life (s4): return to pencil center
        const capsuleY = 1.35;
        const capsuleLookAt = THREE.MathUtils.lerp(pencilRef.current.position.y, capsuleY + 0.35, s3);
        const lookAtY = THREE.MathUtils.lerp(capsuleLookAt, pencilRef.current.position.y, s4);
        cameraRef.current.lookAt(0, lookAtY, 0);
      }
    }
  });

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault fov={35} position={[0, 0, 5]} />
      
      {/* Fix: Using capitalized Group constant */}
      <Group ref={pencilRef}>
        <Pencil sproutProgress={sproutState} usedProgress={usedState} texture={texture} isMobile={isMobile} />
      </Group>

      {/* Ground plane for shadows */}
      {/* Fix: Using capitalized Mesh constant */}
      <Mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.8, 0]} receiveShadow>
        <PlaneGeometry args={[30, 30]} />
        <ShadowMaterial opacity={0.3} />
      </Mesh>
    </>
  );
};
