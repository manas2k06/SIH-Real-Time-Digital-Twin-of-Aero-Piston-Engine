import React from 'react';
import { DroneTelemetryData } from '../../types/telemetry';
import { RotaxEngineModel3D, RotaxEngineModel3DProps } from './RotaxEngineModel3D';

export interface DroneModel3DProps {
  telemetry: DroneTelemetryData | null;
  showPropeller?: boolean;
  showHotspots?: boolean;
  showHeatmap?: boolean;
  selectedComponent?: string | null;
  onSelectComponent?: (componentName: string | null) => void;
}

/**
 * Rotax 914 Turbo Aero-Piston Engine 3D Model
 * Replaces legacy quadcopter drone model with the SIH26054 Rotax 914 4-cylinder boxer powerplant.
 */
export const DroneModel3D: React.FC<DroneModel3DProps> = (props) => {
  return <RotaxEngineModel3D {...props} />;
};

export { RotaxEngineModel3D };
export type { RotaxEngineModel3DProps };
