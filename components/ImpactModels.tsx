
import React, { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Float } from '@react-three/drei';

interface ImpactModelsProps {
  impact: {
    seeds: number;
    paper: number;
    co2: number;
    trees: number;
    children: number;
  };
}

// Fix: Use capitalized constants to bypass missing JSX intrinsic types
const Group = 'group' as any;
const Mesh = 'mesh' as any;
const CircleGeometry = 'circleGeometry' as any;
const SphereGeometry = 'sphereGeometry' as any;
const CylinderGeometry = 'cylinderGeometry' as any;
const ConeGeometry = 'coneGeometry' as any;
const InstancedMesh = 'instancedMesh' as any;
const MeshStandardMaterial = 'meshStandardMaterial' as any;
const MeshBasicMaterial = 'meshBasicMaterial' as any;

export const ImpactModels: React.FC<ImpactModelsProps> = ({ impact }) => {
  // We cap the visual representation to prevent performance issues while keeping the "immersive" feel
  const MAX_SEEDS = 1000;
  const MAX_TREES = 50;
  const MAX_CHILDREN = 50;

  const seedCount = Math.min(impact.seeds, MAX_SEEDS);
  const treeCount = Math.min(impact.trees, MAX_TREES);
  const childrenCount = Math.min(impact.children, MAX_CHILDREN);

  const seedData = useMemo(() => {
    const data = [];
    for (let i = 0; i < seedCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 2 + Math.random() * 4;
      data.push({
        position: [Math.cos(angle) * radius, 0.05, Math.sin(angle) * radius],
        scale: 0.02 + Math.random() * 0.03,
      });
    }
    return data;
  }, [seedCount]);

  const treeData = useMemo(() => {
    const data = [];
    for (let i = 0; i < treeCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1 + Math.random() * 5;
      data.push({
        position: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius],
        scale: 0.5 + Math.random() * 1,
        rotation: Math.random() * Math.PI,
      });
    }
    return data;
  }, [treeCount]);

  const childrenData = useMemo(() => {
    const data = [];
    for (let i = 0; i < childrenCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.5 + Math.random() * 2.5;
      data.push({
        position: [Math.cos(angle) * radius, 0.2, Math.sin(angle) * radius],
        scale: 0.15,
      });
    }
    return data;
  }, [childrenCount]);

  return (
    <Group>
      {/* Ground Plane */}
      <Mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <CircleGeometry args={[10, 64]} />
        <MeshStandardMaterial color="#080808" roughness={0.8} />
      </Mesh>

      {/* Seeds - Instanced for performance */}
      <InstancedSeeds data={seedData} />

      {/* Trees */}
      {treeData.map((t, i) => (
        <Group key={i} position={t.position as any} rotation={[0, t.rotation, 0]} scale={t.scale}>
           <TreeModel />
        </Group>
      ))}

      {/* Children Visualization */}
      {childrenData.map((c, i) => (
        <Float key={i} speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <Group position={c.position as any} scale={c.scale}>
             <ChildModel />
          </Group>
        </Float>
      ))}

      {/* CO2 Representation - Atmospheric Glow */}
      <Atmosphere co2Level={impact.co2} />
    </Group>
  );
};

const InstancedSeeds = ({ data }: { data: any[] }) => {
  const meshRef = React.useRef<THREE.InstancedMesh>(null);
  const tempObject = new THREE.Object3D();

  useFrame(() => {
    if (meshRef.current) {
      data.forEach((d, i) => {
        tempObject.position.set(d.position[0], d.position[1], d.position[2]);
        tempObject.scale.setScalar(d.scale);
        tempObject.updateMatrix();
        meshRef.current!.setMatrixAt(i, tempObject.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <InstancedMesh ref={meshRef} args={[null as any, null as any, 1000]} castShadow>
      <SphereGeometry args={[1, 8, 8]} />
      <MeshStandardMaterial color="#10b981" emissive="#064e3b" emissiveIntensity={0.5} />
    </InstancedMesh>
  );
};

const TreeModel = () => (
  <Group>
    {/* Trunk */}
    <Mesh position={[0, 0.4, 0]} castShadow>
      <CylinderGeometry args={[0.05, 0.1, 0.8, 8]} />
      <MeshStandardMaterial color="#3d2b1f" />
    </Mesh>
    {/* Leaves */}
    <Mesh position={[0, 1, 0]} castShadow>
      <ConeGeometry args={[0.4, 1.2, 8]} />
      <MeshStandardMaterial color="#065f46" />
    </Mesh>
    <Mesh position={[0, 0.7, 0]} castShadow>
      <ConeGeometry args={[0.5, 1, 8]} />
      <MeshStandardMaterial color="#064e3b" />
    </Mesh>
  </Group>
);

const ChildModel = () => (
  <Group>
    {/* Head */}
    <Mesh position={[0, 0.8, 0]} castShadow>
      <SphereGeometry args={[0.3, 16, 16]} />
      <MeshStandardMaterial color="#fbbf24" />
    </Mesh>
    {/* Body */}
    <Mesh position={[0, 0, 0]} castShadow>
      <CylinderGeometry args={[0.2, 0.4, 1, 16]} />
      <MeshStandardMaterial color="#d97706" />
    </Mesh>
  </Group>
);

const Atmosphere = ({ co2Level }: { co2Level: number }) => {
  const intensity = Math.min(co2Level / 5000, 1.5);
  return (
    <Mesh position={[0, 2, 0]}>
      <SphereGeometry args={[12, 32, 32]} />
      <MeshBasicMaterial 
        color="#60a5fa" 
        transparent 
        opacity={0.03 * intensity} 
        side={THREE.BackSide} 
      />
    </Mesh>
  );
};
