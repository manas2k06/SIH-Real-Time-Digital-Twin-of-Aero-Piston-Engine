import React from 'react';
import { DroneTelemetryData } from '../../types/telemetry';

interface CoordinateGizmoProps {
  telemetry: DroneTelemetryData | null;
}

export const CoordinateGizmo: React.FC<CoordinateGizmoProps> = ({ telemetry }) => {
  const gridSize = 16;
  const gridDivisions = 16;

  // Heading vector calculations
  const headingRad = telemetry ? (telemetry.attitude.yaw * Math.PI) / 180 : 0;
  const speed = telemetry ? telemetry.movement.groundSpeed : 0;
  const vectorLength = Math.min(3.0, 0.6 + (speed / 20) * 2.0);

  const endX = Math.sin(headingRad) * vectorLength;
  const endZ = -Math.cos(headingRad) * vectorLength;

  return (
    <group>
      {/* Precision Engineering Ground Reference Grid (Subdued aerospace palette) */}
      <gridHelper
        args={[gridSize, gridDivisions, '#263445', '#121822']}
        position={[0, -0.6, 0]}
      />

      {/* Origin Coordinate Datum */}
      <group position={[-6.5, -0.58, 6.5]}>
        {/* X Axis (East) */}
        <mesh position={[0.4, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.015, 0.015, 0.8, 8]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        {/* Y Axis (Altitude) */}
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.8, 8]} />
          <meshBasicMaterial color="#00c0e8" />
        </mesh>
        {/* Z Axis (North) */}
        <mesh position={[0, 0, -0.4]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.8, 8]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* Projected Ground Target Footprint (Precision Reticle) */}
      <group position={[0, -0.59, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.28, 0.3, 32]} />
        <meshBasicMaterial color="#33475d" />
      </group>

      {/* Flight Heading Velocity Vector Arrow */}
      {telemetry && speed > 0.5 && (
        <group position={[0, 0.35, 0]}>
          <mesh position={[endX, 0, endZ]} rotation={[0, -headingRad, 0]}>
            <coneGeometry args={[0.06, 0.16, 8]} />
            <meshBasicMaterial color="#00c0e8" />
          </mesh>
        </group>
      )}
    </group>
  );
};
