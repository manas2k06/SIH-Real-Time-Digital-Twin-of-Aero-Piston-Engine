import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sparkles, MeshDistortMaterial, Trail } from '@react-three/drei';
import * as THREE from 'three';

interface HeroCoreProps {
  scrollProgress: number;
}

export const HeroCore: React.FC<HeroCoreProps> = ({ scrollProgress }) => {
  const outerRingRef = useRef<THREE.Mesh>(null!);
  const midRingRef = useRef<THREE.Mesh>(null!);
  const innerCoreRef = useRef<THREE.Mesh>(null!);
  const groupRef = useRef<THREE.Group>(null!);

  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Responsive mouse parallax
    const targetX = (state.mouse.x * 1.5);
    const targetY = (state.mouse.y * 1.5);
    
    // Smooth interpolation with delta
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetX + time * 0.15 + scrollProgress * Math.PI * 2,
      0.05
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      -targetY * 0.5 + Math.sin(time * 0.5) * 0.2,
      0.05
    );

    // Dynamic scale and position shifts linked to scroll
    const scrollScale = Math.max(0.6, 1.2 - scrollProgress * 0.6);
    groupRef.current.scale.setScalar(scrollScale * (hovered ? 1.15 : 1.0));

    // Shift sideways in 3D space during scroll
    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      scrollProgress > 0.1 ? 2.2 : 0,
      0.05
    );

    // Multi-axis rotation of cyber rings
    if (outerRingRef.current) {
      outerRingRef.current.rotation.x += delta * 0.4;
      outerRingRef.current.rotation.y += delta * 0.6;
    }
    if (midRingRef.current) {
      midRingRef.current.rotation.y -= delta * 0.8;
      midRingRef.current.rotation.z += delta * 0.5;
    }
    if (innerCoreRef.current) {
      innerCoreRef.current.rotation.y += delta * 1.2;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Dynamic ambient particles */}
      <Sparkles
        count={120}
        scale={8}
        size={3.5}
        speed={0.4}
        color={hovered ? "#00ffcc" : "#00ff88"}
      />

      <Float speed={2.5} rotationIntensity={1.2} floatIntensity={1.8}>
        {/* Outer Cyber Gyroscope Ring */}
        <mesh
          ref={outerRingRef}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={() => setClicked(!clicked)}
        >
          <torusGeometry args={[2.0, 0.04, 16, 100]} />
          <meshStandardMaterial
            color="#00ff88"
            emissive="#00ff88"
            emissiveIntensity={hovered ? 2.5 : 1.2}
            roughness={0.1}
            metalness={0.9}
            wireframe
          />
        </mesh>

        {/* Middle Angular Gyroscope Ring */}
        <mesh ref={midRingRef}>
          <torusGeometry args={[1.5, 0.06, 16, 60]} />
          <meshStandardMaterial
            color="#14b8a6"
            emissive="#10b981"
            emissiveIntensity={1.0}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>

        {/* Inner Pulsing AI Energy Core */}
        <Trail
          width={hovered ? 4 : 2}
          length={6}
          color={new THREE.Color("#00ff88")}
          attenuation={(t) => t * t}
        >
          <mesh
            ref={innerCoreRef}
            scale={clicked ? 1.3 : 1.0}
          >
            <icosahedronGeometry args={[0.85, 2]} />
            <MeshDistortMaterial
              color={hovered ? "#34d399" : "#059669"}
              emissive={hovered ? "#00ff88" : "#047857"}
              emissiveIntensity={hovered ? 2.0 : 0.8}
              roughness={0.1}
              metalness={0.7}
              distort={hovered ? 0.6 : 0.35}
              speed={3}
            />
          </mesh>
        </Trail>

        {/* Satellite Floating Data Nodes */}
        {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((angle, idx) => (
          <mesh
            key={idx}
            position={[
              Math.cos(angle) * 2.5,
              Math.sin(angle) * 0.8,
              Math.sin(angle) * 1.5,
            ]}
          >
            <octahedronGeometry args={[0.15]} />
            <meshStandardMaterial
              color="#a7f3d0"
              emissive="#00ff88"
              emissiveIntensity={2.0}
            />
          </mesh>
        ))}
      </Float>
    </group>
  );
};
