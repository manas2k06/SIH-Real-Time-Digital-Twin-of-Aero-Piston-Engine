export interface SimulationControlsState {
  isRunning: boolean;
  simSpeed: 0.5 | 1 | 2 | 5;
  activeMissionId: string;
  windSpeed: number; // m/s
  windDirection: number; // deg
  ambientTemp: number; // deg C
}

export type FaultType = 
  | 'MOTOR_1_FAILURE'
  | 'MOTOR_3_DEGRADATION'
  | 'BATTERY_SAG'
  | 'GPS_SIGNAL_LOSS'
  | 'SEVERE_WIND_SHEAR'
  | 'BAROMETER_DRIFT'
  | 'IMU_SENSOR_NOISE'
  | 'ENGINE_OVERHEATING'
  | 'OIL_PRESSURE_LOSS'
  | 'VIBRATION_ANOMALY'
  | 'FUEL_SYSTEM_LEAK'
  | 'TURBO_WASTEGATE_STUCK'
  | 'CYLINDER_MISFIRE';

export interface ActiveFault {
  id: string;
  type: FaultType;
  severity: number; // 0.0 - 1.0
  injectedAt: number;
  label: string;
  description: string;
}

export interface EventLogEntry {
  id: string;
  timestamp: string;
  isoTime: number;
  level: 'INFO' | 'WARN' | 'CRITICAL';
  source: 'FLIGHT_CONTROLLER' | 'NAVIGATION' | 'PROPULSION' | 'BATTERY_BMS' | 'AI_ANOMALY' | 'ENVIRONMENT' | 'FAULT_ENGINE';
  message: string;
}

export interface SyncStatus {
  telemetryStatus: 'LIVE' | 'STANDBY' | 'REPLAY';
  simulationStatus: 'RUNNING' | 'PAUSED' | 'STEPPING';
  synchronizationStatus: 'SYNCED' | 'DRIFT_DETECTED' | 'RESYNCING';
  updateRateHz: number;
  latencyMs: number;
  packetLossPercent: number;
  frameDropCount: number;
  isSimulatedSource: boolean;
}
