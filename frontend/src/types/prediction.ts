export interface LSTMPredictionHorizon {
  horizonSeconds: number; // e.g. 10s, 30s, 60s
  predictedAltitude: number; // m
  predictedSpeed: number; // m/s
  predictedBatteryPercent: number; // %
  predictedPosition: {
    x: number;
    y: number;
    z: number;
  };
  uncertaintyBound: {
    altitudeMin: number;
    altitudeMax: number;
    speedMin: number;
    speedMax: number;
  };
}

export interface LSTMPredictionState {
  modelName: 'LSTM-Seq2Seq-v2.4';
  inferenceLatencyMs: number;
  lastUpdated: number;
  predictionSteps: LSTMPredictionHorizon[];
  trajectoryPolyline: Array<{ x: number; y: number; z: number }>;
}

export type AnomalySeverity = 'NORMAL' | 'LOW_RISK' | 'WARNING' | 'CRITICAL';

export interface AnomalySubsystemStatus {
  subsystem: 
    | 'Motor Propulsion' 
    | 'Battery System' 
    | 'Thermal Dynamics' 
    | 'Vibration / Aero' 
    | 'Sensor Integrity' 
    | 'Flight Stability'
    | 'Thermodynamic Core'
    | 'Lubrication System'
    | 'Fuel Injection'
    | 'Turbo Induction'
    | 'Aero-Piston Engine Core';
  severity: AnomalySeverity;
  score: number; // 0.0 to 1.0
  description: string;
  contributingFeatures: Array<{
    feature: string;
    importance: number;
    actualValue: string;
    expectedRange: string;
  }>;
}

export interface XGBoostAnomalyState {
  modelName: 'XGBoost-Ensemble-Classifier-v1.8';
  overallHealthScore: number; // 0-100 (100 is nominal)
  anomalyDetected: boolean;
  activeRiskLevel: AnomalySeverity;
  inferenceLatencyMs: number;
  lastEvaluated: number;
  subsystems: AnomalySubsystemStatus[];
}

export type RULStatus = 'NOMINAL' | 'MONITOR' | 'DEGRADED' | 'CRITICAL';
export type RULTrend = 'STABLE' | 'DEGRADING' | 'ACCELERATING';

export interface ComponentRUL {
  id: string;
  name: string;
  subsystem: 'Battery' | 'Propulsion' | 'ESC' | 'Avionics' | 'Engine Core' | 'Turbocharger' | 'Lubrication Pump' | 'Alternator';
  rulValue: number; // in hours or cycles
  rulUnit: 'hours' | 'cycles' | 'percentage';
  nominalLife: number; // total expected design life
  healthPercent: number; // 0-100%
  status: RULStatus;
  degradationRate: number; // multiplier or % / 100h
  trend: RULTrend;
  sparkline: number[]; // 8-point historical degradation array
  stressFactor: string;
  lastMaintenanceHoursAgo: number;
  isSimulatedPrediction?: boolean;
}

export interface AirworthinessState {
  fleetAirworthinessScore: number; // 0-100
  criticalPathComponentId: string;
  criticalPathRemainingHours: number;
  criticalPathName: string;
  nextScheduledMaintenanceHours: number;
  components: ComponentRUL[];
}

export interface AIPredictionState {
  lstm: LSTMPredictionState;
  xgboost: XGBoostAnomalyState;
  rul: AirworthinessState;
}

