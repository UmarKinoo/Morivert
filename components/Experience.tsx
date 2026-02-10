
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Pencil } from './Pencil';
import { TextureType } from '../App';

interface ExperienceProps {
  texture: TextureType;
}

// Fix: Use capitalized constants to bypass missing JSX intrinsic types
const Group = 'group' as any;
const Mesh = 'mesh' as any;
const PlaneGeometry = 'planeGeometry' as any;
const ShadowMaterial = 'shadowMaterial' as any;

export const Experience: React.FC<ExperienceProps> = ({ texture }) => {
  const scroll = useScroll();
  const pencilRef = useRef<THREE.Group>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  // Growth animation state
  const sproutState = useRef(0);

  useFrame(() => {
    const offset = scroll.offset; // 0 to 1

    if (pencilRef.current) {
      // Scale scroll offsets based on 9 pages
      
      // SECTION 0 -> 0.15: Intro
      const s1 = THREE.MathUtils.smoothstep(offset, 0, 0.1);
      pencilRef.current.position.y = THREE.MathUtils.lerp(0.5, 0, s1);
      pencilRef.current.rotation.z = THREE.MathUtils.lerp(Math.PI * 0.15, 0, s1);
      pencilRef.current.rotation.y = THREE.MathUtils.lerp(0, Math.PI * 4, offset);

      // SECTION: Bold Statement / Awards (Floating movement)
      const s2 = THREE.MathUtils.smoothstep(offset, 0.1, 0.3);
      const camX = THREE.MathUtils.lerp(0, -1, s2);
      const camY = THREE.MathUtils.lerp(0, 0.2, s2);
      const camZ = THREE.MathUtils.lerp(5, 4, s2);
      
      // SECTION: Capsule Close-up (around offset 0.4)
      const s3 = THREE.MathUtils.smoothstep(offset, 0.3, 0.5);
      const camX3 = THREE.MathUtils.lerp(camX, 0.6, s3);
      const camY3 = THREE.MathUtils.lerp(camY, 1.4, s3);
      const camZ3 = THREE.MathUtils.lerp(camZ, 2.2, s3);
      
      // SECTION: Patterns / Selection (around offset 0.6)
      const s4 = THREE.MathUtils.smoothstep(offset, 0.5, 0.7);
      const camX4 = THREE.MathUtils.lerp(camX3, -0.8, s4);
      const camY4 = THREE.MathUtils.lerp(camY3, 0, s4);
      const camZ4 = THREE.MathUtils.lerp(camZ3, 3.5, s4);

      // SECTION: Planting orientation (around offset 0.8)
      const s5 = THREE.MathUtils.smoothstep(offset, 0.7, 0.85);
      pencilRef.current.rotation.x = THREE.MathUtils.lerp(0, Math.PI, s5);
      
      const camY5 = THREE.MathUtils.lerp(camY4, -1.2, s5);
      const camZ5 = THREE.MathUtils.lerp(camZ4, 4.5, s5);

      // SECTION: Growth phase (Final stretch)
      const s6 = THREE.MathUtils.smoothstep(offset, 0.85, 1.0);
      sproutState.current = s6;
      pencilRef.current.position.y = THREE.MathUtils.lerp(0, -1.5, s6);

      if (cameraRef.current) {
        cameraRef.current.position.x = THREE.MathUtils.lerp(camX, camX4, offset);
        cameraRef.current.position.y = camY5;
        cameraRef.current.position.z = camZ5;
        cameraRef.current.lookAt(0, pencilRef.current.position.y, 0);
      }
    }
  });

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault fov={35} position={[0, 0, 5]} />
      
      {/* Fix: Using capitalized Group constant */}
      <Group ref={pencilRef}>
        <Pencil sproutProgress={sproutState} texture={texture} />
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
