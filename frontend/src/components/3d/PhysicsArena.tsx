import React, { useState } from 'react';
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier';
import { Text } from '@react-three/drei';

interface PhysicsObject {
  id: number;
  position: [number, number, number];
  color: string;
  type: 'sphere' | 'box';
  size: number;
}

// Sophisticated, realistic architectural material colors
const PALETTE = ['#4e8770', '#84a98c', '#d4a373', '#b8c0c8', '#2d5a47', '#e2e8f0'];

export const PhysicsArena: React.FC<{ active: boolean }> = ({ active }) => {
  const [items, setItems] = useState<PhysicsObject[]>([
    { id: 1, position: [0, 4, 0], color: '#4e8770', type: 'sphere', size: 0.4 },
    { id: 2, position: [-0.5, 6, 0.2], color: '#d4a373', type: 'box', size: 0.5 },
    { id: 3, position: [0.6, 5, -0.1], color: '#b8c0c8', type: 'sphere', size: 0.35 },
    { id: 4, position: [0.2, 7, 0.1], color: '#84a98c', type: 'box', size: 0.45 },
  ]);

  const spawnObject = () => {
    const newItem: PhysicsObject = {
      id: Date.now(),
      position: [
        (Math.random() - 0.5) * 2,
        6 + Math.random() * 2,
        (Math.random() - 0.5) * 1.5,
      ],
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      type: Math.random() > 0.5 ? 'sphere' : 'box',
      size: 0.3 + Math.random() * 0.25,
    };
    setItems((prev) => [...prev.slice(-25), newItem]);
  };

  if (!active) return null;

  return (
    <group position={[0, -2, 0]}>
      <Physics gravity={[0, -9.81, 0]}>
        {/* Invisible Boundary Colliders */}
        <CuboidCollider args={[4, 0.2, 4]} position={[0, -1, 0]} restitution={0.7} />
        <CuboidCollider args={[0.2, 5, 4]} position={[-3, 4, 0]} restitution={0.6} />
        <CuboidCollider args={[0.2, 5, 4]} position={[3, 4, 0]} restitution={0.6} />
        <CuboidCollider args={[4, 5, 0.2]} position={[0, 4, -2]} restitution={0.6} />
        <CuboidCollider args={[4, 5, 0.2]} position={[0, 4, 2]} restitution={0.6} />

        {/* Minimal Floor Slab */}
        <mesh position={[0, -1, 0]} receiveShadow onClick={spawnObject}>
          <boxGeometry args={[6, 0.1, 4]} />
          <meshStandardMaterial
            color="#0d1117"
            roughness={0.6}
            metalness={0.2}
          />
        </mesh>

        <Text
          position={[0, -0.9, 1.2]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.2}
          color="#8a99a8"
          font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxTOlOU.woff"
        >
          [ CLICK FLOOR TO SPAWN RIGID BODIES ]
        </Text>

        {/* Physics Bodies with Realistic Ceramic / Metallic Materials */}
        {items.map((item) => (
          <RigidBody
            key={item.id}
            position={item.position}
            restitution={0.75}
            friction={0.4}
            colliders={item.type === 'sphere' ? 'ball' : 'cuboid'}
          >
            {item.type === 'sphere' ? (
              <mesh castShadow>
                <sphereGeometry args={[item.size, 32, 32]} />
                <meshStandardMaterial
                  color={item.color}
                  metalness={0.3}
                  roughness={0.3}
                />
              </mesh>
            ) : (
              <mesh castShadow>
                <boxGeometry args={[item.size, item.size, item.size]} />
                <meshStandardMaterial
                  color={item.color}
                  metalness={0.5}
                  roughness={0.25}
                />
              </mesh>
            )}
          </RigidBody>
        ))}
      </Physics>
    </group>
  );
};
