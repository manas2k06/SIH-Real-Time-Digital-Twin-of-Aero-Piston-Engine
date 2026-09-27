import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

interface CinematicSpecimenProps {
  scrollProgress: number;
}

export const CinematicSpecimen: React.FC<CinematicSpecimenProps> = ({ scrollProgress }) => {
  const rootGroupRef = useRef<THREE.Group>(null!);
  const innerCoreRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const secondaryRingRef = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Natural camera parallax with smooth damping
    const targetX = state.mouse.x * 0.8;
    const targetY = state.mouse.y * 0.5;

    rootGroupRef.current.rotation.y = THREE.MathUtils.lerp(
      rootGroupRef.current.rotation.y,
      targetX + time * 0.08 + scrollProgress * Math.PI * 1.5,
      0.04
    );
    rootGroupRef.current.rotation.x = THREE.MathUtils.lerp(
      rootGroupRef.current.rotation.x,
      -targetY * 0.3 + Math.sin(time * 0.4) * 0.08,
      0.04
    );

    // Realistic scroll transformation: smoothly docks to the right side
    const targetPosX = THREE.MathUtils.lerp(0, 1.8, Math.min(1, scrollProgress * 2.2));
    const targetPosZ = THREE.MathUtils.lerp(0, -0.5, scrollProgress);
    const targetScale = THREE.MathUtils.lerp(1.15, 0.95, scrollProgress);

    rootGroupRef.current.position.x = THREE.MathUtils.lerp(rootGroupRef.current.position.x, targetPosX, 0.05);
    rootGroupRef.current.position.z = THREE.MathUtils.lerp(rootGroupRef.current.position.z, targetPosZ, 0.05);
    rootGroupRef.current.scale.setScalar(targetScale);

    // Subtle mechanical / physical rotations
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.15;
    }
    if (secondaryRingRef.current) {
      secondaryRingRef.current.rotation.x += delta * 0.12;
      secondaryRingRef.current.rotation.y += delta * 0.18;
    }
    if (innerCoreRef.current) {
      innerCoreRef.current.rotation.y += delta * 0.25;
    }
  });

  return (
    <group ref={rootGroupRef} position={[0, 0, 0]}>
      <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.6}>
        {/* Outer Brushed Titanium Precision Ring */}
        <mesh ref={ringRef}>
          <torusGeometry args={[2.1, 0.035, 32, 120]} />
          <meshStandardMaterial
            color="#b8c0c8"
            metalness={0.92}
            roughness={0.22}
            envMapIntensity={1.2}
          />
        </mesh>

        {/* Secondary Warm Brass Latitude Ring */}
        <mesh ref={secondaryRingRef} rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[1.75, 0.025, 24, 90]} />
          <meshStandardMaterial
            color="#c99f68"
            metalness={0.88}
            roughness={0.28}
            envMapIntensity={1.0}
          />
        </mesh>

        {/* Glass Biosphere Enclosure with PBR Physical Transmission */}
        <mesh>
          <sphereGeometry args={[1.25, 48, 48]} />
          <meshPhysicalMaterial
            color="#eef3f0"
            transmission={0.92}
            opacity={1}
            transparent={true}
            roughness={0.08}
            ior={1.45}
            thickness={0.8}
            specularIntensity={1.0}
            envMapIntensity={1.5}
          />
        </mesh>

        {/* Inner Organic Core: Seed / Crystalline Specimen */}
        <mesh ref={innerCoreRef}>
          <dodecahedronGeometry args={[0.65, 1]} />
          <meshStandardMaterial
            color="#4e8770"
            roughness={0.45}
            metalness={0.15}
            flatShading={true}
          />
        </mesh>

        {/* Subtle Botanical Leaf Elements */}
        {[0, 1, 2, 3].map((i) => {
          const angle = (i * Math.PI) / 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * 0.45, Math.sin(i * 1.2) * 0.25, Math.sin(angle) * 0.45]}
              rotation={[0.3, angle, 0.4]}
            >
              <coneGeometry args={[0.12, 0.5, 5]} />
              <meshStandardMaterial
                color="#84a98c"
                roughness={0.55}
                metalness={0.1}
              />
            </mesh>
          );
        })}
      </Float>
    </group>
  );
};
