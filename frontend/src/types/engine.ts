// ============================================================================
// AEROTWIN AI — AERO-PISTON ENGINE DATA MODEL (SIH26054 / ROTAX 914F)
// ============================================================================

export type EngineStatus = 'NOMINAL' | 'CAUTION' | 'CRITICAL' | 'OFFLINE';
export type IgnitionState = 'ACTIVE' | 'DEGRADED' | 'OFF';
export type FuelSystemStatus = 'NOMINAL' | 'PRESSURE_DROP' | 'CLOGGED_FILTER' | 'LEAK_DETECTED';
export type CoolingSystemStatus = 'NOMINAL' | 'OVERHEAT' | 'LEAK_DETECTED' | 'FLOW_RESTRICTION';
export type RULHealthState = 'NOMINAL' | 'MONITOR' | 'ACTION_REQUIRED';
export type RULTrendDirection = 'STABLE' | 'DEGRADING' | 'ACCELERATING';

// 1. ENGINE OPERATING PARAMETERS
export interface EngineOperatingParameters {
  rpm: number; // Engine rotational speed (RPM)
  targetRpm: number; // Commanded target speed (RPM)
  rpmError: number; // Target - Actual RPM
  throttlePosition: number; // 0 - 100%
  engineLoad: number; // 0 - 100%
  torque: number; // Engine torque (Nm)
  powerKw: number; // Power output (kW)
  powerHp: number; // Power output (HP)
  fuelFlowRate: number; // Fuel consumption rate (L/h)
  fuelPressure: number; // Fuel rail pressure (bar)
  airFuelRatio: number; // Air/Fuel Ratio (e.g., 14.7)
  lambda: number; // Stoichiometric ratio (e.g., 1.01)
  map: number; // Manifold Absolute Pressure (inHg)
  iat: number; // Intake Air Temperature (°C)
  ambientPressure: number; // Ambient atmospheric pressure (hPa)
  ambientTemperature: number; // Ambient outside temperature (°C)
}

// 2. COMBUSTION PARAMETERS (Per-cylinder CHT & EGT for 4-Cylinder Boxer Engine)
export interface CylinderCombustionData {
  cylinders: [number, number, number, number]; // [Cyl 1, Cyl 2, Cyl 3, Cyl 4]
  average: number; // Mean temperature across cylinders (°C)
  maxDeviation: number; // Peak difference between highest and lowest cylinder (°C)
  deviations: [number, number, number, number]; // Cylinder temp minus average (°C)
  trend: number; // Rate of change (°C/min)
}

export interface EngineCombustionParameters {
  cht: CylinderCombustionData; // Cylinder Head Temperature (°C)
  egt: CylinderCombustionData; // Exhaust Gas Temperature (°C)
  exhaustTemperature: number; // Post-turbo tailpipe temperature (°C)
  intakeAirTemperature: number; // Post-intercooler charge temperature (°C)
  combustionStatus: 'NOMINAL' | 'KNOCK_DETECTED' | 'LEAN_MISFIRE' | 'RICH';
}

// 3. LUBRICATION SYSTEM
export interface EngineLubricationParameters {
  oilPressure: number; // Lubrication pressure (bar, nominal 2.0 - 5.0 bar)
  oilTemperature: number; // Oil temperature (°C, limit: 130°C)
  oilLevel: number; // Oil reservoir level (%)
  oilFlowRate: number; // Scavenge pump oil flow rate (L/min)
  oilPressureTrend: number; // Rate of pressure change (bar/min)
  oilTemperatureTrend: number; // Rate of temperature change (°C/min)
  oilPressureDeviation: number; // Expected - Actual oil pressure (bar)
  status: 'OPTIMAL' | 'DEGRADED' | 'LOW_PRESSURE' | 'HIGH_TEMP';
}

// 4. FUEL SYSTEM
export interface EngineFuelParameters {
  fuelFlow: number; // Current consumption rate (L/h)
  fuelPressure: number; // Supply fuel pressure (bar, nominal 3.0 bar)
  fuelTemperature: number; // Fuel line temperature (°C)
  fuelQuantity: number; // Available fuel volume (L)
  fuelRemainingPercent: number; // Tank state of charge (%)
  fuelConsumption: number; // Cumulative mission consumption (L)
  fuelConsumptionTrend: number; // Rate of change in fuel flow (L/h/min)
  injectionTiming: number; // Crank angle timing (° BTDC, e.g., 26.0°)
  injectionDuration: number; // Solenoid pulse width (ms, e.g., 4.8 ms)
  status: FuelSystemStatus;
}

// 5. AIR INTAKE SYSTEM (Turbocharged Induction Loop)
export interface EngineIntakeParameters {
  map: number; // Manifold Absolute Pressure (inHg)
  mapBar: number; // Manifold Absolute Pressure (bar)
  intakeAirTemperature: number; // Charge air temperature (°C)
  intakeAirPressure: number; // Pre-compressor intake pressure (bar)
  airMassFlow: number; // Mass airflow into plenum (kg/h)
  throttlePosition: number; // Throttle plate opening (%)
  pressureDifferential: number; // Turbo boost pressure over ambient (bar)
  wastegatePosition: number; // Electronic turbo wastegate opening (0-100%)
}

// 6. IGNITION SYSTEM (Rotax 914F Dual Capacitor Discharge Ignition)
export interface EngineIgnitionParameters {
  ignitionTiming: number; // Base ignition timing (° BTDC)
  ignitionAdvance: number; // Dynamic ECU ignition advance (°)
  sparkPlugStatus: {
    circuitA: ['OK' | 'FAULT', 'OK' | 'FAULT', 'OK' | 'FAULT', 'OK' | 'FAULT'];
    circuitB: ['OK' | 'FAULT', 'OK' | 'FAULT', 'OK' | 'FAULT', 'OK' | 'FAULT'];
  };
  ignitionVoltage: number; // Primary excitation voltage (V)
  primaryIgnitionState: IgnitionState; // Circuit A state
  secondaryIgnitionState: IgnitionState; // Circuit B state
  misfireCount: number; // Misfire count per 1,000 engine cycles
  misfireDetected: boolean;
}

// 7. MECHANICAL PARAMETERS
export interface ComponentHealthStatus {
  crankshaft: number; // Health % (0 - 100%)
  bearings: number; // Health % (0 - 100%)
  pistons: number; // Health % (0 - 100%)
  valvetrain: number; // Health % (0 - 100%)
}

export interface EngineMechanicalParameters {
  rpm: number; // Rotational speed (RPM)
  crankshaftSpeed: number; // Crankshaft angular velocity (rad/s)
  torque: number; // Shaft torque (Nm)
  mechanicalLoad: number; // Calculated engine mechanical stress (%)
  bearingTemperature: number; // Main journal bearing temperature (°C)
  bearingVibration: number; // Bearing housing radial vibration (mm/s)
  engineOperatingHours: number; // Total accumulated engine hours (h)
  engineCycleCount: number; // Total operational starts/sorties
  componentHealth: ComponentHealthStatus;
}

// 8. VIBRATION TELEMETRY (Spectral & Tri-Axial Accelerometer)
export interface EngineVibrationParameters {
  overallVibration: number; // Total composite vibration (mm/s)
  vibrationX: number; // Lateral axis vibration (mm/s)
  vibrationY: number; // Longitudinal axis vibration (mm/s)
  vibrationZ: number; // Vertical axis vibration (mm/s)
  rmsVibration: number; // Root Mean Square acceleration (mm/s RMS)
  peakVibration: number; // Peak amplitude (mm/s)
  dominantFrequency: number; // 1X harmonic dominant frequency (Hz)
  vibrationTrend: number; // Trend degradation slope (mm/s per 100h)
  vibrationBaseline: number; // Healthy baseline reference (mm/s)
  vibrationDeviation: number; // Deviation from calibrated baseline (mm/s)
}

// 9. ELECTRICAL SYSTEM (28V DC MALE-UAV Bus + Rotax Alternator)
export interface EngineElectricalParameters {
  batteryVoltage: number; // Avionics bus battery voltage (V)
  batteryCurrent: number; // Battery net charge/discharge current (A)
  batteryTemperature: number; // Battery compartment temperature (°C)
  batterySoc: number; // Battery state of charge (%)
  alternatorVoltage: number; // Alternator regulated output (V, nominal 28.4V)
  alternatorCurrent: number; // Alternator output load current (A, nominal 14.2A)
  electricalPower: number; // Total electrical bus power output (W)
  electricalLoad: number; // Bus capacity utilization (%)
  starterStatus: 'DISENGAGED' | 'ENGAGED' | 'STANDBY';
}

// 10. COOLING SYSTEM (Liquid-Cooled Cylinder Heads + Air-Cooled Cylinders)
export interface EngineCoolingParameters {
  architecture: 'LIQUID_HEADS_AIR_CYLINDERS';
  coolantTemperature: number; // Coolant temperature (°C, nominal 85-105°C)
  coolantPressure: number; // Cooling loop pressure (bar, nominal 1.2 bar)
  coolantFlow: number; // Coolant pump flow rate (L/min, nominal 18.5 L/min)
  radiatorTemperature: number; // Radiator core return temperature (°C)
  coolingAirTemperature: number; // Cylinder fin cooling airflow temp (°C)
  coolingAirFlow: number; // Ram air cooling velocity (m/s)
  status: CoolingSystemStatus;
}

// 11. EXHAUST PARAMETERS
export interface EngineExhaustParameters {
  egtAverage: number; // Mean EGT across all 4 cylinders (°C)
  egtPerCylinder: [number, number, number, number]; // Cylinders 1-4 EGT (°C)
  egtMaxDeviation: number; // EGT spread between hottest and coldest cylinder (°C)
  exhaustPressure: number; // Pre-turbine manifold backpressure (bar)
  exhaustFlow: number; // Exhaust gas mass flow rate (kg/h)
  exhaustTemperature: number; // Tailpipe outlet temperature (°C)
}

// 12. ENVIRONMENTAL & AERONAUTICAL CONDITIONS (Contextual External Inputs)
export interface EngineEnvironmentContext {
  altitude: number; // Aircraft altitude MSL (m)
  airspeed: number; // Calibrated airspeed (m/s)
  oat: number; // Outside Air Temperature (°C)
  ambientTemperature: number; // Ambient air temperature (°C)
  ambientPressure: number; // Ambient atmospheric pressure (hPa)
  humidity: number; // Relative ambient humidity (%)
  airDensity: number; // Ambient air density (kg/m³)
  windSpeed: number; // Vector wind speed (m/s)
  windDirection: number; // Wind azimuth angle (0-360°)
}

// 13. ENGINE HEALTH PARAMETERS (Model-Derived Prognostics)
export interface EngineHealthParameters {
  overallEngineHealth: number; // Composite Health Index (0 - 100%)
  engineHealthIndex: number; // Health score 0-100
  degradationIndex: number; // Degradation metric (0.000 to 1.000)
  anomalyScore: number; // LSTM Autoencoder reconstruction anomaly score (0.0 - 1.0)
  faultState: 'HEALTHY' | 'DEGRADED' | 'FAULT';
  faultType: string | null;
  faultSeverity: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  healthTrend: 'IMPROVING' | 'STABLE' | 'DEGRADING';
  componentHealth: {
    cylinder: number; // %
    bearing: number; // %
    lubrication: number; // %
    fuelSystem: number; // %
    ignitionSystem: number; // %
    coolingSystem: number; // %
    electricalSystem: number; // %
  };
}

// 14. MAINTENANCE INFORMATION (Operational & Depot History)
export interface MaintenanceReplacementRecord {
  component: string;
  atHours: number;
  date: string;
  reason: string;
}

export interface MaintenanceFaultRecord {
  timestamp: string;
  code: string;
  description: string;
  resolved: boolean;
}

export interface MaintenanceEventRecord {
  date: string;
  type: string;
  description: string;
  technician: string;
}

export interface EngineMaintenanceInformation {
  engineOperatingHours: number; // Total operational time (h)
  flightHours: number; // Airborne flight hours (h)
  engineCycleCount: number; // Total operational cycles/starts
  cyclesSinceMaintenance: number; // Sorties since last scheduled inspection
  operatingHoursSinceMaintenance: number; // Hours since 100-hour inspection
  lastMaintenanceDate: string; // ISO date string (simulated)
  lastMaintenanceHours: number; // Hour meter at last inspection
  lastOverhaulDate: string; // Date of zero-hour overhaul (simulated)
  isSimulatedData: boolean; // Explicit indicator: simulated demo data
  replacementHistory: MaintenanceReplacementRecord[];
  faultHistory: MaintenanceFaultRecord[];
  maintenanceEvents: MaintenanceEventRecord[];
}

// 15. REMAINING USEFUL LIFE (RUL) STATE (Distinct from Battery / Flight Time)
export interface EngineRULState {
  estimatedRul: number; // Remaining engine operational hours (h)
  rulUnit: 'operating_hours' | 'cycles' | 'percentage';
  nominalTboHours: number; // Manufacturer Time Before Overhaul (2,000 h)
  rulTrend: RULTrendDirection;
  degradationTrend: number; // Degradation rate (% per 100 operating hours)
  healthState: RULHealthState;
  maintenanceThresholdHours: number; // Threshold warning limit (e.g. 50 h)
  isSimulatedPrediction: boolean; // Explicit indicator: simulated ML prediction
  rulHistory: number[]; // 8-point degradation trajectory history
  componentRul: {
    corePowerplantHours: number;
    turbochargerHours: number;
    oilPumpHours: number;
    alternatorHours: number;
    fuelInjectorsHours: number;
  };
}

// 16. DERIVED ENGINE PARAMETERS
export interface EngineDerivedParameters {
  powerToFuelEfficiency: number; // Specific power efficiency (kW / (L/h))
  chtDeviations: [number, number, number, number]; // Cylinder temp minus average (°C)
  egtDeviations: [number, number, number, number]; // EGT temp minus average (°C)
  rpmError: number; // Target RPM - Actual RPM (RPM)
  oilPressureDeviation: number; // Expected oil pressure - actual (bar)
  vibrationDeviation: number; // Current vibration - baseline (mm/s)
  fuelConsumptionTrend: number; // Derivative d(FuelFlow)/dt (L/h/min)
  temperatureTrend: number; // Derivative d(CHT)/dt (°C/min)
}

// ============================================================================
// COMPLETE UNIFIED AERO-PISTON ENGINE TELEMETRY MODEL (SECTION 17 SPECIFICATION)
// ============================================================================
export interface AeroEngineTelemetry {
  operating: EngineOperatingParameters;
  combustion: EngineCombustionParameters;
  lubrication: EngineLubricationParameters;
  fuel: EngineFuelParameters;
  intake: EngineIntakeParameters;
  ignition: EngineIgnitionParameters;
  mechanical: EngineMechanicalParameters;
  vibration: EngineVibrationParameters;
  electrical: EngineElectricalParameters;
  cooling: EngineCoolingParameters;
  exhaust: EngineExhaustParameters;
  environment: EngineEnvironmentContext;
  health: EngineHealthParameters;
  maintenance: EngineMaintenanceInformation;
  rul: EngineRULState;
  derived: EngineDerivedParameters;
}

// Historical Engine Time-Series Sample for Buffers & ML
export interface EngineTelemetryHistoryPoint {
  timeSec: number;
  rpm: number;
  throttle: number;
  engineLoad: number;
  torque: number;
  powerKw: number;
  chtAvg: number;
  egtAvg: number;
  oilPressure: number;
  oilTemp: number;
  fuelFlow: number;
  fuelPressure: number;
  map: number;
  vibrationRms: number;
  coolantTemp: number;
  ambientTemp: number;
  altitude: number;
  electricalPower: number;
}
