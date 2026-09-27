import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { CinematicSpecimen } from './CinematicSpecimen';
import { PhysicsArena } from './PhysicsArena';

interface SceneManagerProps {
  scrollProgress: number;
  activeTab: 'specimen' | 'physics';
}

export const SceneManager: React.FC<SceneManagerProps> = ({
  scrollProgress,
  activeTab,
}) => {
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-auto z-0">
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 42 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        shadows
      >
        <Suspense fallback={null}>
          {/* Natural Studio Key & Fill Lighting */}
          <ambientLight intensity={0.65} color="#eef2f5" />
          <directionalLight
            position={[4, 6, 4]}
            intensity={1.8}
            castShadow
            shadow-mapSize={2048}
            shadow-bias={-0.0001}
            color="#fff8f0"
          />
          <directionalLight
            position={[-4, 3, -2]}
            intensity={0.7}
            color="#d8e8f0"
          />

          {/* Neutral High-End Studio Reflections */}
          <Environment preset="studio" />

          {/* Natural Charcoal Contact Shadows */}
          <ContactShadows
            position={[0, -2.2, 0]}
            opacity={0.45}
            scale={10}
            blur={2.0}
            far={4.0}
            color="#080a0f"
          />

          {/* 3D Scene Content */}
          {activeTab === 'specimen' ? (
            <CinematicSpecimen scrollProgress={scrollProgress} />
          ) : (
            <PhysicsArena active={true} />
          )}

          {/* Restrained Camera Controls */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            maxPolarAngle={Math.PI / 1.75}
            minPolarAngle={Math.PI / 2.8}
            rotateSpeed={0.5}
            dampingFactor={0.05}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};
