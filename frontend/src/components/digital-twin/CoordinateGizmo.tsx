import React from 'react';
import { DroneTelemetryData } from '../../types/telemetry';

interface CoordinateGizmoProps {
  telemetry: DroneTelemetryData | null;
}

export const CoordinateGizmo: React.FC<CoordinateGizmoProps> = ({ telemetry }) => {
  const rpm = telemetry?.engine?.operating?.rpm ?? 0;
  const isRunning = rpm > 50;

  return (
    <group position={[0, -0.65, 0]}>
      {/* Precision Engineering Testbed Reference Grid */}
      <gridHelper
        args={[10, 20, '#d18b68', '#4b5563']}
        position={[0, 0, 0]}
      />

      {/* Circular Engine Dyno Mount Turntable Plate */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 1.4, 48]} />
        <meshStandardMaterial
          color="#334155"
          metalness={0.7}
          roughness={0.4}
        />
      </mesh>

      {/* Inner Reticle Ring */}
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.95, 0.98, 48]} />
        <meshBasicMaterial color={isRunning ? '#00c0e8' : '#64748b'} />
      </mesh>

      {/* Radial Alignment Tick Marks */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * Math.PI * 2) / 12;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 1.15, 0.002, Math.sin(angle) * 1.15]}
            rotation={[-Math.PI / 2, 0, angle]}
          >
            <planeGeometry args={[0.015, 0.12]} />
            <meshBasicMaterial color="#94a3b8" />
          </mesh>
        );
      })}

      {/* Reference Coordinate Axes Datum (P = Reference Point per Manual p. 24) */}
      <group position={[-2.2, 0.02, 2.2]}>
        {/* +X Axis (Longitudinal) */}
        <mesh position={[0.3, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.012, 0.012, 0.6, 8]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        {/* +Y Axis (Lateral) */}
        <mesh position={[0, 0, -0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.6, 8]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>
        {/* +Z Axis (Vertical) */}
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.6, 8]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>
    </group>
  );
};
