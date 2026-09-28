// ============================================================================
// AEROTWIN AI — BRP-ROTAX 914 F AERO-PISTON ENGINE DATA MODEL
// Dedicated Engineering Digital Twin Specification (SIH26054 / IM-914)
// ============================================================================

// ----------------------------------------------------------------------------
// 1. ROTAX 914 F STATIC ENGINE SPECIFICATIONS & METADATA
// (Separated from live sensor telemetry per Section 1 & Section 18)
// ----------------------------------------------------------------------------
export interface Rotax914FSpecifications {
  modelName: 'BRP-Rotax 914 F';
  series: '914 Series (Certified Aircraft Powerplant)';
  manufacturer: 'BRP-Powertrain GmbH & Co. KG';
  engineType: '4-Stroke Spark-Ignition Piston Engine';
  cylinderCount: 4;
  cylinderArrangement: 'Horizontally Opposed (Boxer)';
  boreMm: 79.5;
  strokeMm: 61.0;
  displacementCm3: 1211.2;
  compressionRatio: '9.0 : 1';
  valvetrain: 'Single Central Camshaft · Hydraulic Tappets · Pushrods · OHV';
  induction: 'Turbocharged with TCU Electronic Control & Automatic Wastegate';
  carburetion: '2x Constant Depression Carburetors (Bing 64)';
  ignitionType: 'Dual Electronic Capacitor Discharge Ignition (Ducati CDI)';
  sparkPlugsPerCylinder: 2; // 8 spark plugs total
  fuelPumps: '2x 12V DC Electric Vane Fuel Pumps (Series Check Valves)';
  coolingArchitecture: 'Mixed: Liquid-Cooled Heads + Ram-Air-Cooled Cylinders';
  lubricationArchitecture: 'Dry Sump Forced Lubrication with Separate Oil Tank';
  startingSystem: 'Electric Starter (12V DC, 0.7 / 0.9 kW)';
  propellerDrive: 'Integrated Reduction Gearbox with Torsional Shock Damper & Clutch';
  reductionRatio: 2.42857; // 51 teeth / 21 teeth (approx 2.43:1)
  directionOfPropRotation: 'Counter-Clockwise (looking towards flange face)';
  integratedGeneratorOutputW: 250; // AC generator @ 5,800 RPM
  optionalExternalAlternatorW: 600; // 14.2 - 14.8V DC @ 6,000 RPM
  ratedTakeoffPowerHp: 115; // 84.5 kW @ 5,800 RPM (5 min limit)
  ratedContinuousPowerHp: 100; // 73.5 kW @ 5,500 RPM
  maxTorqueNm: 144.0; // at 4,900 RPM
  tboHours: 2000; // Manufacturer Time Before Overhaul (h)
  dryWeightKg: 74.4; // Config 3 with governor drive
  fuelSpecification: 'Min. 95 Octane RON (EN 228 / AVGAS 100LL)';
}

export const ROTAX_914_F_SPECS: Readonly<Rotax914FSpecifications> = {
  modelName: 'BRP-Rotax 914 F',
  series: '914 Series (Certified Aircraft Powerplant)',
  manufacturer: 'BRP-Powertrain GmbH & Co. KG',
  engineType: '4-Stroke Spark-Ignition Piston Engine',
  cylinderCount: 4,
  cylinderArrangement: 'Horizontally Opposed (Boxer)',
  boreMm: 79.5,
  strokeMm: 61.0,
  displacementCm3: 1211.2,
  compressionRatio: '9.0 : 1',
  valvetrain: 'Single Central Camshaft · Hydraulic Tappets · Pushrods · OHV',
  induction: 'Turbocharged with TCU Electronic Control & Automatic Wastegate',
  carburetion: '2x Constant Depression Carburetors (Bing 64)',
  ignitionType: 'Dual Electronic Capacitor Discharge Ignition (Ducati CDI)',
  sparkPlugsPerCylinder: 2,
  fuelPumps: '2x 12V DC Electric Vane Fuel Pumps (Series Check Valves)',
  coolingArchitecture: 'Mixed: Liquid-Cooled Heads + Ram-Air-Cooled Cylinders',
  lubricationArchitecture: 'Dry Sump Forced Lubrication with Separate Oil Tank',
  startingSystem: 'Electric Starter (12V DC, 0.7 / 0.9 kW)',
  propellerDrive: 'Integrated Reduction Gearbox with Torsional Shock Damper & Clutch',
  reductionRatio: 2.42857,
  directionOfPropRotation: 'Counter-Clockwise (looking towards flange face)',
  integratedGeneratorOutputW: 250,
  optionalExternalAlternatorW: 600,
  ratedTakeoffPowerHp: 115,
  ratedContinuousPowerHp: 100,
  maxTorqueNm: 144.0,
  tboHours: 2000,
  dryWeightKg: 74.4,
  fuelSpecification: 'Min. 95 Octane RON (EN 228 / AVGAS 100LL)',
};

// ----------------------------------------------------------------------------
// 2. ROTAX 914 OPERATING LIMITS & CERTIFIED REFERENCE THRESHOLDS
// (From Rotax 914 Installation Manual Sections 8, 11, 12, 13, 14, 16, 20)
// ----------------------------------------------------------------------------
export interface Rotax914OperatingLimits {
  speed: {
    maxTakeoffRpm: 5800; // 5 min max
    maxContinuousRpm: 5500;
    idleRpm: 1400;
    cruisingRpmMin: 4800;
    cruisingRpmMax: 5200;
  };
  manifoldPressure: {
    maxTakeoffInHg: 39.0; // 1.30 bar / 1300 hPa
    maxContinuousInHg: 35.4; // 1.18 bar / 1180 hPa
    ambientInHg: 29.92;
  };
  temperatures: {
    maxChtC: 135; // 275 °F
    maxCoolantExitTempC: 120; // 248 °F
    maxCylinderWallTempC: 200; // 392 °F on Cyl 2
    maxEgtC: 950; // 1,740 °F
    normalEgtC: 900; // 1,650 °F
    minOilTempC: 50; // 120 °F
    normalOilTempMinC: 90;
    normalOilTempMaxC: 110;
    maxOilTempC: 130; // 266 °F
    maxAirboxTempStandardC: 72; // 162 °F
    maxAirboxTempLateTcuC: 88; // 190 °F
    maxFuelLineTempC: 45; // 113 °F (vapor lock prevention)
    maxStarterHousingTempC: 80; // 176 °F
  };
  pressures: {
    minOilPressureBar: 1.5; // (below 3,500 RPM: 0.8 bar)
    normalOilPressureMinBar: 2.0;
    normalOilPressureMaxBar: 5.0;
    maxOilPressureBar: 7.0; // cold start limit
    fuelPressureDeltaNominalBar: 0.25; // 3.6 psi above airbox
    fuelPressureDeltaMinBar: 0.15; // 2.2 psi above airbox
    fuelPressureDeltaMaxBar: 0.35; // 5.0 psi above airbox
    maxExhaustBackpressureBar: 0.15; // 2.17 psi
    maxSuctionVacuumBar: 0.30; // 4.35 psi below ambient
    maxCrankcasePressureBar: 0.45; // 6.53 psi above ambient
    radiatorCapReliefBar: 1.20; // 17.5 psi
  };
  reductionGearbox: {
    ratio: 2.42857;
    maxPropellerTorqueNm: 340;
    maxPropellerInertiaKgCm2: 6000;
  };
}

export const ROTAX_914_OPERATING_LIMITS: Readonly<Rotax914OperatingLimits> = {
  speed: {
    maxTakeoffRpm: 5800,
    maxContinuousRpm: 5500,
    idleRpm: 1400,
    cruisingRpmMin: 4800,
    cruisingRpmMax: 5200,
  },
  manifoldPressure: {
    maxTakeoffInHg: 39.0,
    maxContinuousInHg: 35.4,
    ambientInHg: 29.92,
  },
  temperatures: {
    maxChtC: 135,
    maxCoolantExitTempC: 120,
    maxCylinderWallTempC: 200,
    maxEgtC: 950,
    normalEgtC: 900,
    minOilTempC: 50,
    normalOilTempMinC: 90,
    normalOilTempMaxC: 110,
    maxOilTempC: 130,
    maxAirboxTempStandardC: 72,
    maxAirboxTempLateTcuC: 88,
    maxFuelLineTempC: 45,
    maxStarterHousingTempC: 80,
  },
  pressures: {
    minOilPressureBar: 1.5,
    normalOilPressureMinBar: 2.0,
    normalOilPressureMaxBar: 5.0,
    maxOilPressureBar: 7.0,
    fuelPressureDeltaNominalBar: 0.25,
    fuelPressureDeltaMinBar: 0.15,
    fuelPressureDeltaMaxBar: 0.35,
    maxExhaustBackpressureBar: 0.15,
    maxSuctionVacuumBar: 0.30,
    maxCrankcasePressureBar: 0.45,
    radiatorCapReliefBar: 1.20,
  },
  reductionGearbox: {
    ratio: 2.42857,
    maxPropellerTorqueNm: 340,
    maxPropellerInertiaKgCm2: 6000,
  },
};

// ----------------------------------------------------------------------------
// 3. OPERATING STATES & MODES (Section 15 & 16)
// ----------------------------------------------------------------------------
export type EngineOperatingMode =
  | 'OFF'
  | 'STARTING'
  | 'IDLE'
  | 'TAXI'
  | 'TAKEOFF'
  | 'CLIMB'
  | 'CRUISE'
  | 'DESCENT'
  | 'HIGH_POWER'
  | 'ABNORMAL'
  | 'SHUTDOWN';

export type EngineStartStopState =
  | 'OFF'
  | 'STARTING'
  | 'CRANKING'
  | 'RUNNING'
  | 'SHUTDOWN'
  | 'START_FAILURE';

export type EngineStatus = 'NOMINAL' | 'CAUTION' | 'CRITICAL' | 'OFFLINE';
export type IgnitionState = 'ACTIVE' | 'DEGRADED' | 'OFF';
export type FuelSystemStatus = 'NOMINAL' | 'PRESSURE_DROP' | 'CLOGGED_FILTER' | 'LEAK_DETECTED';
export type CoolingSystemStatus = 'NOMINAL' | 'OVERHEAT' | 'LEAK_DETECTED' | 'FLOW_RESTRICTION';
export type RULHealthState = 'NOMINAL' | 'MONITOR' | 'ACTION_REQUIRED';
export type RULTrendDirection = 'STABLE' | 'DEGRADING' | 'ACCELERATING';

// ----------------------------------------------------------------------------
// 4. CORE ENGINE TELEMETRY (Section 2)
// ----------------------------------------------------------------------------
export interface EngineOperatingParameters {
  rpm: number; // Engine rotational speed (RPM)
  targetRpm: number; // Commanded target speed (RPM)
  rpmError: number; // Target - Actual RPM
  throttlePosition: number; // 0 - 100% (Detent at 104% per manual p. 95)
  engineLoad: number; // 0 - 100%
  torque: number; // Engine torque (Nm)
  powerKw: number; // Power output (kW)
  powerHp: number; // Power output (HP)
  fuelFlowRate: number; // Fuel consumption rate (L/h)
  fuelPressure: number; // Fuel supply pressure (bar)
  airFuelRatio: number; // Air/Fuel Ratio (e.g., 14.7)
  lambda: number; // Stoichiometric ratio (e.g., 1.01)
  map: number; // Manifold Absolute Pressure (inHg)
  iat: number; // Intake Air Temperature (°C)
  ambientPressure: number; // Ambient atmospheric pressure (hPa)
  ambientTemperature: number; // Ambient outside temperature (°C)
  operatingMode: EngineOperatingMode; // High-level operational state
  startStopState: EngineStartStopState; // Crank/running state
  bsfcGkwh: number; // Brake Specific Fuel Consumption (g/kWh, model-derived)
  powerToWeightRatioKwPerKg: number; // Power to weight ratio (model-derived)
}

// ----------------------------------------------------------------------------
// 5. FOUR-CYLINDER MONITORING (Section 3)
// Horizontally Opposed Boxer Layout:
// Cyl 1 (Left Front), Cyl 2 (Right Front - Primary Sensor),
// Cyl 3 (Left Rear),  Cyl 4 (Right Rear)
// ----------------------------------------------------------------------------
export interface SingleCylinderTelemetry {
  id: 1 | 2 | 3 | 4;
  name: string;
  bank: 'LEFT' | 'RIGHT';
  position: 'FRONT' | 'REAR';
  cht: number; // Cylinder Head Temperature (°C)
  egt: number; // Exhaust Gas Temperature (°C)
  combustionHealth: number; // 0 - 100%
  misfireIndication: boolean;
  chtDeviation: number; // CHT minus cylinder average (°C)
  egtDeviation: number; // EGT minus cylinder average (°C)
  cylinderHealth: number; // 0 - 100%
  anomalyScore: number; // 0.000 to 1.000
}

export interface FourCylinderTelemetry {
  cylinder_1: SingleCylinderTelemetry;
  cylinder_2: SingleCylinderTelemetry; // Primary instrumentation cylinder per manual p. 46
  cylinder_3: SingleCylinderTelemetry; // Secondary instrumentation cylinder per manual p. 133
  cylinder_4: SingleCylinderTelemetry;
  averageCht: number; // Mean CHT (°C)
  maxCht: number; // Peak CHT (°C)
  minCht: number; // Lowest CHT (°C)
  chtSpread: number; // Peak - Lowest (°C)
  averageEgt: number; // Mean EGT (°C)
  maxEgt: number; // Peak EGT (°C)
  minEgt: number; // Lowest EGT (°C)
  egtSpread: number; // Peak - Lowest (°C)
  cylinderToCylinderChtDeviation: [number, number, number, number];
  cylinderToCylinderEgtDeviation: [number, number, number, number];
}

// Legacy-compatible Combustion structure
export interface CylinderCombustionData {
  cylinders: [number, number, number, number]; // [Cyl 1, Cyl 2, Cyl 3, Cyl 4]
  average: number;
  maxDeviation: number;
  deviations: [number, number, number, number];
  trend: number;
}

export interface EngineCombustionParameters {
  cht: CylinderCombustionData;
  egt: CylinderCombustionData;
  exhaustTemperature: number; // Post-turbo tailpipe temperature (°C)
  intakeAirTemperature: number; // Post-intercooler charge temperature (°C)
  combustionStatus: 'NOMINAL' | 'KNOCK_DETECTED' | 'LEAN_MISFIRE' | 'RICH';
  cylinders: FourCylinderTelemetry;
}

// ----------------------------------------------------------------------------
// 6. TURBOCHARGER & TCU SYSTEM (Section 4)
// ----------------------------------------------------------------------------
export interface TurbochargerTelemetry {
  turbochargerRpm: number; // Simulated compressor shaft speed (~95,000 - 130,000 RPM)
  compressorPressureBar: number;
  boostPressureBar: number; // Differential over ambient (bar)
  intakeManifoldPressureInHg: number; // MAP (inHg)
  turbochargerTemperatureC: number; // Center housing bearing temp (°C)
  compressorInletPressureBar: number;
  compressorOutletPressureBar: number;
  operatingState: 'OFF' | 'SPOOLING' | 'BOOSTING' | 'WASTEGATE_ACTIVE' | 'SURGE' | 'OVERBOOST';
  health: number; // %
  anomalyState: 'NOMINAL' | 'UNDERBOOST' | 'OVERBOOST' | 'BEARING_WEAR' | 'SURGE';
}

export interface WastegateTelemetry {
  position: number; // Actuator position (0 - 100% open)
  command: number; // Commanded position from TCU (0 - 100%)
  state: 'CLOSED' | 'REGULATING' | 'OPEN' | 'STUCK_OPEN' | 'STUCK_CLOSED';
  openingPercent: number;
  error: number; // Command - Actual position
  responseTimeMs: number;
  health: number; // %
}

export interface TurboControlUnitTelemetry {
  status: 'ONLINE' | 'STANDBY' | 'DEGRADED' | 'FAULT' | 'OFFLINE';
  operatingMode: 'NORMAL' | 'BOOST_LIMITED' | 'ALTITUDE_COMPENSATION' | 'EMERGENCY_OVERRIDE';
  commandPct: number;
  faultState: boolean;
  boostWarningLamp: boolean; // Red boost lamp per manual p. 122
  cautionLamp: boolean; // Orange caution lamp per manual p. 122
  communication: 'OK' | 'TIMEOUT' | 'ERROR';
  targetBoostBar: number;
  actualBoostBar: number;
  boostErrorBar: number;
}

export interface TurbochargerSystemTelemetry {
  turbocharger: TurbochargerTelemetry;
  wastegate: WastegateTelemetry;
  tcu: TurboControlUnitTelemetry;
}

// ----------------------------------------------------------------------------
// 7. INTAKE & AIRBOX SYSTEM (Section 5)
// ----------------------------------------------------------------------------
export interface EngineIntakeParameters {
  map: number; // Manifold Absolute Pressure (inHg)
  mapBar: number; // Manifold Absolute Pressure (bar)
  airboxPressureInHg: number; // Boosted plenum pressure (inHg)
  airboxPressureBar: number; // Boosted plenum pressure (bar)
  airboxTemperatureC: number; // Airbox charge temp (°C, limit 72°C per manual p. 97)
  intakeAirTemperature: number; // Charge air temperature (°C)
  intakeAirPressure: number; // Pre-compressor intake pressure (bar)
  airMassFlow: number; // Mass airflow into plenum (kg/h)
  throttlePosition: number; // Throttle plate opening (%)
  pressureDifferential: number; // Turbo boost pressure over ambient (bar)
  wastegatePosition: number; // Electronic turbo wastegate opening (0-100%)
  intakeRestrictionHpa: number; // Airfilter restriction pressure loss (limit 5 hPa)
  airFilterCondition: 'CLEAN' | 'DEGRADED' | 'RESTRICTED';
  intakeStatus: 'NOMINAL' | 'RESTRICTED' | 'OVERHEAT';
  boostPressureDeviation: number;
  intakePressureDeviation: number;
  intakeTemperatureTrend: number;
  airflowTrend: number;
}

// ----------------------------------------------------------------------------
// 8. CARBURETOR SYSTEM (Section 6)
// 2x Constant-Depression Carburetors (Bing 64) - NO EFI INJECTORS!
// ----------------------------------------------------------------------------
export interface SingleCarburetorTelemetry {
  id: 1 | 2;
  name: string; // 'Carburetor 1 (Cyl 1 & 3)' or 'Carburetor 2 (Cyl 2 & 4)'
  status: 'NOMINAL' | 'DEGRADED' | 'ICING' | 'CLOGGED';
  throttleResponse: number; // 0 - 100%
  slidePosition: number; // Constant-depression vacuum piston position (%)
  floatBowlLevel: 'NORMAL' | 'HIGH' | 'LOW';
  temperatureC: number;
  mixtureCondition: 'OPTIMAL' | 'LEAN' | 'RICH';
  faultState: boolean;
}

export interface CarburetorSystemTelemetry {
  carburetor_1: SingleCarburetorTelemetry; // Left bank (Cyl 1 & 3)
  carburetor_2: SingleCarburetorTelemetry; // Right bank (Cyl 2 & 4)
  balance: number; // 0 - 100% synchronization
  balanceDeviation: number; // Deviation between left & right carb response (%)
  mixtureCondition: 'OPTIMAL' | 'LEAN' | 'RICH' | 'ICING_RISK';
  throttleSynchronization: number; // %
  dripTrayDrained: boolean; // Drip tray drain line status per manual p. 92
  status: 'NOMINAL' | 'IMBALANCE' | 'ICING_WARNING' | 'FAULT';
}

// ----------------------------------------------------------------------------
// 9. FUEL SYSTEM (Section 7)
// 2x 12V Electric Fuel Pumps in Series Check Valve Architecture
// ----------------------------------------------------------------------------
export interface SingleFuelPumpTelemetry {
  id: 1 | 2;
  role: 'MAIN' | 'STANDBY';
  state: 'ACTIVE' | 'STANDBY' | 'FAULT' | 'OFF';
  voltage: number; // V DC (12V nominal)
  currentA: number; // Current draw (nominal 1.5 - 1.7 A per manual p. 118)
  pressureOutputBar: number;
  deliveryRateLh: number; // Delivery rate (nominal 110-120 L/h)
  checkValveStatus: 'NORMAL' | 'BLOCKED' | 'LEAK';
}

export interface FuelSystemTelemetry {
  pump_1: SingleFuelPumpTelemetry; // Main electric fuel pump
  pump_2: SingleFuelPumpTelemetry; // Standby / Aux electric fuel pump
  fuelFlow: number; // Current consumption rate (L/h)
  fuelPressure: number; // Regulated supply pressure (bar, airbox + 0.25 bar nom)
  fuelPressureDeltaOverAirbox: number; // Differential over airbox (bar, nom 0.25)
  fuelTemperature: number; // Fuel line temp (°C, limit 45°C to avoid vapor locks)
  fuelQuantity: number; // Available volume (L)
  fuelRemainingPercent: number; // Fuel tank level (%)
  fuelConsumption: number; // Cumulative burn (L)
  fuelConsumptionTrend: number;
  systemPressure: number; // bar
  systemHealth: number; // %
  fuelStarvationIndication: boolean;
  fuelPressureDeviation: number;
  pumpImbalance: number; // %
  status: FuelSystemStatus;
}

// Legacy-compatible Fuel Parameters
export interface EngineFuelParameters {
  fuelFlow: number;
  fuelPressure: number;
  fuelTemperature: number;
  fuelQuantity: number;
  fuelRemainingPercent: number;
  fuelConsumption: number;
  fuelConsumptionTrend: number;
  carburetorFeedRate: number; // Adapted from legacy EFI timing
  mixtureRatio: number; // Adapted from legacy EFI duration
  status: FuelSystemStatus;
}

// ----------------------------------------------------------------------------
// 10. IGNITION SYSTEM (Section 8)
// Dual Capacitor Discharge Ignition (Ducati CDI) - 8 Spark Plugs Total
// ----------------------------------------------------------------------------
export interface SingleIgnitionCircuitTelemetry {
  circuit: 'A' | 'B';
  status: 'ACTIVE' | 'DEGRADED' | 'FAULT' | 'OFF';
  health: number; // %
  voltage: number; // Excitation voltage (V)
  timingDegBtdc: number; // Ignition timing (° BTDC, nominal 26°)
  controlsPlugs: string; // e.g. 'Top Plugs (Cyl 1,2) + Lower Plugs (Cyl 3,4)'
}

export interface IgnitionSystemTelemetry {
  ignition_A: SingleIgnitionCircuitTelemetry;
  ignition_B: SingleIgnitionCircuitTelemetry;
  dualIgnitionState:
    | 'BOTH_ACTIVE'
    | 'IGNITION_A_ONLY'
    | 'IGNITION_B_ONLY'
    | 'IGNITION_A_FAULT'
    | 'IGNITION_B_FAULT'
    | 'BOTH_FAULT';
  ignitionTiming: number; // ° BTDC
  ignitionAdvance: number; // °
  sparkPlugStatus: {
    circuitA: ['OK' | 'FAULT', 'OK' | 'FAULT', 'OK' | 'FAULT', 'OK' | 'FAULT'];
    circuitB: ['OK' | 'FAULT', 'OK' | 'FAULT', 'OK' | 'FAULT', 'OK' | 'FAULT'];
  };
  ignitionVoltage: number;
  primaryIgnitionState: IgnitionState;
  secondaryIgnitionState: IgnitionState;
  misfireCount: number;
  misfireDetected: boolean;
  dualIgnitionConsistency: number; // %
}

export type EngineIgnitionParameters = IgnitionSystemTelemetry;

// ----------------------------------------------------------------------------
// 11. COOLING SYSTEM (Section 9)
// Mixed Architecture: Liquid-Cooled Cylinder Heads + Ram-Air-Cooled Cylinders
// ----------------------------------------------------------------------------
export interface LiquidHeadCoolingTelemetry {
  coolantTemperature: number; // Exit coolant temp (°C, max 120°C per manual p. 44)
  coolantPressure: number; // Expansion loop pressure (bar, nominal 1.2 bar)
  coolantFlow: number; // Water pump flow rate (L/min, ~60 L/min @ 5,800 RPM)
  cylinderHeadTemperature: number; // Peak CHT (°C, max 135°C per manual p. 44)
  radiatorTemperature: number; // Return coolant temp from radiator (°C)
  coolantLevelPercent: number; // Expansion tank level (%)
  radiatorHeatDissipationKw: number; // Heat energy transferred (~30 kW @ takeoff)
  status: CoolingSystemStatus;
  health: number; // %
}

export interface RamAirCylinderCoolingTelemetry {
  coolingAirTemperature: number; // Cylinder fin cooling air temp (°C)
  coolingAirPressureHpa: number; // Ram air dynamic pressure (hPa)
  coolingAirFlow: number; // Ram air velocity through baffles (m/s)
  ambientTemperature: number; // Ambient OAT (°C)
  cylinderWallTemperature: number; // Cylinder wall temp (°C, max 200°C on Cyl 2)
  coolingEffectiveness: number; // %
}

export interface EngineCoolingParameters {
  architecture: 'LIQUID_HEADS_AIR_CYLINDERS';
  coolantTemperature: number;
  coolantPressure: number;
  coolantFlow: number;
  radiatorTemperature: number;
  coolingAirTemperature: number;
  coolingAirFlow: number;
  status: CoolingSystemStatus;
  liquidCooling: LiquidHeadCoolingTelemetry;
  ramAirCooling: RamAirCylinderCoolingTelemetry;
  coolingEfficiency: number; // 0 - 100%
  temperatureDeviation: number; // °C
  overTemperatureCondition: boolean;
  coolingAnomaly: boolean;
}

// ----------------------------------------------------------------------------
// 12. DRY-SUMP LUBRICATION SYSTEM (Section 10)
// Separate External Oil Tank + Main Pressure Pump + Scavenge Sump Pump
// ----------------------------------------------------------------------------
export interface OilTankTelemetry {
  levelPercent: number; // Oil tank level (2.5L min, 3.0L max per manual p. 75)
  quantityLiters: number;
  temperatureC: number;
  ventLinePressureBar: number;
}

export interface OilPumpTelemetry {
  status: 'OPTIMAL' | 'DEGRADED' | 'LOW_PRESSURE';
  pressureBar: number; // 2.0 - 5.0 bar nominal
  flowRateLmin: number; // Main delivery flow
  vacuumSuctionBar: number; // Oil suction line vacuum (max 0.3 bar per manual p. 65)
  crankcasePressureBar: number; // Crankcase blow-by pressure (max 0.45 bar per manual p. 66)
}

export interface OilFilterTelemetry {
  condition: 'NORMAL' | 'CLOGGED_BYPASS' | 'INSPECT_REQUIRED';
  differentialPressureBar: number;
}

export interface LubricationCircuitTelemetry {
  oilTemperature: number; // Oil temp (°C, max 130°C per manual p. 64)
  oilPressureTrend: number; // bar/min
  oilTemperatureTrend: number; // °C/min
  oilPressureDeviation: number; // Expected - Actual (bar)
  status: 'OPTIMAL' | 'DEGRADED' | 'LOW_PRESSURE' | 'HIGH_TEMP';
  health: number; // %
}

export interface LubricationSystemTelemetry {
  oil_tank: OilTankTelemetry;
  oil_pump: OilPumpTelemetry;
  oil_filter: OilFilterTelemetry;
  lubrication_circuit: LubricationCircuitTelemetry;
}

// Legacy-compatible Lubrication Parameters
export interface EngineLubricationParameters {
  oilPressure: number;
  oilTemperature: number;
  oilLevel: number;
  oilFlowRate: number;
  oilPressureTrend: number;
  oilTemperatureTrend: number;
  oilPressureDeviation: number;
  status: 'OPTIMAL' | 'DEGRADED' | 'LOW_PRESSURE' | 'HIGH_TEMP';
}

// ----------------------------------------------------------------------------
// 13. EXHAUST SYSTEM (Section 11)
// AISI 309 Stainless Headers, Pre-Turbine Collector, Muffler Canister
// ----------------------------------------------------------------------------
export interface EngineExhaustParameters {
  egtAverage: number; // Mean EGT (°C, max 950°C, normal 900°C)
  egtPerCylinder: [number, number, number, number]; // Cylinders 1-4 EGT (°C)
  egtMaxDeviation: number; // Spread between hottest and coldest cylinder (°C)
  exhaustPressure: number; // Pre-turbine backpressure (bar, max 0.15 bar per manual p. 41)
  exhaustFlow: number; // Exhaust gas mass flow rate (kg/h)
  exhaustTemperature: number; // Tailpipe outlet temperature at Point P1 (°C)
  exhaustEnergyIndex: number; // Model-derived exhaust enthalpy driving turbo turbine
  exhaustSystemHealth: number; // %
  exhaustAnomaly: boolean;
}

// ----------------------------------------------------------------------------
// 14. PROPELLER REDUCTION GEARBOX (Section 12)
// Speed Reduction Ratio 2.42857 : 1 (51T / 21T) with Torsional Shock Absorber
// ----------------------------------------------------------------------------
export interface GearboxTelemetry {
  engine_input_rpm: number; // Crankshaft input speed (RPM)
  propeller_output_rpm: number; // Propeller shaft speed (RPM = engine_input_rpm / 2.42857)
  reduction_ratio: number; // 2.42857 (51T / 21T)
  gearbox_temperature: number; // Gearbox housing temp (°C)
  gearbox_vibration: number; // Gearbox housing vibration (mm/s)
  gearbox_torque: number; // Shaft torque at propeller (up to 340 Nm per manual p. 127)
  gearbox_health: number; // 0 - 100%
  overloadClutchStatus: 'ENGAGED' | 'SLIPPING' | 'LOCK';
  torsionalDamperCondition: 'NORMAL' | 'WORN' | 'INSPECT';
  lubricationStatus: 'OPTIMAL' | 'LOW_LEVEL';
}

// ----------------------------------------------------------------------------
// 15. PROPELLER TELEMETRY (Section 13)
// Configurable for Fixed-Pitch (Ver 2) or Constant-Speed Hydraulic Governor (Ver 3)
// ----------------------------------------------------------------------------
export interface PropellerTelemetry {
  propellerRpm: number;
  propellerTorqueNm: number;
  propellerPitchDeg: number;
  propellerLoadPct: number;
  propellerThrustN: number;
  propellerEfficiencyPct: number;
  propellerStatus: 'NOMINAL' | 'DEGRADED' | 'FEATHERED';
  governorStatus: 'NOT_INSTALLED' | 'ACTIVE' | 'COARSE' | 'FEATHER';
  configuration: 'VERSION_2_FIXED' | 'VERSION_3_GOVERNOR' | 'VERSION_4_PREPARED';
}

// ----------------------------------------------------------------------------
// 16. STARTING SYSTEM (Section 15)
// ----------------------------------------------------------------------------
export interface StartingSystemTelemetry {
  starterState: EngineStartStopState;
  starterCurrentA: number; // Up to 300A for 1 sec, 75A permanent (manual p. 117)
  starterVoltageV: number;
  engineCrankingRpm: number; // Cranking speed during start (~250-400 RPM)
  startAttemptCount: number;
  startDurationSec: number; // Max 10 sec continuous activation per manual p. 116
  successfulStart: boolean;
  failedStart: boolean;
  startFault: boolean;
  engineStartTimeIso: string;
}

// ----------------------------------------------------------------------------
// 17. ELECTRICAL SYSTEM (Section 14)
// Integrated AC Generator (250W) + Optional External Alternator (600W)
// ----------------------------------------------------------------------------
export interface EngineElectricalParameters {
  batteryVoltage: number; // 28.4V avionics bus / 12V engine starter battery
  batteryCurrent: number;
  batteryTemperature: number;
  batterySoc: number; // State of charge (%)
  integratedGeneratorStatus: 'ACTIVE' | 'OFFLINE';
  integratedGeneratorPowerW: number; // ~250W AC @ 5,800 RPM per manual p. 111
  externalAlternatorFitted: boolean; // Configuration dependent per manual p. 21
  externalAlternatorStatus: 'ACTIVE' | 'OFFLINE' | 'NOT_FITTED';
  externalAlternatorVoltage: number; // 14.2 - 14.8V DC per manual p. 123
  externalAlternatorCurrent: number; // Max 40A DC
  electricalPower: number; // Total electrical bus power output (W)
  electricalLoad: number; // Capacity utilization (%)
  starterStatus: 'DISENGAGED' | 'ENGAGED' | 'STANDBY';
  health: number; // %
}

// ----------------------------------------------------------------------------
// 18. MECHANICAL & VIBRATION (Section 7 & 8)
// ----------------------------------------------------------------------------
export interface ComponentHealthStatus {
  crankshaft: number;
  bearings: number;
  pistons: number;
  valvetrain: number;
}

export interface EngineMechanicalParameters {
  rpm: number;
  crankshaftSpeed: number; // rad/s
  torque: number;
  mechanicalLoad: number;
  bearingTemperature: number;
  bearingVibration: number;
  engineOperatingHours: number;
  engineCycleCount: number;
  componentHealth: ComponentHealthStatus;
}

export interface EngineVibrationParameters {
  overallVibration: number;
  vibrationX: number;
  vibrationY: number;
  vibrationZ: number;
  rmsVibration: number;
  peakVibration: number;
  dominantFrequency: number;
  vibrationTrend: number;
  vibrationBaseline: number;
  vibrationDeviation: number;
}

// ----------------------------------------------------------------------------
// 19. ENVIRONMENTAL & AERONAUTICAL CONTEXT (Section 24)
// Influences turbocharger demand, density altitude, and engine cooling
// ----------------------------------------------------------------------------
export interface EngineEnvironmentContext {
  altitude: number; // MSL (m)
  airspeed: number; // Calibrated Airspeed (m/s)
  oat: number; // Outside Air Temp (°C)
  ambientTemperature: number;
  ambientPressure: number; // hPa
  humidity: number; // %
  airDensity: number; // kg/m³
  windSpeed: number; // m/s
  windDirection: number; // deg
  densityAltitudeM: number; // Calculated density altitude
  criticalAltitudeM: number; // Rotax 914 turbo critical altitude (~4,800 m / 15,700 ft)
  flightPhase: 'GROUND' | 'CLIMB' | 'CRUISE' | 'DESCENT' | 'APPROACH';
}

// ----------------------------------------------------------------------------
// 20. ENGINE HEALTH MODEL (Section 19)
// Component-oriented with explicit provenance tags
// ----------------------------------------------------------------------------
export interface ComponentHealthRecord {
  health: number; // 0 - 100%
  status: 'NOMINAL' | 'MONITOR' | 'ACTION_REQUIRED' | 'FAULT';
  source: 'SENSOR_DERIVED' | 'RULE_BASED' | 'MODEL_DERIVED' | 'SIMULATED';
  confidence: number; // 0.0 - 1.0
}

export interface RotaxEngineHealthBreakdown {
  overall: ComponentHealthRecord;
  cylinders: ComponentHealthRecord;
  turbocharger: ComponentHealthRecord;
  wastegate: ComponentHealthRecord;
  tcu: ComponentHealthRecord;
  fuel_system: ComponentHealthRecord;
  carburetors: ComponentHealthRecord;
  ignition: ComponentHealthRecord;
  cooling: ComponentHealthRecord;
  lubrication: ComponentHealthRecord;
  exhaust: ComponentHealthRecord;
  gearbox: ComponentHealthRecord;
  electrical: ComponentHealthRecord;
  starter: ComponentHealthRecord;
}

export interface EngineHealthParameters {
  overallEngineHealth: number; // Composite Health Index (0 - 100%)
  engineHealthIndex: number;
  degradationIndex: number;
  anomalyScore: number; // LSTM Autoencoder reconstruction score (0.0 - 1.0)
  faultState: 'HEALTHY' | 'DEGRADED' | 'FAULT';
  faultType: string | null;
  faultSeverity: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  healthTrend: 'IMPROVING' | 'STABLE' | 'DEGRADING';
  components: RotaxEngineHealthBreakdown;
  componentHealth: {
    cylinder: number;
    bearing: number;
    lubrication: number;
    fuelSystem: number;
    ignitionSystem: number;
    coolingSystem: number;
    electricalSystem: number;
    turbocharger?: number;
    gearbox?: number;
  };
}

// ----------------------------------------------------------------------------
// 21. MAINTENANCE INFORMATION & REMAINING USEFUL LIFE (RUL) (Section 22 & 23)
// ----------------------------------------------------------------------------
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
  engineOperatingHours: number;
  flightHours: number;
  engineCycleCount: number;
  cyclesSinceMaintenance: number;
  operatingHoursSinceMaintenance: number; // Hours since 100-hour inspection
  hoursSinceOverhaul: number; // Hours towards 2,000h TBO
  tboReferenceHours: 2000;
  lastMaintenanceDate: string;
  lastMaintenanceHours: number;
  lastOverhaulDate: string;
  isSimulatedData: boolean;
  replacementHistory: MaintenanceReplacementRecord[];
  faultHistory: MaintenanceFaultRecord[];
  maintenanceEvents: MaintenanceEventRecord[];
}

export interface EngineRULState {
  estimatedRul: number; // Remaining engine operational hours (h)
  rulUnit: 'operating_hours' | 'cycles' | 'percentage';
  nominalTboHours: 2000; // Rotax 914 F manufacturer TBO
  rulTrend: RULTrendDirection;
  degradationTrend: number;
  healthState: RULHealthState;
  maintenanceThresholdHours: number;
  isSimulatedPrediction: true; // Explicitly marked: simulated prediction
  rulMethodology: 'SIMULATED / DEMONSTRATION RUL'; // Explicit provenance per Section 22
  rulHistory: number[];
  componentRul: {
    corePowerplantHours: number;
    turbochargerHours: number;
    reductionGearboxHours: number;
    oilPumpHours: number;
    carburetorsHours: number;
    ignitionSystemHours: number;
    fuelPumpsHours: number;
    alternatorHours: number;
    fuelInjectorsHours?: number; // legacy alias
  };
}

// ----------------------------------------------------------------------------
// 22. DERIVED ENGINE PARAMETERS (Section 17)
// ----------------------------------------------------------------------------
export interface EngineDerivedParameters {
  powerToFuelEfficiency: number; // Specific power efficiency (kW / (L/h))
  brakeSpecificFuelConsumptionGkwh: number; // BSFC (g/kWh)
  chtDeviations: [number, number, number, number];
  egtDeviations: [number, number, number, number];
  rpmError: number;
  oilPressureDeviation: number;
  vibrationDeviation: number;
  fuelConsumptionTrend: number;
  temperatureTrend: number;
  expectedPowerKw: number;
  powerDeviationKw: number;
}

// ----------------------------------------------------------------------------
// 23. COMPLETE UNIFIED ROTAX 914 F AERO-PISTON ENGINE TELEMETRY MODEL
// ----------------------------------------------------------------------------
export interface AeroEngineTelemetry {
  identity: {
    model: 'Rotax 914 F';
    manufacturer: 'BRP-Rotax';
    serialNumber: string;
    configuration: 'Configuration 3 (Governor & Vacuum Prepared)';
    tboHours: 2000;
  };
  operating: EngineOperatingParameters;
  cylinders: FourCylinderTelemetry;
  combustion: EngineCombustionParameters;
  turbocharger: TurbochargerSystemTelemetry;
  intake: EngineIntakeParameters;
  carburetors: CarburetorSystemTelemetry;
  fuel_system: FuelSystemTelemetry;
  fuel: EngineFuelParameters;
  ignition: IgnitionSystemTelemetry;
  cooling: EngineCoolingParameters;
  oil_system: LubricationSystemTelemetry;
  lubrication: EngineLubricationParameters;
  exhaust: EngineExhaustParameters;
  gearbox: GearboxTelemetry;
  propeller: PropellerTelemetry;
  starter: StartingSystemTelemetry;
  electrical: EngineElectricalParameters;
  mechanical: EngineMechanicalParameters;
  vibration: EngineVibrationParameters;
  environment: EngineEnvironmentContext;
  health: EngineHealthParameters;
  maintenance: EngineMaintenanceInformation;
  rul: EngineRULState;
  derived: EngineDerivedParameters;
}

// Historical Engine Time-Series Sample for Buffers & ML Models
export interface EngineTelemetryHistoryPoint {
  timeSec: number;
  rpm: number;
  propRpm: number;
  throttle: number;
  engineLoad: number;
  torque: number;
  powerKw: number;
  chtAvg: number;
  egtAvg: number;
  oilPressure: number;
  oilTemp: number;
  coolantTemp: number;
  fuelFlow: number;
  fuelPressure: number;
  map: number;
  boostBar: number;
  wastegatePct: number;
  vibrationRms: number;
  ambientTemp: number;
  altitude: number;
  electricalPower: number;
}
