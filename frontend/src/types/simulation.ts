export interface SimulationControlsState {
  isRunning: boolean;
  simSpeed: 0.5 | 1 | 2 | 5;
  activeMissionId: string;
  windSpeed: number; // m/s
  windDirection: number; // deg
  ambientTemp: number; // deg C
}

export type FaultType = 
  // Turbocharger & TCU System
  | 'TURBO_WASTEGATE_STUCK'
  | 'TCU_FAULT'
  | 'TURBO_OVERBOOST'
  | 'TURBO_DEGRADATION'
  // Fuel System & Twin Bing 64 Carburetors
  | 'FUEL_PUMP_1_FAILURE'
  | 'FUEL_PUMP_2_FAILURE'
  | 'CARBURETOR_IMBALANCE'
  | 'FUEL_SYSTEM_LEAK'
  // Dual Electronic Ignition (Ducati CDI)
  | 'IGNITION_A_FAILURE'
  | 'IGNITION_B_FAILURE'
  | 'CYLINDER_MISFIRE'
  // Mixed Cooling System (Liquid Heads + Ram-Air Cylinders)
  | 'ENGINE_OVERHEATING'
  | 'COOLANT_TEMP_RISE'
  | 'REDUCED_COOLANT_FLOW'
  // Dry-Sump Forced Lubrication System
  | 'OIL_PRESSURE_LOSS'
  | 'HIGH_OIL_TEMP'
  | 'OIL_SYSTEM_DEGRADATION'
  // Propeller Reduction Gearbox (2.43:1) & Mechanical
  | 'GEARBOX_VIBRATION'
  | 'GEARBOX_TEMP_INCREASE'
  | 'BEARING_DEGRADATION'
  | 'VIBRATION_ANOMALY'
  // Exhaust System
  | 'EXHAUST_RESTRICTION'
  | 'CYLINDER_EGT_IMBALANCE'
  // Electrical & Generation
  | 'GENERATOR_FAILURE'
  | 'ALTERNATOR_FAILURE';

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
