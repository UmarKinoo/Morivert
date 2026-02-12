
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TextureType } from '../App';

interface PencilProps {
  sproutProgress: React.MutableRefObject<number>;
  usedProgress: React.MutableRefObject<number>;
  texture: TextureType;
}

// Fix: Use capitalized constants to bypass missing JSX intrinsic types
const Group = 'group' as any;
const Mesh = 'mesh' as any;
const CylinderGeometry = 'cylinderGeometry' as any;
const ConeGeometry = 'coneGeometry' as any;
const SphereGeometry = 'sphereGeometry' as any;
const MeshStandardMaterial = 'meshStandardMaterial' as any;
const MeshPhysicalMaterial = 'meshPhysicalMaterial' as any;
const Primitive = 'primitive' as any;

export const Pencil: React.FC<PencilProps> = ({ sproutProgress, usedProgress, texture }) => {
  const sproutRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const tipRef = useRef<THREE.Group>(null);
  const leadRef = useRef<THREE.Group>(null);

  // Procedural Texture Generation
  const canvasTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const drawMoriPattern = (bg: string, stroke: string, count = 60) => {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 3;
      for (let i = 0; i < count; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 15, y - 25);
        ctx.lineTo(x + 30, y);
        ctx.stroke();
      }
    };

    switch (texture) {
      case 'cedar':
        ctx.fillStyle = '#d4b38d';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#a67c52';
        ctx.lineWidth = 1;
        for (let i = 0; i < 100; i++) {
          ctx.beginPath();
          const x = Math.random() * canvas.width;
          ctx.moveTo(x, 0);
          ctx.bezierCurveTo(x + 20, 300, x - 20, 700, x, 1024);
          ctx.stroke();
        }
        break;
      case 'etched':
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 2;
        for (let i = 0; i < canvas.width; i += 32) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, 1024);
          ctx.stroke();
        }
        break;
      case 'nebula':
        ctx.fillStyle = '#111111';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const nebulaGrad = ctx.createRadialGradient(256, 512, 10, 256, 512, 400);
        nebulaGrad.addColorStop(0, '#1e293b');
        nebulaGrad.addColorStop(1, '#000000');
        ctx.fillStyle = nebulaGrad;
        ctx.fillRect(0, 0, 512, 1024);
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 300; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          ctx.beginPath();
          ctx.arc(x, y, Math.random() * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      case 'prism':
        const colors = ['#f472b6', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa'];
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < 50; i++) {
          ctx.fillStyle = colors[i % colors.length];
          ctx.globalAlpha = 0.5;
          ctx.beginPath();
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          ctx.moveTo(x, y);
          ctx.lineTo(x + 150, y + 75);
          ctx.lineTo(x + 75, y + 150);
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;
        break;
      case 'vibrant':
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const vColors = ['#ffffff', '#3b82f6', '#fbbf24', '#10b981'];
        for (let i = 0; i < 100; i++) {
          ctx.fillStyle = vColors[Math.floor(Math.random() * vColors.length)];
          ctx.beginPath();
          ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 10 + Math.random() * 20, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      case 'mori':
        drawMoriPattern('#064e3b', '#10b981');
        break;
      case 'mori-ruby':
        drawMoriPattern('#450a0a', '#ef4444');
        break;
      case 'mori-azure':
        drawMoriPattern('#1e3a8a', '#60a5fa');
        break;
      case 'mori-gold':
        drawMoriPattern('#1a1a1a', '#fbbf24');
        break;
      case 'aurora':
        const auroraGrad = ctx.createLinearGradient(0, 0, 0, 1024);
        auroraGrad.addColorStop(0, '#4ade80');
        auroraGrad.addColorStop(0.5, '#3b82f6');
        auroraGrad.addColorStop(1, '#a78bfa');
        ctx.fillStyle = auroraGrad;
        ctx.fillRect(0, 0, 512, 1024);
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#ffffff';
        for(let i=0; i<10; i++) {
          ctx.beginPath();
          ctx.ellipse(Math.random()*512, Math.random()*1024, 200, 50, Math.random()*Math.PI, 0, Math.PI*2);
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;
        break;
      case 'iridescent':
        ctx.fillStyle = '#fdf2f8';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for(let i=0; i<15; i++) {
          const g = ctx.createRadialGradient(Math.random()*512, Math.random()*1024, 0, 256, 512, 512);
          g.addColorStop(0, `hsla(${Math.random()*360}, 70%, 80%, 0.4)`);
          g.addColorStop(1, 'transparent');
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, 512, 1024);
        }
        break;
      default:
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, [texture]);

  // Materials
  const woodMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    map: canvasTexture,
    roughness: (texture === 'iridescent' || texture === 'aurora') ? 0.2 : 0.8,
    metalness: (texture === 'mori-gold' || texture === 'prism') ? 0.3 : 0.05,
  }), [canvasTexture, texture]);

  const graphiteMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#444444', // Changed from #1a1a1a to #444444 for visibility on black background
    roughness: 0.3,
    metalness: 0.7,
  }), []);

  const capsuleMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#ffffff',
    transparent: true,
    opacity: 0.3,
    transmission: 0.9,
    thickness: 0.5,
    roughness: 0.1,
  }), []);

  const greenMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#4ade80',
    roughness: 0.5,
  }), []);

  useFrame(() => {
    if (sproutRef.current) {
      const p = sproutProgress.current;
      sproutRef.current.scale.setScalar(p * 0.22);
      sproutRef.current.position.y = 1.35;
      sproutRef.current.rotation.y += 0.01;
    }
    // "Used up" pencil: body shrinks from full to stub, tip and lead disappear
    const u = usedProgress.current;
    if (bodyRef.current) {
      // Body shrinks: scaleY from 1→0.15 (small stub above capsule), moves up to stay attached to capsule
      const bodyScale = THREE.MathUtils.lerp(1, 0.15, u);
      bodyRef.current.scale.set(1, bodyScale, 1);
      bodyRef.current.position.y = THREE.MathUtils.lerp(0, 1.05, u);
    }
    if (tipRef.current) {
      // Tip disappears first (0→0.4 of used progress)
      const tipFade = THREE.MathUtils.smoothstep(u, 0, 0.4);
      tipRef.current.scale.setScalar(1 - tipFade);
    }
    if (leadRef.current) {
      // Lead disappears first (0→0.3 of used progress)
      const leadFade = THREE.MathUtils.smoothstep(u, 0, 0.3);
      leadRef.current.scale.setScalar(1 - leadFade);
    }
  });

  return (
    <Group rotation={[0, 0, 0]}>
      {/* Pencil Body — shrinks when "used up" */}
      <Group ref={bodyRef}>
        <Mesh position={[0, 0, 0]} castShadow>
          <CylinderGeometry args={[0.08, 0.08, 2.5, 6]} />
          <Primitive object={woodMaterial} attach="material" />
        </Mesh>
      </Group>

      {/* The Wood Tip — disappears first when used */}
      <Group ref={tipRef}>
        <Mesh position={[0, -1.45, 0]} castShadow>
          <CylinderGeometry args={[0.08, 0.02, 0.4, 6]} />
          <Primitive object={woodMaterial} attach="material" />
        </Mesh>
      </Group>

      {/* The Lead Point — disappears first when used */}
      <Group ref={leadRef}>
        <Mesh position={[0, -1.7, 0]} rotation={[Math.PI, 0, 0]} castShadow>
          <ConeGeometry args={[0.02, 0.1, 6]} />
          <Primitive object={graphiteMaterial} attach="material" />
        </Mesh>
      </Group>

      {/* Seed Capsule */}
      <Group position={[0, 1.35, 0]}>
        <Mesh castShadow>
          <CylinderGeometry args={[0.081, 0.081, 0.3, 16]} />
          <Primitive object={capsuleMaterial} attach="material" />
        </Mesh>
        
        <Mesh position={[0, -0.05, 0.02]}>
          <SphereGeometry args={[0.015, 8, 8]} />
          <MeshStandardMaterial color="#4a3728" />
        </Mesh>
        <Mesh position={[0.02, 0, -0.02]}>
          <SphereGeometry args={[0.012, 8, 8]} />
          <MeshStandardMaterial color="#3d2b1f" />
        </Mesh>
        <Mesh position={[-0.02, 0.05, 0.01]}>
          <SphereGeometry args={[0.018, 8, 8]} />
          <MeshStandardMaterial color="#5c4033" />
        </Mesh>
      </Group>

      {/* Sprout — small green balls floating inside the capsule */}
      <Group ref={sproutRef} scale={0} position={[0, 1.35, 0]}>
         <Mesh rotation={[0, 0, 0.4]} position={[0.03, 0.01, 0.02]}>
            <SphereGeometry args={[0.04, 8, 8]} />
            <Primitive object={greenMaterial} attach="material" />
         </Mesh>
         <Mesh rotation={[0, 0, -0.4]} position={[-0.03, 0.01, -0.02]}>
            <SphereGeometry args={[0.04, 8, 8]} />
            <Primitive object={greenMaterial} attach="material" />
         </Mesh>
         <Mesh position={[0, -0.02, 0]}>
            <CylinderGeometry args={[0.006, 0.006, 0.06]} />
            <Primitive object={greenMaterial} attach="material" />
         </Mesh>
      </Group>
    </Group>
  );
};
