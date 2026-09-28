import {
  DroneTelemetryData,
  FlightMode,
  SystemStatus,
  MotorTelemetry,
  Waypoint,
} from '../types/telemetry';
import { AeroEngineTelemetry, EngineTelemetryHistoryPoint, EngineOperatingMode } from '../types/engine';
import { ActiveFault, EventLogEntry, SyncStatus } from '../types/simulation';
import { APP_CONFIG } from './config';

// 15 Waypoint Survey Mission Grid around base coordinates
const SURVEY_WAYPOINTS: Waypoint[] = [
  { id: 1, lat: 37.7749, lng: -122.4194, altitude: 80, x: 0, y: 0, reached: true, name: 'WP-01 Home / Launch' },
  { id: 2, lat: 37.7758, lng: -122.4182, altitude: 90, x: 120, y: 80, reached: true, name: 'WP-02 Perimeter North' },
  { id: 3, lat: 37.7769, lng: -122.4168, altitude: 95, x: 260, y: 150, reached: true, name: 'WP-03 Grid Alpha' },
  { id: 4, lat: 37.7778, lng: -122.4150, altitude: 100, x: 420, y: 210, reached: true, name: 'WP-04 Grid Beta' },
  { id: 5, lat: 37.7765, lng: -122.4132, altitude: 100, x: 550, y: 120, reached: true, name: 'WP-05 Boundary East' },
  { id: 6, lat: 37.7750, lng: -122.4118, altitude: 100, x: 680, y: 20, reached: true, name: 'WP-06 Transect 1' },
  { id: 7, lat: 37.7735, lng: -122.4128, altitude: 98, x: 600, y: -110, reached: false, name: 'WP-07 Sensor Scan Point' },
  { id: 8, lat: 37.7720, lng: -122.4145, altitude: 95, x: 450, y: -230, reached: false, name: 'WP-08 Thermal Imaging' },
  { id: 9, lat: 37.7710, lng: -122.4165, altitude: 95, x: 300, y: -310, reached: false, name: 'WP-09 Grid Gamma' },
  { id: 10, lat: 37.7715, lng: -122.4188, altitude: 90, x: 140, y: -270, reached: false, name: 'WP-10 Perimeter South' },
  { id: 11, lat: 37.7728, lng: -122.4205, altitude: 85, x: -20, y: -160, reached: false, name: 'WP-11 Sector Delta' },
  { id: 12, lat: 37.7740, lng: -122.4220, altitude: 85, x: -150, y: -60, reached: false, name: 'WP-12 West Corridor' },
  { id: 13, lat: 37.7755, lng: -122.4210, altitude: 80, x: -70, y: 50, reached: false, name: 'WP-13 Approach Corridor' },
  { id: 14, lat: 37.7752, lng: -122.4200, altitude: 75, x: 20, y: 30, reached: false, name: 'WP-14 Final Approach' },
  { id: 15, lat: 37.7749, lng: -122.4194, altitude: 50, x: 0, y: 0, reached: false, name: 'WP-15 Recovery Zone' },
];

export class SimulationEngine {
  private isRunning: boolean = true;
  private simSpeed: number = 1.0;
  private tickIntervalMs: number = 50; // 20 Hz
  private timer: number | null = null;
  
  // Physics state
  private simTime: number = 0;
  private currentWaypointIndex: number = 6; // WP-07
  private droneX: number = 580;
  private droneY: number = -85;
  private droneZ: number = 96.8;
  
  // Targets
  private targetZ: number = 100.0;
  private targetSpeed: number = 20.0;
  private targetHeading: number = 120.0;
  private targetRoll: number = 0.0;
  private targetPitch: number = 0.0;

  // Actuals
  private actualRoll: number = 1.8;
  private actualPitch: number = -0.6;
  private actualYaw: number = 117.0;
  private actualSpeed: number = 19.4;
  private actualVerticalSpeed: number = 0.2;

  // Battery
  private batteryPct: number = 78.4;
  private batteryVoltage: number = 22.8;
  private batteryTemp: number = 34.0;
  private batteryCapacityMah: number = 10000;
  private cellVoltages: number[] = [3.80, 3.81, 3.79, 3.80, 3.80, 3.80];

  // Environment
  private windSpeed: number = 8.4;
  private windDirection: number = 245.0;
  private ambientTemp: number = 27.0;

  // Aero-Piston Engine State (Rotax 914F Turbo)
  private engineThrottle: number = 82.0;
  private engineHours: number = 1420.4;
  private engineFlightHours: number = 1420.4;
  private engineCycles: number = 842;
  private fuelRemainingL: number = 64.5;
  private fuelConsumedL: number = 25.5;
  private engineHistory: EngineTelemetryHistoryPoint[] = [];

  // Active Faults
  private activeFaults: Map<string, ActiveFault> = new Map();
  
  // Event log
  private eventLogs: EventLogEntry[] = [
    {
      id: 'evt-init-1',
      timestamp: '18:51:58',
      isoTime: Date.now() - 60000,
      level: 'INFO',
      source: 'FLIGHT_CONTROLLER',
      message: 'Mission initialized in AUTO navigation mode (Survey 01)',
    },
    {
      id: 'evt-init-2',
      timestamp: '18:52:12',
      isoTime: Date.now() - 45000,
      level: 'INFO',
      source: 'AI_ANOMALY',
      message: 'LSTM trajectory prediction model synchronized (20 Hz feed)',
    },
    {
      id: 'evt-init-3',
      timestamp: '18:52:21',
      isoTime: Date.now() - 30000,
      level: 'INFO',
      source: 'NAVIGATION',
      message: 'Waypoint 06 reached successfully. Transitioning to WP-07',
    },
    {
      id: 'evt-init-4',
      timestamp: '18:52:29',
      isoTime: Date.now() - 15000,
      level: 'INFO',
      source: 'ENVIRONMENT',
      message: 'Ambient wind shift detected: 8.4 m/s at 245°',
    },
  ];

  // History breadcrumbs
  private history: Array<{ x: number; y: number; z: number; timestamp: number }> = [];

  // Subscribers
  private subscribers: Array<(data: DroneTelemetryData, faults: ActiveFault[], logs: EventLogEntry[], sync: SyncStatus) => void> = [];

  constructor() {
    // Generate initial history trail
    const steps = 40;
    for (let i = 0; i < steps; i++) {
      const frac = i / steps;
      this.history.push({
        x: 100 + frac * 480,
        y: 50 - frac * 135,
        z: 80 + frac * 16.8,
        timestamp: Date.now() - (steps - i) * 1000,
      });
    }
    this.start();
  }

  public start() {
    if (this.timer) clearInterval(this.timer);
    this.isRunning = true;
    this.timer = window.setInterval(() => this.tick(), this.tickIntervalMs);
  }

  public pause() {
    this.isRunning = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.notify();
  }

  public reset() {
    this.droneX = 0;
    this.droneY = 0;
    this.droneZ = 96.8;
    this.currentWaypointIndex = 0;
    this.batteryPct = 98.0;
    this.batteryVoltage = 24.6;
    this.batteryTemp = 28.0;
    this.actualRoll = 0;
    this.actualPitch = 0;
    this.actualYaw = 0;
    this.actualSpeed = 18.0;
    this.activeFaults.clear();
    this.history = [];
    this.logEvent('INFO', 'FLIGHT_CONTROLLER', 'Simulation reset to origin WP-01');
    this.notify();
  }

  public setSpeed(speed: 0.5 | 1 | 2 | 5) {
    this.simSpeed = speed;
    this.logEvent('INFO', 'FLIGHT_CONTROLLER', `Simulation time multiplier set to ${speed}×`);
    this.notify();
  }

  public setWind(speed: number, dir: number) {
    this.windSpeed = speed;
    this.windDirection = dir;
    this.logEvent('INFO', 'ENVIRONMENT', `Wind condition updated: ${speed.toFixed(1)} m/s at ${Math.round(dir)}°`);
    this.notify();
  }

  public injectFault(type: ActiveFault['type'], severity: number = 1.0) {
    const faultLabels: Record<ActiveFault['type'], { label: string; desc: string; source: EventLogEntry['source']; level: EventLogEntry['level'] }> = {
      // Turbocharger & TCU System
      TURBO_WASTEGATE_STUCK: {
        label: 'Turbocharger Wastegate Open / Stuck',
        desc: 'Wastegate stuck in bypass position; inability to maintain 35.4 inHg boost manifold pressure.',
        source: 'FAULT_ENGINE',
        level: 'WARN',
      },
      TCU_FAULT: {
        label: 'Turbocharger TCU Electronic Fault',
        desc: 'TCU electronics reporting servo actuator fault; boost fallback to mechanical wastegate safety mode.',
        source: 'FAULT_ENGINE',
        level: 'WARN',
      },
      TURBO_OVERBOOST: {
        label: 'Turbocharger Wastegate Stuck Closed / Overboost',
        desc: 'Wastegate fails to relieve turbine pressure; manifold boost exceeds 39.9 inHg takeoff limit.',
        source: 'FAULT_ENGINE',
        level: 'CRITICAL',
      },
      TURBO_DEGRADATION: {
        label: 'Turbocharger Compressor Aero / Bearing Degradation',
        desc: 'Turbine drag and aerodynamic fouling; spool-up lag and loss of rated takeoff power.',
        source: 'FAULT_ENGINE',
        level: 'WARN',
      },
      // Fuel System & Twin Bing 64 Carburetors
      FUEL_PUMP_1_FAILURE: {
        label: 'Electric Fuel Pump 1 Trip / Cutoff',
        desc: 'Primary 12V fuel pump electrical trip; automatic switchover to redundant standby fuel pump 2.',
        source: 'FAULT_ENGINE',
        level: 'WARN',
      },
      FUEL_PUMP_2_FAILURE: {
        label: 'Auxiliary Fuel Pump 2 Electrical Loss',
        desc: 'Secondary electric fuel pump offline; loss of redundant fuel delivery capability.',
        source: 'FAULT_ENGINE',
        level: 'WARN',
      },
      CARBURETOR_IMBALANCE: {
        label: 'Bing 64 Twin Carburetor Imbalance',
        desc: 'Carburetor 1 vs 2 throttle linkage synchronization deviation; differential vacuum and mixture skew.',
        source: 'FAULT_ENGINE',
        level: 'WARN',
      },
      FUEL_SYSTEM_LEAK: {
        label: 'Fuel Supply Pressure Drop & Regulator Leak',
        desc: 'Diaphragm fuel pressure regulator leak and fuel delivery pressure drop below airbox+0.25 bar nominal.',
        source: 'FAULT_ENGINE',
        level: 'CRITICAL',
      },
      // Dual Electronic Ignition (Ducati CDI)
      IGNITION_A_FAILURE: {
        label: 'Ducati CDI Ignition Channel A Drop',
        desc: 'Dual ignition circuit A shutdown; engine operating on Ignition Circuit B only with single-spark RPM drop.',
        source: 'FAULT_ENGINE',
        level: 'WARN',
      },
      IGNITION_B_FAILURE: {
        label: 'Ducati CDI Ignition Channel B Drop',
        desc: 'Dual ignition circuit B shutdown; engine operating on Ignition Circuit A only with single-spark RPM drop.',
        source: 'FAULT_ENGINE',
        level: 'WARN',
      },
      CYLINDER_MISFIRE: {
        label: 'Cylinder 3 Ignition Misfire',
        desc: 'Dual CDI spark failure on cylinder 3 causing thermal drop and rotational hunting.',
        source: 'FAULT_ENGINE',
        level: 'WARN',
      },
      // Mixed Cooling System
      ENGINE_OVERHEATING: {
        label: 'Engine Thermodynamic Overheating',
        desc: 'CHT and Coolant temperature rapid rise exceeding 135°C thermal limit.',
        source: 'FAULT_ENGINE',
        level: 'CRITICAL',
      },
      COOLANT_TEMP_RISE: {
        label: 'Cylinder Head Coolant Loop Thermal Surge',
        desc: 'Closed-loop coolant exit temperature exceeding 115°C; radiator thermal saturation.',
        source: 'FAULT_ENGINE',
        level: 'CRITICAL',
      },
      REDUCED_COOLANT_FLOW: {
        label: 'Coolant Circulation Pump Cavitation / Flow Loss',
        desc: 'Coolant flow drops below 18 L/min; rapid cylinder head thermal divergence on rear cylinders.',
        source: 'FAULT_ENGINE',
        level: 'WARN',
      },
      // Dry-Sump Forced Lubrication System
      OIL_PRESSURE_LOSS: {
        label: 'Lubrication Low Oil Pressure',
        desc: 'Oil pump scavenge failure or line loss; pressure dropped below 1.5 bar threshold.',
        source: 'FAULT_ENGINE',
        level: 'CRITICAL',
      },
      HIGH_OIL_TEMP: {
        label: 'Oil Cooler Bypass Failure / Thermal Redline',
        desc: 'Oil temperature surges beyond 130°C redline; thermal viscosity breakdown hazard.',
        source: 'FAULT_ENGINE',
        level: 'CRITICAL',
      },
      OIL_SYSTEM_DEGRADATION: {
        label: 'Oil Scavenge Aeration & Chip Detector Warning',
        desc: 'Foaming in dry-sump tank and fine particulate on magnetic drain plug; fluctuating oil pressure.',
        source: 'FAULT_ENGINE',
        level: 'WARN',
      },
      // Propeller Reduction Gearbox (2.43:1) & Mechanical
      GEARBOX_VIBRATION: {
        label: 'Propeller Reduction Gearbox Mechanical Flutter',
        desc: 'Gearbox dog clutch overload vibration spike (> 5.5 mm/s) and bearing casing thermal surge.',
        source: 'FAULT_ENGINE',
        level: 'CRITICAL',
      },
      GEARBOX_TEMP_INCREASE: {
        label: 'Reduction Gearbox Housing Overheating',
        desc: 'Gearbox casing temperature exceeding 115°C; tooth friction or inadequate lubrication.',
        source: 'FAULT_ENGINE',
        level: 'WARN',
      },
      BEARING_DEGRADATION: {
        label: 'Crankshaft Plain Journal Bearing Wear',
        desc: 'Hydrodynamic bearing wear inducing 1X vibration harmonics and elevated oil temperature.',
        source: 'FAULT_ENGINE',
        level: 'CRITICAL',
      },
      VIBRATION_ANOMALY: {
        label: 'Aero-Piston Excessive Mechanical Vibration',
        desc: 'Severe 1X-2X crankshaft harmonic vibration anomaly exceeding 5.5 mm/s RMS.',
        source: 'FAULT_ENGINE',
        level: 'WARN',
      },
      // Exhaust System
      EXHAUST_RESTRICTION: {
        label: 'Exhaust Collector / Pre-Turbine Restriction',
        desc: 'Pre-turbine backpressure surge; EGT rises above 950°C redline and engine power chokes.',
        source: 'FAULT_ENGINE',
        level: 'CRITICAL',
      },
      CYLINDER_EGT_IMBALANCE: {
        label: 'Cylinder Bank EGT Spread Imbalance',
        desc: 'Combustion bank mixture skew; differential EGT between banks exceeds 85°C.',
        source: 'FAULT_ENGINE',
        level: 'WARN',
      },
      // Electrical & Generation
      GENERATOR_FAILURE: {
        label: 'Integrated 250W AC Generator Cutout',
        desc: 'Internal AC stator generator loss; avionics and TCU running on buffer battery drain.',
        source: 'FAULT_ENGINE',
        level: 'WARN',
      },
      ALTERNATOR_FAILURE: {
        label: 'External 40A Alternator Regulator Dropout',
        desc: 'Engine-driven 28V alternator dropout; main DC bus voltage sags to battery buffer level.',
        source: 'FAULT_ENGINE',
        level: 'WARN',
      },
    };

    const info = faultLabels[type];
    const fault: ActiveFault = {
      id: `fault-${Date.now()}`,
      type,
      severity,
      injectedAt: Date.now(),
      label: info.label,
      description: info.desc,
    };

    this.activeFaults.set(type, fault);
    this.logEvent(info.level, info.source, `[FAULT INJECTED] ${info.label}`);
    this.notify();
  }

  public clearFault(type: ActiveFault['type']) {
    if (this.activeFaults.has(type)) {
      const f = this.activeFaults.get(type)!;
      this.activeFaults.delete(type);
      this.logEvent('INFO', 'FAULT_ENGINE', `Fault cleared: ${f.label}`);
      this.notify();
    }
  }

  public clearAllFaults() {
    this.activeFaults.clear();
    this.logEvent('INFO', 'FAULT_ENGINE', 'All injected simulated faults cleared. Systems returned to nominal.');
    this.notify();
  }

  public getActiveFaults(): ActiveFault[] {
    return Array.from(this.activeFaults.values());
  }

  public setThrottle(pct: number) {
    this.engineThrottle = Math.max(0, Math.min(100, pct));
    this.logEvent('INFO', 'FLIGHT_CONTROLLER', `Powerplant throttle demand set to ${this.engineThrottle.toFixed(0)}%`);
  }

  public getEngineHistory(): EngineTelemetryHistoryPoint[] {
    return [...this.engineHistory];
  }

  public subscribe(callback: (data: DroneTelemetryData, faults: ActiveFault[], logs: EventLogEntry[], sync: SyncStatus) => void) {
    this.subscribers.push(callback);
    // Push immediate current state
    this.notify();
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== callback);
    };
  }

  private logEvent(level: EventLogEntry['level'], source: EventLogEntry['source'], message: string) {
    const d = new Date();
    const timestamp = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
    const entry: EventLogEntry = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp,
      isoTime: Date.now(),
      level,
      source,
      message,
    };
    this.eventLogs.unshift(entry);
    if (this.eventLogs.length > 80) this.eventLogs.pop();
  }

  private tick() {
    if (!this.isRunning) return;

    const dt = (this.tickIntervalMs / 1000) * this.simSpeed;
    this.simTime += dt;

    // Check active faults - Rotax 914 F Subsystems
    const hasWastegateStuck = this.activeFaults.has('TURBO_WASTEGATE_STUCK');
    const hasTcuFault = this.activeFaults.has('TCU_FAULT');
    const hasTurboOverboost = this.activeFaults.has('TURBO_OVERBOOST');
    const hasTurboDegrade = this.activeFaults.has('TURBO_DEGRADATION');
    const hasPump1Fail = this.activeFaults.has('FUEL_PUMP_1_FAILURE');
    const hasPump2Fail = this.activeFaults.has('FUEL_PUMP_2_FAILURE');
    const hasCarbImbalance = this.activeFaults.has('CARBURETOR_IMBALANCE');
    const hasFuelLeak = this.activeFaults.has('FUEL_SYSTEM_LEAK');
    const hasIgnAFail = this.activeFaults.has('IGNITION_A_FAILURE');
    const hasIgnBFail = this.activeFaults.has('IGNITION_B_FAILURE');
    const hasCylinderMisfire = this.activeFaults.has('CYLINDER_MISFIRE');
    const hasOverheating = this.activeFaults.has('ENGINE_OVERHEATING');
    const hasCoolantRise = this.activeFaults.has('COOLANT_TEMP_RISE');
    const hasReducedCoolantFlow = this.activeFaults.has('REDUCED_COOLANT_FLOW');
    const hasOilPressureLoss = this.activeFaults.has('OIL_PRESSURE_LOSS');
    const hasHighOilTemp = this.activeFaults.has('HIGH_OIL_TEMP');
    const hasOilDegrade = this.activeFaults.has('OIL_SYSTEM_DEGRADATION');
    const hasGearboxVib = this.activeFaults.has('GEARBOX_VIBRATION');
    const hasGearboxOverheat = this.activeFaults.has('GEARBOX_TEMP_INCREASE');
    const hasBearingDegrade = this.activeFaults.has('BEARING_DEGRADATION');
    const hasVibAnomaly = this.activeFaults.has('VIBRATION_ANOMALY');
    const hasExhaustRestrict = this.activeFaults.has('EXHAUST_RESTRICTION');
    const hasEgtImbalance = this.activeFaults.has('CYLINDER_EGT_IMBALANCE');
    const hasGenFail = this.activeFaults.has('GENERATOR_FAILURE');
    const hasAltFail = this.activeFaults.has('ALTERNATOR_FAILURE');

    // 1. Waypoint Navigation Kinematics
    const targetWp = SURVEY_WAYPOINTS[this.currentWaypointIndex];
    if (targetWp) {
      const dx = targetWp.x - this.droneX;
      const dy = targetWp.y - this.droneY;
      const distToWp = Math.sqrt(dx * dx + dy * dy);

      // Desired heading to waypoint
      const desiredHeading = (Math.atan2(dy, dx) * 180) / Math.PI;
      const normalizedDesiredHeading = (desiredHeading + 360) % 360;

      // Heading error
      let headingDiff = normalizedDesiredHeading - this.targetHeading;
      if (headingDiff > 180) headingDiff -= 360;
      if (headingDiff < -180) headingDiff += 360;

      this.targetHeading = (this.targetHeading + headingDiff * 0.05 * this.simSpeed) % 360;
      if (this.targetHeading < 0) this.targetHeading += 360;

      // Progress along route
      if (distToWp < 25) {
        targetWp.reached = true;
        this.logEvent('INFO', 'NAVIGATION', `Waypoint ${targetWp.name || targetWp.id} reached successfully`);
        this.currentWaypointIndex = (this.currentWaypointIndex + 1) % SURVEY_WAYPOINTS.length;
      }
    }

    // 2. Realistic Drone Attitude & Movement Dynamics
    const effectiveWind = this.windSpeed;
    const windRad = (this.windDirection * Math.PI) / 180;
    const windForceX = Math.cos(windRad) * effectiveWind * 0.04;
    const windForceY = Math.sin(windRad) * effectiveWind * 0.04;

    // Small realistic oscillations
    const microTurbulence = (Math.sin(this.simTime * 2.5) * 0.8 + Math.cos(this.simTime * 4.1) * 0.4) * (effectiveWind / 8.0);

    // Target vs actual smoothing (PID-like response)
    const yawDelta = this.targetHeading - this.actualYaw;
    this.actualYaw += yawDelta * 0.08 * dt * 20;

    // Bank angle during turning and wind resistance
    const targetRollCalculated = (yawDelta * -0.2) + (windForceY * -3.0) + microTurbulence;
    this.targetRoll = targetRollCalculated;
    this.actualRoll += (this.targetRoll - this.actualRoll) * 0.15;

    // Pitch for forward acceleration
    const targetPitchCalculated = -0.5 + Math.sin(this.simTime * 0.8) * 0.3 + (windForceX * -2.0);
    this.targetPitch = targetPitchCalculated;
    this.actualPitch += (this.targetPitch - this.actualPitch) * 0.15;

    // Velocity integration
    const headingRad = (this.actualYaw * Math.PI) / 180;
    const forwardSpeed = this.targetSpeed + (Math.sin(this.simTime * 0.5) * 0.6);
    this.actualSpeed = Math.max(0, forwardSpeed);
    
    const vx = Math.cos(headingRad) * this.actualSpeed + windForceX;
    const vy = Math.sin(headingRad) * this.actualSpeed + windForceY;

    this.droneX += vx * dt;
    this.droneY += vy * dt;

    // Altitude tracking
    const altDiff = this.targetZ - this.droneZ;
    this.actualVerticalSpeed = altDiff * 0.4 + (Math.sin(this.simTime * 1.5) * 0.15);
    this.droneZ += this.actualVerticalSpeed * dt;
    if (this.droneZ < 0) this.droneZ = 0;

    // 3. Propulsion Motors calculation
    const baseRpm = 8420;
    const loadPercent = Math.min(100, Math.max(10, 60 + (this.actualSpeed / 20) * 15 + (effectiveWind / 15) * 10));

    let m1Rpm = baseRpm + (Math.sin(this.simTime * 10) * 40);
    let m2Rpm = baseRpm + (Math.cos(this.simTime * 10) * 35);
    let m3Rpm = baseRpm + (Math.sin(this.simTime * 8) * 45);
    let m4Rpm = baseRpm + (Math.cos(this.simTime * 8) * 38);

    const motors: [MotorTelemetry, MotorTelemetry, MotorTelemetry, MotorTelemetry] = [
      {
        id: 1,
        name: 'M1',
        position: 'Front-Right',
        direction: 'CCW',
        rpm: Math.round(m1Rpm),
        loadPercent: Math.round(loadPercent + 2),
        current: parseFloat((2.1 * (loadPercent / 60)).toFixed(1)),
        voltage: 22.8,
        power: parseFloat((47.8 * (loadPercent / 60)).toFixed(1)),
        temperature: parseFloat((41.2 + (loadPercent / 100) * 8).toFixed(1)),
        status: 'NORMAL',
        vibrationLevel: 0.8,
      },
      {
        id: 2,
        name: 'M2',
        position: 'Front-Left',
        direction: 'CW',
        rpm: Math.round(m2Rpm),
        loadPercent: Math.round(loadPercent - 1),
        current: parseFloat((2.1 * (loadPercent / 60)).toFixed(1)),
        voltage: 22.8,
        power: parseFloat((47.8 * (loadPercent / 60)).toFixed(1)),
        temperature: parseFloat((40.5 + (loadPercent / 100) * 7.5).toFixed(1)),
        status: 'NORMAL',
        vibrationLevel: 0.9,
      },
      {
        id: 3,
        name: 'M3',
        position: 'Rear-Right',
        direction: 'CW',
        rpm: Math.round(m3Rpm),
        loadPercent: Math.round(loadPercent + 3),
        current: parseFloat((2.1 * (loadPercent / 60)).toFixed(1)),
        voltage: 22.8,
        power: parseFloat((47.8 * (loadPercent / 60)).toFixed(1)),
        temperature: parseFloat((42.1 + (loadPercent / 100) * 8.2).toFixed(1)),
        status: 'NORMAL',
        vibrationLevel: 0.8,
      },
      {
        id: 4,
        name: 'M4',
        position: 'Rear-Left',
        direction: 'CCW',
        rpm: Math.round(m4Rpm),
        loadPercent: Math.round(loadPercent),
        current: parseFloat((2.1 * (loadPercent / 60)).toFixed(1)),
        voltage: 22.8,
        power: parseFloat((47.8 * (loadPercent / 60)).toFixed(1)),
        temperature: parseFloat((41.0 + (loadPercent / 100) * 7.8).toFixed(1)),
        status: 'NORMAL',
        vibrationLevel: 0.9,
      },
    ];

    const totalCurrent = motors.reduce((sum, m) => sum + m.current, 0);
    const totalPower = motors.reduce((sum, m) => sum + m.power, 0);

    // 4. Battery drain dynamics
    const drainPerSec = (totalCurrent / (this.batteryCapacityMah / 1000)) * (100 / 3600);
    this.batteryPct = Math.max(0, this.batteryPct - drainPerSec * dt);
    
    // Voltage curve for 6S LiPo
    const baseVoltage = 19.8 + (this.batteryPct / 100) * 5.4; // 19.8V empty to 25.2V full
    this.batteryVoltage = baseVoltage - (totalCurrent * 0.04);
    
    // BMS temperature
    this.batteryTemp = 32.0 + (totalCurrent / 10) * 3.5;
    const remainingMinutes = this.batteryPct > 0 ? (this.batteryPct / (drainPerSec * 60)) : 0;

    // 5. Geographic coordinates translation
    // 1 deg Lat approx 111,000m, 1 deg Lon approx 88,000m at 37.7 deg N
    const currentLat = APP_CONFIG.baseCoordinates.lat + (this.droneY / 111000);
    const currentLng = APP_CONFIG.baseCoordinates.lng + (this.droneX / 88000);

    // 6. Mission metrics
    const totalWps = SURVEY_WAYPOINTS.length;
    const distTravelledKm = parseFloat((2.8 + (this.simTime * 0.0194)).toFixed(2));
    const distRemainingKm = Math.max(0, parseFloat((6.2 - distTravelledKm).toFixed(2)));
    const missionProgress = Math.min(100, Math.round((this.currentWaypointIndex / totalWps) * 100));

    // Append to history every 1.5 simulated seconds
    if (Math.floor(this.simTime / 1.5) !== Math.floor((this.simTime - dt) / 1.5)) {
      this.history.push({
        x: this.droneX,
        y: this.droneY,
        z: this.droneZ,
        timestamp: Date.now(),
      });
      if (this.history.length > 100) this.history.shift();
    }

    // EKF & Sensor Simulation
    const baroAlt = this.droneZ + (Math.sin(this.simTime * 3) * 0.1);
    const gpsSats = 18;
    const gpsHdop = 0.74;

    const noiseMultiplier = 1.0;

    const hasCriticalFault = hasOverheating || hasOilPressureLoss || hasGearboxVib || hasCoolantRise || hasTurboOverboost || hasExhaustRestrict || hasFuelLeak || hasBearingDegrade || hasHighOilTemp;
    const hasWarningFault = hasWastegateStuck || hasTcuFault || hasTurboDegrade || hasPump1Fail || hasPump2Fail || hasCarbImbalance || hasIgnAFail || hasIgnBFail || hasCylinderMisfire || hasReducedCoolantFlow || hasOilDegrade || hasGearboxOverheat || hasVibAnomaly || hasEgtImbalance || hasGenFail || hasAltFail;

    const systemStatus: SystemStatus = hasCriticalFault
      ? 'CRITICAL'
      : hasWarningFault
      ? 'WARNING'
      : 'NORMAL';

    const flightMode: FlightMode = hasCriticalFault ? 'FAILSAFE' : 'AUTO';

    // 7. AERO-PISTON ENGINE DIGITAL TWIN CALCULATIONS (ROTAX 914 F)
    const altMsl = parseFloat((APP_CONFIG.baseCoordinates.altMsl + this.droneZ).toFixed(1));
    const ambientPressHpa = parseFloat((1013.25 * Math.pow(Math.max(0.1, 1 - 0.0000225577 * altMsl), 5.25588)).toFixed(1));
    const ambientPressInHg = parseFloat((ambientPressHpa * 0.02953).toFixed(2));
    const ambientPressBar = parseFloat((ambientPressHpa / 1000).toFixed(3));
    const densityAltitudeM = Math.round(altMsl + (15 - this.ambientTemp) * 36.6);

    const flightPhase: 'GROUND' | 'CLIMB' | 'CRUISE' | 'DESCENT' | 'APPROACH' = 
      this.droneZ < 1 ? 'GROUND' :
      this.actualVerticalSpeed > 1.5 ? 'CLIMB' :
      this.actualVerticalSpeed < -1.5 ? 'DESCENT' : 'CRUISE';

    const commandedThrottle = this.engineThrottle;
    // Rotax 914 F throttle travel includes 104% continuous power detent and 115% takeoff (manual p. 95)
    const effectiveThrottle = Math.max(30, Math.min(115, commandedThrottle + (this.actualVerticalSpeed * 4.0)));
    const engineLoad = Math.max(20, Math.min(100, 42 + (effectiveThrottle / 115) * 55));

    // Rotax 914 F Engine RPM: Idle 1400, Cruise 4800-5200, Takeoff 5800 RPM
    const baseEngineRpm = 1400 + (effectiveThrottle / 115) * 4400;
    let actualEngineRpm = baseEngineRpm + (Math.sin(this.simTime * 8) * 14);
    if (hasCylinderMisfire) {
      actualEngineRpm -= 420 + Math.sin(this.simTime * 24) * 110;
    }
    if (hasIgnAFail || hasIgnBFail) {
      actualEngineRpm -= 75; // Standard mag/CDI drop on single ignition
    }
    if (hasCarbImbalance) {
      actualEngineRpm -= 85;
    }
    if (hasExhaustRestrict) {
      actualEngineRpm -= 280;
    }
    if (hasTurboDegrade) {
      actualEngineRpm -= 160;
    }
    const targetRpm = Math.round(baseEngineRpm);
    const rpmError = targetRpm - Math.round(actualEngineRpm);
    const crankshaftSpeed = parseFloat(((actualEngineRpm * 2 * Math.PI) / 60).toFixed(1)); // rad/s

    // Propeller Speed Reduction Gearbox: i = 2.42857 (51T / 21T) per Manual Section 20.1
    const GEAR_REDUCTION_RATIO = 2.42857;
    const propRpm = Math.round(actualEngineRpm / GEAR_REDUCTION_RATIO);

    // Torque & Power Output (Rotax 914 F: 144 Nm max torque @ 4,900 RPM, 84.5 kW / 115 HP max takeoff)
    let powerDerating = 1.0;
    if (hasWastegateStuck || hasTcuFault) powerDerating *= 0.72;
    if (hasTurboDegrade) powerDerating *= 0.80;
    if (hasExhaustRestrict) powerDerating *= 0.75;
    if (hasCylinderMisfire) powerDerating *= 0.78;
    const torque = parseFloat((actualEngineRpm < 50 ? 0 : (102 + (engineLoad / 100) * 38.5 + Math.sin(this.simTime * 2) * 1.5) * powerDerating).toFixed(1));
    const powerKw = parseFloat(((torque * crankshaftSpeed) / 1000).toFixed(1));
    const powerHp = parseFloat((powerKw * 1.34102).toFixed(1));

    // Turbocharger & Wastegate Induction Loop (TCU Automatic Regulation)
    // Physical chain: Throttle -> Engine Load -> Exhaust Energy -> Turbocharger -> Boost -> MAP
    let targetMapInHg = 28.5 + (effectiveThrottle / 115) * 10.5; // Up to 39.0 inHg takeoff
    if (hasTurboOverboost) {
      targetMapInHg = 43.8; // Jammed closed overboost
    } else if (hasWastegateStuck || hasTcuFault) {
      targetMapInHg = ambientPressInHg * 0.94; // Loss of boost: manifold vacuum
    } else if (hasTurboDegrade) {
      targetMapInHg = Math.min(31.2, targetMapInHg);
    }
    const mapInHg = parseFloat((targetMapInHg + Math.sin(this.simTime * 3) * 0.18).toFixed(1));
    const mapBar = parseFloat((mapInHg * 0.0338639).toFixed(2));
    const boostDeltaBar = parseFloat(Math.max(0, mapBar - ambientPressBar).toFixed(2));

    // TCU automatically modulates wastegate to compensate for altitude ambient pressure drop
    const wastegatePct = hasTurboOverboost
      ? 0
      : hasWastegateStuck
      ? 100
      : hasTcuFault
      ? 85
      : Math.round(Math.max(8, Math.min(95, 78 - (boostDeltaBar / 0.35) * 55 + (altMsl / 4800) * -12)));
    const wastegateCmd = hasTurboOverboost ? 100 : hasWastegateStuck ? 20 : wastegatePct;
    const airMassFlow = parseFloat((actualEngineRpm < 50 ? 0 : 75 + (engineLoad / 100) * 135 + (boostDeltaBar * 35)).toFixed(1));
    const iatC = parseFloat((24.0 + (engineLoad / 100) * 16 + (boostDeltaBar * 14) + (hasTurboOverboost ? 28.0 : 0)).toFixed(1));
    const airboxTempC = parseFloat((iatC + (boostDeltaBar * 12)).toFixed(1));
    const turboRpm = Math.round(actualEngineRpm < 50 ? 0 : hasTurboDegrade ? 58000 : 38000 + (powerKw / 84.5) * 88000 + Math.sin(this.simTime * 5) * 1200);

    // Fuel System Dynamics (Rotax 914 F: 2 Electric Vane Pumps & Regulated Pressure)
    // Fuel pressure is dynamically held at Airbox Pressure + 0.25 bar (nominal per manual p. 85)
    const baseFuelFlow = (powerKw * 0.285) / 0.74; // BSFC ~285 g/kWh
    let fuelFlowLh = parseFloat(Math.max(6.5, baseFuelFlow + (Math.sin(this.simTime * 2.5) * 0.4)).toFixed(1));
    let fuelPressureBar = parseFloat((mapBar + 0.25 + (hasPump1Fail ? -0.12 : 0) + (hasPump2Fail ? -0.04 : 0) + (Math.sin(this.simTime * 4) * 0.02)).toFixed(2));
    if (hasFuelLeak) {
      fuelFlowLh = parseFloat((fuelFlowLh * 1.6).toFixed(1));
      fuelPressureBar = 1.78;
    }
    const fuelBurnPerSec = fuelFlowLh / 3600;
    this.fuelRemainingL = Math.max(0, this.fuelRemainingL - fuelBurnPerSec * dt);
    this.fuelConsumedL += fuelBurnPerSec * dt;
    const fuelRemainingPct = parseFloat(((this.fuelRemainingL / 90.0) * 100).toFixed(1));
    const airFuelRatio = parseFloat((14.7 + Math.sin(this.simTime * 1.2) * 0.2).toFixed(2));
    const lambdaVal = parseFloat((airFuelRatio / 14.7).toFixed(2));

    // Dual Bing 64 Constant-Depression Carburetors Telemetry
    const carbSlide1 = Math.round(Math.min(100, (airMassFlow / 240) * 100));
    const carbSlide2 = Math.round(carbSlide1 + (hasCylinderMisfire ? -14 : hasCarbImbalance ? -22 : 0) + Math.sin(this.simTime * 2) * 1.2);
    const carbBalance = hasCylinderMisfire ? 82.5 : hasCarbImbalance ? 71.4 : 98.8;

    // 4-Cylinder Boxer Combustion Dynamics (Per-Cylinder CHT & EGT)
    // Cyl 1: Left Front, Cyl 2: Right Front (Primary sensor), Cyl 3: Left Rear, Cyl 4: Right Rear
    const overheatFactor = hasOverheating ? 46.0 : 0.0;
    const misfireFactor = hasCylinderMisfire ? -42.0 : 0.0;
    const coolantFlowReductionCht = hasReducedCoolantFlow ? 38.0 : 0.0;
    const exhaustRestrictCht = hasExhaustRestrict ? 24.0 : 0.0;
    const baseCht = 94.0 + (engineLoad / 100) * 30.0 + overheatFactor + exhaustRestrictCht;
    const cyl1Cht = parseFloat((baseCht + 1.2 + Math.sin(this.simTime * 0.7) * 0.5).toFixed(1));
    const cyl2Cht = parseFloat((baseCht + 3.8 + Math.cos(this.simTime * 0.8) * 0.4).toFixed(1)); // Primary sensor hottest
    const cyl3Cht = parseFloat((baseCht + misfireFactor + coolantFlowReductionCht - 0.4 + Math.sin(this.simTime * 0.9) * 0.5).toFixed(1));
    const cyl4Cht = parseFloat((baseCht + coolantFlowReductionCht - 1.1 + Math.cos(this.simTime * 0.6) * 0.4).toFixed(1));
    const avgCht = parseFloat(((cyl1Cht + cyl2Cht + cyl3Cht + cyl4Cht) / 4).toFixed(1));
    const maxCht = Math.max(cyl1Cht, cyl2Cht, cyl3Cht, cyl4Cht);
    const minCht = Math.min(cyl1Cht, cyl2Cht, cyl3Cht, cyl4Cht);
    const chtSpread = parseFloat((maxCht - minCht).toFixed(1));
    const chtDeviations: [number, number, number, number] = [
      parseFloat((cyl1Cht - avgCht).toFixed(1)),
      parseFloat((cyl2Cht - avgCht).toFixed(1)),
      parseFloat((cyl3Cht - avgCht).toFixed(1)),
      parseFloat((cyl4Cht - avgCht).toFixed(1)),
    ];

    const baseEgt = 720.0 + (engineLoad / 100) * 92.0 + (hasOverheating ? 68.0 : 0.0) + (hasExhaustRestrict ? 175.0 : 0.0);
    const egtBankSkew = hasEgtImbalance ? 65.0 : 0.0;
    const cyl1Egt = Math.round(baseEgt + egtBankSkew + 5.0 + Math.sin(this.simTime * 1.5) * 3.0);
    const cyl2Egt = Math.round(baseEgt - egtBankSkew - 4.0 + Math.cos(this.simTime * 1.7) * 2.5);
    const cyl3Egt = Math.round(baseEgt + egtBankSkew + (hasCylinderMisfire ? -135 : 4.0) + Math.sin(this.simTime * 1.9) * 3.0);
    const cyl4Egt = Math.round(baseEgt - egtBankSkew - 2.0 + Math.cos(this.simTime * 1.3) * 2.5);
    const avgEgt = Math.round((cyl1Egt + cyl2Egt + cyl3Egt + cyl4Egt) / 4);
    const maxEgt = Math.max(cyl1Egt, cyl2Egt, cyl3Egt, cyl4Egt);
    const minEgt = Math.min(cyl1Egt, cyl2Egt, cyl3Egt, cyl4Egt);
    const egtSpread = maxEgt - minEgt;
    const egtDeviations: [number, number, number, number] = [
      cyl1Egt - avgEgt,
      cyl2Egt - avgEgt,
      cyl3Egt - avgEgt,
      cyl4Egt - avgEgt,
    ];

    // Dry-Sump Lubrication System (Separate Oil Tank + Main Pump + Scavenge Pump)
    let oilPressureBar = parseFloat((2.8 + (actualEngineRpm / 5800) * 1.8 + Math.sin(this.simTime * 4) * 0.04).toFixed(2));
    if (hasOilPressureLoss) {
      oilPressureBar = parseFloat(Math.max(0.6, 1.1 + Math.sin(this.simTime * 5) * 0.08).toFixed(2));
    } else if (hasHighOilTemp) {
      oilPressureBar = parseFloat(Math.max(1.2, oilPressureBar - 1.4).toFixed(2));
    } else if (hasBearingDegrade) {
      oilPressureBar = parseFloat(Math.max(1.4, oilPressureBar - 0.8).toFixed(2));
    } else if (hasOilDegrade) {
      oilPressureBar = parseFloat((oilPressureBar + Math.sin(this.simTime * 6) * 0.6).toFixed(2));
    }
    const expectedOilPressure = parseFloat((2.8 + (targetRpm / 5800) * 1.8).toFixed(2));
    const oilPressureDeviation = parseFloat((expectedOilPressure - oilPressureBar).toFixed(2));
    const oilTempC = parseFloat((82.0 + (engineLoad / 100) * 22.0 + (hasOverheating || hasOilPressureLoss ? 34.0 : 0.0) + (hasHighOilTemp ? 48.0 : 0.0) + (hasBearingDegrade ? 18.0 : 0.0)).toFixed(1));
    const oilFlowRateLmin = parseFloat((4.8 + (actualEngineRpm / 5800) * 3.2).toFixed(1));

    // Mixed Cooling System (Liquid Heads + Ram-Air Cylinders)
    const coolantTempC = parseFloat((82.0 + (engineLoad / 100) * 18.0 + (hasOverheating ? 30.0 : 0.0) + (hasCoolantRise ? 36.0 : 0.0)).toFixed(1));
    const coolantPressureBar = parseFloat((1.16 + (engineLoad / 100) * 0.14 + (hasCoolantRise ? 0.35 : 0)).toFixed(2));
    const coolantFlowLmin = parseFloat(((20.0 + (actualEngineRpm / 5800) * 40.0) * (hasReducedCoolantFlow ? 0.32 : 1.0)).toFixed(1)); // ~60 L/min max per manual
    const radiatorTempC = parseFloat((coolantTempC - 17.5).toFixed(1));
    const cylinderWallTempC = parseFloat((125.0 + (engineLoad / 100) * 42.0 + (hasOverheating ? 45.0 : 0.0) + (hasCoolantRise ? 22.0 : 0)).toFixed(1)); // max 200°C

    // Tri-Axial & RMS Mechanical Vibration Dynamics
    const baseVibRms = 1.6 + (actualEngineRpm / 5800) * 0.8;
    let vibRms = parseFloat((baseVibRms + Math.sin(this.simTime * 12) * 0.1).toFixed(2));
    if (hasVibAnomaly || hasCylinderMisfire) {
      vibRms = parseFloat((5.8 + Math.sin(this.simTime * 18) * 0.8).toFixed(2));
    } else if (hasBearingDegrade) {
      vibRms = parseFloat((6.75 + Math.sin(this.simTime * 16) * 0.6).toFixed(2));
    }
    const vibX = parseFloat((vibRms * 0.85 + Math.sin(this.simTime * 14) * 0.08).toFixed(2));
    const vibY = parseFloat((vibRms * 0.72 + Math.cos(this.simTime * 16) * 0.08).toFixed(2));
    const vibZ = parseFloat((vibRms * 1.15 + Math.sin(this.simTime * 10) * 0.12).toFixed(2));
    const vibPeak = parseFloat((vibRms * 1.72).toFixed(2));
    const dominantFreqHz = parseFloat((actualEngineRpm / 60).toFixed(1));
    const vibBaseline = 1.8;
    const vibDeviation = parseFloat((vibRms - vibBaseline).toFixed(2));

    // Dual Electronic Ignition (Ducati CDI)
    const ignitionTimingDeg = parseFloat((22.0 + (actualEngineRpm / 5800) * 4.0).toFixed(1));
    const ignitionAdvanceDeg = parseFloat((ignitionTimingDeg - 20.0).toFixed(1));
    const sparkPlugA: ['OK'|'FAULT', 'OK'|'FAULT', 'OK'|'FAULT', 'OK'|'FAULT'] = [
      hasIgnAFail ? 'FAULT' : 'OK',
      hasIgnAFail ? 'FAULT' : 'OK',
      hasIgnAFail || hasCylinderMisfire ? 'FAULT' : 'OK',
      hasIgnAFail ? 'FAULT' : 'OK',
    ];
    const sparkPlugB: ['OK'|'FAULT', 'OK'|'FAULT', 'OK'|'FAULT', 'OK'|'FAULT'] = [
      hasIgnBFail ? 'FAULT' : 'OK',
      hasIgnBFail ? 'FAULT' : 'OK',
      hasIgnBFail ? 'FAULT' : 'OK',
      hasIgnBFail ? 'FAULT' : 'OK',
    ];

    // Electrical System (Integrated 250W AC Generator + Optional Alternator)
    const alternatorVoltage = hasAltFail ? 24.1 : 28.4;
    const alternatorCurrent = hasAltFail ? 0.0 : parseFloat((11.5 + (engineLoad / 100) * 4.5).toFixed(1));
    const electricalPowerW = parseFloat((alternatorVoltage * alternatorCurrent).toFixed(1));
    const electricalLoadPct = Math.round((alternatorCurrent / 20.0) * 100);

    // Operational Modes & Provenance
    const engineMode: EngineOperatingMode =
      hasOverheating || hasOilPressureLoss || hasVibAnomaly || hasFuelLeak || hasWastegateStuck || hasCylinderMisfire || hasTurboOverboost || hasExhaustRestrict || hasBearingDegrade || hasHighOilTemp
        ? 'ABNORMAL'
        : effectiveThrottle > 105
        ? 'TAKEOFF'
        : flightPhase === 'CLIMB'
        ? 'CLIMB'
        : flightPhase === 'DESCENT'
        ? 'DESCENT'
        : actualEngineRpm > 4200
        ? 'CRUISE'
        : actualEngineRpm > 1800
        ? 'TAXI'
        : actualEngineRpm > 200
        ? 'IDLE'
        : 'OFF';

    const bsfc = parseFloat(((fuelFlowLh * 0.74 * 1000) / Math.max(1, powerKw)).toFixed(1));

    // Engine Hours & Maintenance Logging
    this.engineHours += (dt / 3600);
    this.engineFlightHours += (dt / 3600);
    const degradationIndex = parseFloat(Math.min(1.0, 0.076 + (this.engineHours - 1420.0) * 0.0005).toFixed(4));
    const healthIndex = hasOilPressureLoss
      ? 18.5
      : hasOverheating || hasCoolantRise
      ? 34.0
      : hasTurboOverboost
      ? 28.0
      : hasGearboxVib
      ? 38.0
      : hasExhaustRestrict
      ? 32.0
      : hasBearingDegrade
      ? 36.0
      : hasFuelLeak
      ? 46.0
      : hasHighOilTemp
      ? 42.0
      : hasVibAnomaly
      ? 52.0
      : hasCylinderMisfire
      ? 58.0
      : hasWastegateStuck || hasTcuFault
      ? 68.0
      : hasCarbImbalance || hasIgnAFail || hasIgnBFail
      ? 74.0
      : 94.2;

    const anomalyScore = hasOilPressureLoss || hasTurboOverboost || hasExhaustRestrict
      ? 0.98
      : hasOverheating || hasCoolantRise || hasBearingDegrade
      ? 0.94
      : hasGearboxVib || hasHighOilTemp || hasFuelLeak
      ? 0.88
      : hasVibAnomaly || hasCylinderMisfire
      ? 0.68
      : hasWastegateStuck || hasTcuFault || hasCarbImbalance
      ? 0.48
      : 0.03;

    // Assemble Unified Aero-Piston Engine Model (Rotax 914 F Specific)
    const engine: AeroEngineTelemetry = {
      identity: {
        model: 'Rotax 914 F',
        manufacturer: 'BRP-Rotax',
        serialNumber: 'SN-914-4420188',
        configuration: 'Configuration 3 (Governor & Vacuum Prepared)',
        tboHours: 2000,
      },
      operating: {
        rpm: Math.round(actualEngineRpm),
        targetRpm,
        rpmError,
        throttlePosition: parseFloat(effectiveThrottle.toFixed(1)),
        engineLoad: Math.round(engineLoad),
        torque,
        powerKw,
        powerHp,
        fuelFlowRate: fuelFlowLh,
        fuelPressure: fuelPressureBar,
        airFuelRatio,
        lambda: lambdaVal,
        map: mapInHg,
        iat: iatC,
        ambientPressure: ambientPressHpa,
        ambientTemperature: this.ambientTemp,
        operatingMode: engineMode,
        startStopState: actualEngineRpm > 400 ? 'RUNNING' : 'OFF',
        bsfcGkwh: bsfc,
        powerToWeightRatioKwPerKg: parseFloat((powerKw / 74.4).toFixed(3)),
      },
      cylinders: {
        cylinder_1: {
          id: 1,
          name: 'Cylinder 1 (Left Front)',
          bank: 'LEFT',
          position: 'FRONT',
          cht: cyl1Cht,
          egt: cyl1Egt,
          combustionHealth: 95,
          misfireIndication: false,
          chtDeviation: parseFloat((cyl1Cht - avgCht).toFixed(1)),
          egtDeviation: cyl1Egt - avgEgt,
          cylinderHealth: 95,
          anomalyScore: 0.03,
        },
        cylinder_2: {
          id: 2,
          name: 'Cylinder 2 (Right Front - Primary Sensor)',
          bank: 'RIGHT',
          position: 'FRONT',
          cht: cyl2Cht,
          egt: cyl2Egt,
          combustionHealth: hasOverheating ? 52 : 94,
          misfireIndication: false,
          chtDeviation: parseFloat((cyl2Cht - avgCht).toFixed(1)),
          egtDeviation: cyl2Egt - avgEgt,
          cylinderHealth: hasOverheating ? 64 : 94,
          anomalyScore: hasOverheating ? 0.92 : 0.04,
        },
        cylinder_3: {
          id: 3,
          name: 'Cylinder 3 (Left Rear - Secondary Sensor)',
          bank: 'LEFT',
          position: 'REAR',
          cht: cyl3Cht,
          egt: cyl3Egt,
          combustionHealth: hasCylinderMisfire ? 38 : 96,
          misfireIndication: hasCylinderMisfire,
          chtDeviation: parseFloat((cyl3Cht - avgCht).toFixed(1)),
          egtDeviation: cyl3Egt - avgEgt,
          cylinderHealth: hasCylinderMisfire ? 48 : 96,
          anomalyScore: hasCylinderMisfire ? 0.88 : 0.03,
        },
        cylinder_4: {
          id: 4,
          name: 'Cylinder 4 (Right Rear)',
          bank: 'RIGHT',
          position: 'REAR',
          cht: cyl4Cht,
          egt: cyl4Egt,
          combustionHealth: 95,
          misfireIndication: false,
          chtDeviation: parseFloat((cyl4Cht - avgCht).toFixed(1)),
          egtDeviation: cyl4Egt - avgEgt,
          cylinderHealth: 95,
          anomalyScore: 0.03,
        },
        averageCht: avgCht,
        maxCht,
        minCht,
        chtSpread,
        averageEgt: avgEgt,
        maxEgt,
        minEgt,
        egtSpread,
        cylinderToCylinderChtDeviation: chtDeviations,
        cylinderToCylinderEgtDeviation: egtDeviations,
      },
      combustion: {
        cht: {
          cylinders: [cyl1Cht, cyl2Cht, cyl3Cht, cyl4Cht],
          average: avgCht,
          maxDeviation: chtSpread,
          deviations: chtDeviations,
          trend: 0.2,
        },
        egt: {
          cylinders: [cyl1Egt, cyl2Egt, cyl3Egt, cyl4Egt],
          average: avgEgt,
          maxDeviation: egtSpread,
          deviations: egtDeviations,
          trend: 0.8,
        },
        exhaustTemperature: avgEgt - 85,
        intakeAirTemperature: iatC,
        combustionStatus: hasCylinderMisfire ? 'LEAN_MISFIRE' : hasOverheating ? 'KNOCK_DETECTED' : 'NOMINAL',
        cylinders: null as any, // assigned below to circular ref cleanly
      },
      turbocharger: {
        turbocharger: {
          turbochargerRpm: turboRpm,
          compressorPressureBar: mapBar,
          boostPressureBar: boostDeltaBar,
          intakeManifoldPressureInHg: mapInHg,
          turbochargerTemperatureC: parseFloat((88.0 + (engineLoad / 100) * 35.0).toFixed(1)),
          compressorInletPressureBar: ambientPressBar,
          compressorOutletPressureBar: mapBar,
          operatingState: hasWastegateStuck ? 'SURGE' : boostDeltaBar > 0.05 ? 'BOOSTING' : 'SPOOLING',
          health: hasWastegateStuck || hasTcuFault ? 55 : 94,
          anomalyState: hasWastegateStuck || hasTcuFault ? 'UNDERBOOST' : 'NOMINAL',
        },
        wastegate: {
          position: wastegatePct,
          command: wastegateCmd,
          state: hasWastegateStuck ? 'STUCK_OPEN' : wastegatePct > 90 ? 'OPEN' : wastegatePct < 15 ? 'CLOSED' : 'REGULATING',
          openingPercent: wastegatePct,
          error: wastegateCmd - wastegatePct,
          responseTimeMs: 85,
          health: hasWastegateStuck ? 45 : 96,
        },
        tcu: {
          status: hasTcuFault ? 'FAULT' : hasWastegateStuck ? 'DEGRADED' : 'ONLINE',
          operatingMode: hasTcuFault ? 'EMERGENCY_OVERRIDE' : hasWastegateStuck ? 'BOOST_LIMITED' : altMsl > 3000 ? 'ALTITUDE_COMPENSATION' : 'NORMAL',
          commandPct: wastegateCmd,
          faultState: hasTcuFault || hasWastegateStuck,
          boostWarningLamp: hasTcuFault || boostDeltaBar > 0.32,
          cautionLamp: hasTcuFault || hasWastegateStuck || hasOverheating,
          communication: hasTcuFault ? 'TIMEOUT' : 'OK',
          targetBoostBar: parseFloat(((targetMapInHg * 0.0338639) - ambientPressBar).toFixed(2)),
          actualBoostBar: boostDeltaBar,
          boostErrorBar: parseFloat((((targetMapInHg * 0.0338639) - ambientPressBar) - boostDeltaBar).toFixed(2)),
        },
      },
      intake: {
        map: mapInHg,
        mapBar,
        airboxPressureInHg: mapInHg,
        airboxPressureBar: mapBar,
        airboxTemperatureC: airboxTempC,
        intakeAirTemperature: iatC,
        intakeAirPressure: ambientPressBar,
        airMassFlow,
        throttlePosition: parseFloat(effectiveThrottle.toFixed(1)),
        pressureDifferential: boostDeltaBar,
        wastegatePosition: wastegatePct,
        intakeRestrictionHpa: parseFloat((2.2 + (airMassFlow / 200) * 1.8).toFixed(1)),
        airFilterCondition: 'CLEAN',
        intakeStatus: hasWastegateStuck || hasTcuFault ? 'RESTRICTED' : airboxTempC > 72 ? 'OVERHEAT' : 'NOMINAL',
        boostPressureDeviation: parseFloat((boostDeltaBar - 0.22).toFixed(2)),
        intakePressureDeviation: 0.02,
        intakeTemperatureTrend: 0.1,
        airflowTrend: 0.4,
      },
      carburetors: {
        carburetor_1: {
          id: 1,
          name: 'Bing 64 Carburetor 1 (Cyl 1 & 3)',
          status: 'NOMINAL',
          throttleResponse: parseFloat(effectiveThrottle.toFixed(1)),
          slidePosition: carbSlide1,
          floatBowlLevel: 'NORMAL',
          temperatureC: parseFloat((iatC - 2.5).toFixed(1)),
          mixtureCondition: 'OPTIMAL',
          faultState: false,
        },
        carburetor_2: {
          id: 2,
          name: 'Bing 64 Carburetor 2 (Cyl 2 & 4)',
          status: hasCylinderMisfire || hasCarbImbalance ? 'DEGRADED' : 'NOMINAL',
          throttleResponse: parseFloat((effectiveThrottle - (hasCylinderMisfire ? 8 : hasCarbImbalance ? 12 : 0)).toFixed(1)),
          slidePosition: carbSlide2,
          floatBowlLevel: 'NORMAL',
          temperatureC: parseFloat((iatC - 2.0).toFixed(1)),
          mixtureCondition: hasCylinderMisfire || hasCarbImbalance ? 'LEAN' : 'OPTIMAL',
          faultState: hasCylinderMisfire || hasCarbImbalance,
        },
        balance: carbBalance,
        balanceDeviation: parseFloat((Math.abs(carbSlide1 - carbSlide2)).toFixed(1)),
        mixtureCondition: hasCylinderMisfire || hasCarbImbalance ? 'LEAN' : 'OPTIMAL',
        throttleSynchronization: carbBalance,
        dripTrayDrained: true,
        status: hasCylinderMisfire || hasCarbImbalance ? 'IMBALANCE' : 'NOMINAL',
      },
      fuel_system: {
        pump_1: {
          id: 1,
          role: 'MAIN',
          state: hasPump1Fail ? 'FAULT' : 'ACTIVE',
          voltage: hasPump1Fail ? 0.0 : 12.4,
          currentA: hasPump1Fail ? 0.0 : 1.6,
          pressureOutputBar: hasPump1Fail ? 0.0 : 3.4,
          deliveryRateLh: hasPump1Fail ? 0.0 : 115.0,
          checkValveStatus: 'NORMAL',
        },
        pump_2: {
          id: 2,
          role: 'STANDBY',
          state: hasPump1Fail || effectiveThrottle > 95 ? 'ACTIVE' : 'STANDBY',
          voltage: hasPump1Fail || effectiveThrottle > 95 ? 12.4 : 0.0,
          currentA: hasPump1Fail || effectiveThrottle > 95 ? 1.5 : 0.0,
          pressureOutputBar: hasPump1Fail || effectiveThrottle > 95 ? 3.4 : 0.0,
          deliveryRateLh: hasPump1Fail || effectiveThrottle > 95 ? 115.0 : 0.0,
          checkValveStatus: 'NORMAL',
        },
        fuelFlow: fuelFlowLh,
        fuelPressure: fuelPressureBar,
        fuelPressureDeltaOverAirbox: parseFloat((fuelPressureBar - mapBar).toFixed(2)),
        fuelTemperature: parseFloat((28.5 + (engineLoad / 100) * 4.0).toFixed(1)),
        fuelQuantity: parseFloat(this.fuelRemainingL.toFixed(1)),
        fuelRemainingPercent: fuelRemainingPct,
        fuelConsumption: parseFloat(this.fuelConsumedL.toFixed(1)),
        fuelConsumptionTrend: 0.05,
        systemPressure: fuelPressureBar,
        systemHealth: hasFuelLeak ? 42 : hasPump1Fail ? 68 : 96,
        fuelStarvationIndication: this.fuelRemainingL < 4.0,
        fuelPressureDeviation: parseFloat((fuelPressureBar - (mapBar + 0.25)).toFixed(2)),
        pumpImbalance: hasPump1Fail ? 1.0 : 0.05,
        status: hasFuelLeak ? 'LEAK_DETECTED' : hasPump1Fail || fuelPressureBar < 2.5 ? 'PRESSURE_DROP' : 'NOMINAL',
      },
      fuel: {
        fuelFlow: fuelFlowLh,
        fuelPressure: fuelPressureBar,
        fuelTemperature: parseFloat((28.5 + (engineLoad / 100) * 4.0).toFixed(1)),
        fuelQuantity: parseFloat(this.fuelRemainingL.toFixed(1)),
        fuelRemainingPercent: fuelRemainingPct,
        fuelConsumption: parseFloat(this.fuelConsumedL.toFixed(1)),
        fuelConsumptionTrend: 0.05,
        carburetorFeedRate: fuelFlowLh,
        mixtureRatio: lambdaVal,
        status: hasFuelLeak ? 'LEAK_DETECTED' : fuelPressureBar < 2.5 ? 'PRESSURE_DROP' : 'NOMINAL',
      },
      ignition: {
        ignition_A: {
          circuit: 'A',
          status: hasIgnAFail ? 'FAULT' : hasCylinderMisfire ? 'DEGRADED' : 'ACTIVE',
          health: hasIgnAFail ? 12 : hasCylinderMisfire ? 62 : 98,
          voltage: hasIgnAFail ? 0.0 : 13.8,
          timingDegBtdc: ignitionTimingDeg,
          controlsPlugs: 'Top Plugs (Cyl 1,2) + Lower Plugs (Cyl 3,4)',
        },
        ignition_B: {
          circuit: 'B',
          status: hasIgnBFail ? 'FAULT' : 'ACTIVE',
          health: hasIgnBFail ? 12 : 98,
          voltage: hasIgnBFail ? 0.0 : 13.8,
          timingDegBtdc: ignitionTimingDeg,
          controlsPlugs: 'Top Plugs (Cyl 3,4) + Lower Plugs (Cyl 1,2)',
        },
        dualIgnitionState: hasIgnAFail && hasIgnBFail ? 'IGNITION_A_FAULT' : hasIgnAFail ? 'IGNITION_B_ONLY' : hasIgnBFail ? 'IGNITION_A_ONLY' : hasCylinderMisfire ? 'IGNITION_A_FAULT' : 'BOTH_ACTIVE',
        ignitionTiming: ignitionTimingDeg,
        ignitionAdvance: ignitionAdvanceDeg,
        sparkPlugStatus: {
          circuitA: sparkPlugA,
          circuitB: sparkPlugB,
        },
        ignitionVoltage: 13.8,
        primaryIgnitionState: hasIgnAFail ? 'OFF' : hasCylinderMisfire ? 'DEGRADED' : 'ACTIVE',
        secondaryIgnitionState: hasIgnBFail ? 'OFF' : 'ACTIVE',
        misfireCount: hasCylinderMisfire ? 18 : 0,
        misfireDetected: hasCylinderMisfire,
        dualIgnitionConsistency: hasIgnAFail || hasIgnBFail ? 48.0 : hasCylinderMisfire ? 78.5 : 99.4,
      },
      cooling: {
        architecture: 'LIQUID_HEADS_AIR_CYLINDERS',
        coolantTemperature: coolantTempC,
        coolantPressure: coolantPressureBar,
        coolantFlow: coolantFlowLmin,
        radiatorTemperature: radiatorTempC,
        coolingAirTemperature: parseFloat((this.ambientTemp + 2.5).toFixed(1)),
        coolingAirFlow: parseFloat((this.actualSpeed * 1.15).toFixed(1)),
        status: hasOverheating || hasCoolantRise ? 'OVERHEAT' : 'NOMINAL',
        liquidCooling: {
          coolantTemperature: coolantTempC,
          coolantPressure: coolantPressureBar,
          coolantFlow: coolantFlowLmin,
          cylinderHeadTemperature: maxCht,
          radiatorTemperature: radiatorTempC,
          coolantLevelPercent: 98.0,
          radiatorHeatDissipationKw: parseFloat(((engineLoad / 100) * 30.0).toFixed(1)),
          status: hasOverheating || hasCoolantRise ? 'OVERHEAT' : 'NOMINAL',
          health: hasOverheating || hasCoolantRise ? 42 : hasReducedCoolantFlow ? 60 : 96,
        },
        ramAirCooling: {
          coolingAirTemperature: parseFloat((this.ambientTemp + 2.5).toFixed(1)),
          coolingAirPressureHpa: parseFloat((ambientPressHpa + 12.0).toFixed(1)),
          coolingAirFlow: parseFloat((this.actualSpeed * 1.15).toFixed(1)),
          ambientTemperature: this.ambientTemp,
          cylinderWallTemperature: cylinderWallTempC,
          coolingEffectiveness: parseFloat((100 - (cylinderWallTempC / 200.0) * 20).toFixed(1)),
        },
        coolingEfficiency: hasOverheating || hasCoolantRise ? 48.0 : hasReducedCoolantFlow ? 62.0 : 94.5,
        temperatureDeviation: parseFloat((coolantTempC - 88.0).toFixed(1)),
        overTemperatureCondition: hasOverheating || hasCoolantRise || maxCht > 135,
        coolingAnomaly: hasOverheating || hasCoolantRise || hasReducedCoolantFlow,
      },
      oil_system: {
        oil_tank: {
          levelPercent: 94.0,
          quantityLiters: 2.8,
          temperatureC: parseFloat((oilTempC - 4.0).toFixed(1)),
          ventLinePressureBar: 0.05,
        },
        oil_pump: {
          status: hasOilPressureLoss ? 'LOW_PRESSURE' : 'OPTIMAL',
          pressureBar: oilPressureBar,
          flowRateLmin: oilFlowRateLmin,
          vacuumSuctionBar: 0.12,
          crankcasePressureBar: 0.18,
        },
        oil_filter: {
          condition: 'NORMAL',
          differentialPressureBar: 0.22,
        },
        lubrication_circuit: {
          oilTemperature: oilTempC,
          oilPressureTrend: 0.01,
          oilTemperatureTrend: 0.12,
          oilPressureDeviation,
          status: hasOilPressureLoss ? 'LOW_PRESSURE' : oilTempC > 120 || hasHighOilTemp ? 'HIGH_TEMP' : 'OPTIMAL',
          health: hasOilPressureLoss ? 18 : hasHighOilTemp ? 38 : hasOilDegrade ? 54 : 95,
        },
      },
      lubrication: {
        oilPressure: oilPressureBar,
        oilTemperature: oilTempC,
        oilLevel: 94.0,
        oilFlowRate: oilFlowRateLmin,
        oilPressureTrend: 0.01,
        oilTemperatureTrend: 0.12,
        oilPressureDeviation,
        status: hasOilPressureLoss ? 'LOW_PRESSURE' : oilTempC > 120 || hasHighOilTemp ? 'HIGH_TEMP' : 'OPTIMAL',
      },
      exhaust: {
        egtAverage: avgEgt,
        egtPerCylinder: [cyl1Egt, cyl2Egt, cyl3Egt, cyl4Egt],
        egtMaxDeviation: egtSpread,
        exhaustPressure: parseFloat((1.18 + (engineLoad / 100) * 0.22 + (hasExhaustRestrict ? 0.65 : 0)).toFixed(2)),
        exhaustFlow: parseFloat((airMassFlow + fuelFlowLh * 0.74).toFixed(1)),
        exhaustTemperature: avgEgt - 78,
        exhaustEnergyIndex: parseFloat(((powerKw / 84.5) * (engineLoad / 100)).toFixed(2)),
        exhaustSystemHealth: hasExhaustRestrict ? 35 : hasOverheating ? 65 : 96,
        exhaustAnomaly: hasExhaustRestrict || hasEgtImbalance || hasOverheating || egtSpread > 65,
      },
      gearbox: {
        engine_input_rpm: Math.round(actualEngineRpm),
        propeller_output_rpm: propRpm,
        reduction_ratio: GEAR_REDUCTION_RATIO,
        gearbox_temperature: hasGearboxOverheat ? 118.5 : hasGearboxVib ? 104.5 : parseFloat((oilTempC - 6.0).toFixed(1)),
        gearbox_vibration: hasGearboxVib ? 6.42 : parseFloat((vibRms * 0.75).toFixed(2)),
        gearbox_torque: parseFloat((torque * GEAR_REDUCTION_RATIO).toFixed(1)),
        gearbox_health: hasGearboxVib ? 42 : hasGearboxOverheat ? 55 : hasVibAnomaly ? 68 : 96,
        overloadClutchStatus: hasGearboxVib ? 'SLIPPING' : 'ENGAGED',
        torsionalDamperCondition: hasGearboxVib ? 'INSPECT' : hasVibAnomaly ? 'WORN' : 'NORMAL',
        lubricationStatus: 'OPTIMAL',
      },
      propeller: {
        propellerRpm: propRpm,
        propellerTorqueNm: parseFloat((torque * GEAR_REDUCTION_RATIO).toFixed(1)),
        propellerPitchDeg: parseFloat((18.5 + (effectiveThrottle / 115) * 6.5).toFixed(1)),
        propellerLoadPct: Math.round(engineLoad),
        propellerThrustN: Math.round(powerKw * 28.5),
        propellerEfficiencyPct: 86.4,
        propellerStatus: 'NOMINAL',
        governorStatus: 'ACTIVE',
        configuration: 'VERSION_3_GOVERNOR',
      },
      starter: {
        starterState: actualEngineRpm > 400 ? 'RUNNING' : 'OFF',
        starterCurrentA: 0.0,
        starterVoltageV: 12.6,
        engineCrankingRpm: 0,
        startAttemptCount: 1,
        startDurationSec: 1.8,
        successfulStart: true,
        failedStart: false,
        startFault: false,
        engineStartTimeIso: '2026-09-28T14:15:00Z',
      },
      electrical: {
        batteryVoltage: hasGenFail || hasAltFail ? 24.1 : 28.4,
        batteryCurrent: alternatorCurrent,
        batteryTemperature: 34.0,
        batterySoc: 94.0,
        integratedGeneratorStatus: hasGenFail ? 'OFFLINE' : 'ACTIVE',
        integratedGeneratorPowerW: hasGenFail ? 0 : parseFloat(((actualEngineRpm / 5800) * 250).toFixed(0)),
        externalAlternatorFitted: true,
        externalAlternatorStatus: hasAltFail ? 'OFFLINE' : 'ACTIVE',
        externalAlternatorVoltage: hasAltFail ? 0.0 : 14.4,
        externalAlternatorCurrent: alternatorCurrent,
        electricalPower: electricalPowerW,
        electricalLoad: electricalLoadPct,
        starterStatus: 'DISENGAGED',
        health: hasGenFail || hasAltFail ? 45 : 96,
      },
      mechanical: {
        rpm: Math.round(actualEngineRpm),
        crankshaftSpeed,
        torque,
        mechanicalLoad: Math.round(engineLoad),
        bearingTemperature: parseFloat((oilTempC - 8.0).toFixed(1)),
        bearingVibration: parseFloat((vibRms * 0.65).toFixed(2)),
        engineOperatingHours: parseFloat(this.engineHours.toFixed(1)),
        engineCycleCount: this.engineCycles,
        componentHealth: {
          crankshaft: hasVibAnomaly ? 78 : 94,
          bearings: hasBearingDegrade ? 38 : hasOilPressureLoss ? 68 : 91,
          pistons: hasOverheating ? 72 : 92,
          valvetrain: hasCylinderMisfire ? 74 : 93,
        },
      },
      vibration: {
        overallVibration: vibRms,
        vibrationX: vibX,
        vibrationY: vibY,
        vibrationZ: vibZ,
        rmsVibration: vibRms,
        peakVibration: vibPeak,
        dominantFrequency: dominantFreqHz,
        vibrationTrend: 0.04,
        vibrationBaseline: vibBaseline,
        vibrationDeviation: vibDeviation,
      },
      environment: {
        altitude: altMsl,
        airspeed: parseFloat((this.actualSpeed + effectiveWind * 0.2).toFixed(1)),
        oat: this.ambientTemp,
        ambientTemperature: this.ambientTemp,
        ambientPressure: ambientPressHpa,
        humidity: 62.0,
        airDensity: 1.225,
        windSpeed: parseFloat(effectiveWind.toFixed(1)),
        windDirection: Math.round(this.windDirection),
        densityAltitudeM,
        criticalAltitudeM: 4800,
        flightPhase,
      },
      health: {
        overallEngineHealth: healthIndex,
        engineHealthIndex: healthIndex,
        degradationIndex,
        anomalyScore,
        faultState: hasCriticalFault ? 'FAULT' : hasWarningFault ? 'DEGRADED' : 'HEALTHY',
        faultType: this.getActiveFaults()[0]?.label || null,
        faultSeverity: hasCriticalFault ? 'CRITICAL' : hasWarningFault ? 'HIGH' : 'NONE',
        healthTrend: hasCriticalFault ? 'DEGRADING' : 'STABLE',
        components: {
          overall: { health: healthIndex, status: healthIndex > 80 ? 'NOMINAL' : healthIndex > 50 ? 'MONITOR' : 'FAULT', source: 'MODEL_DERIVED', confidence: 0.94 },
          cylinders: { health: hasOverheating || hasCoolantRise ? 54 : hasCylinderMisfire ? 72 : 95, status: hasOverheating || hasCoolantRise ? 'FAULT' : 'NOMINAL', source: 'SENSOR_DERIVED', confidence: 0.98 },
          turbocharger: { health: hasWastegateStuck || hasTcuFault || hasTurboOverboost ? 55 : 94, status: hasWastegateStuck || hasTcuFault || hasTurboOverboost ? 'FAULT' : 'NOMINAL', source: 'SENSOR_DERIVED', confidence: 0.92 },
          wastegate: { health: hasWastegateStuck || hasTurboOverboost ? 45 : 96, status: hasWastegateStuck || hasTurboOverboost ? 'FAULT' : 'NOMINAL', source: 'RULE_BASED', confidence: 0.96 },
          tcu: { health: hasTcuFault ? 35 : hasWastegateStuck ? 58 : 98, status: hasTcuFault ? 'FAULT' : hasWastegateStuck ? 'MONITOR' : 'NOMINAL', source: 'RULE_BASED', confidence: 0.95 },
          fuel_system: { health: hasFuelLeak ? 42 : hasPump1Fail || hasPump2Fail ? 68 : 96, status: hasFuelLeak || hasPump1Fail ? 'FAULT' : 'NOMINAL', source: 'SENSOR_DERIVED', confidence: 0.95 },
          carburetors: { health: hasCarbImbalance ? 55 : hasCylinderMisfire ? 74 : 96, status: hasCarbImbalance ? 'FAULT' : hasCylinderMisfire ? 'MONITOR' : 'NOMINAL', source: 'MODEL_DERIVED', confidence: 0.88 },
          ignition: { health: hasIgnAFail || hasIgnBFail ? 22 : hasCylinderMisfire ? 62 : 98, status: hasIgnAFail || hasIgnBFail || hasCylinderMisfire ? 'FAULT' : 'NOMINAL', source: 'SENSOR_DERIVED', confidence: 0.99 },
          cooling: { health: hasOverheating || hasCoolantRise ? 42 : hasReducedCoolantFlow ? 62 : 96, status: hasOverheating || hasCoolantRise ? 'FAULT' : 'NOMINAL', source: 'SENSOR_DERIVED', confidence: 0.96 },
          lubrication: { health: hasOilPressureLoss ? 18 : hasHighOilTemp ? 42 : 95, status: hasOilPressureLoss ? 'FAULT' : 'NOMINAL', source: 'SENSOR_DERIVED', confidence: 0.99 },
          exhaust: { health: hasExhaustRestrict ? 35 : hasOverheating ? 65 : 96, status: hasExhaustRestrict ? 'FAULT' : hasOverheating ? 'MONITOR' : 'NOMINAL', source: 'SENSOR_DERIVED', confidence: 0.94 },
          gearbox: { health: hasGearboxVib ? 38 : hasGearboxOverheat ? 55 : hasVibAnomaly ? 68 : 96, status: hasGearboxVib || hasGearboxOverheat ? 'FAULT' : hasVibAnomaly ? 'MONITOR' : 'NOMINAL', source: 'RULE_BASED', confidence: 0.90 },
          electrical: { health: hasGenFail || hasAltFail ? 45 : 96, status: hasGenFail || hasAltFail ? 'FAULT' : 'NOMINAL', source: 'SENSOR_DERIVED', confidence: 0.95 },
          starter: { health: 98, status: 'NOMINAL', source: 'RULE_BASED', confidence: 0.92 },
        },
        componentHealth: {
          cylinder: hasOverheating || hasCoolantRise ? 54 : 94,
          bearing: hasBearingDegrade ? 38 : hasOilPressureLoss ? 68 : 91,
          lubrication: hasOilPressureLoss ? 18 : hasHighOilTemp ? 42 : 95,
          fuelSystem: hasFuelLeak ? 42 : hasPump1Fail ? 68 : 96,
          ignitionSystem: hasIgnAFail || hasIgnBFail ? 22 : hasCylinderMisfire ? 62 : 98,
          coolingSystem: hasOverheating || hasCoolantRise ? 42 : 96,
          electricalSystem: hasGenFail || hasAltFail ? 45 : 96,
          turbocharger: hasWastegateStuck || hasTcuFault || hasTurboOverboost ? 55 : 94,
          gearbox: hasGearboxVib ? 38 : hasGearboxOverheat ? 55 : hasVibAnomaly ? 68 : 96,
        },
      },
      maintenance: {
        engineOperatingHours: parseFloat(this.engineHours.toFixed(1)),
        flightHours: parseFloat(this.engineFlightHours.toFixed(1)),
        engineCycleCount: this.engineCycles,
        cyclesSinceMaintenance: 42,
        operatingHoursSinceMaintenance: 120.4,
        hoursSinceOverhaul: parseFloat(this.engineHours.toFixed(1)),
        tboReferenceHours: 2000,
        lastMaintenanceDate: '2026-08-15',
        lastMaintenanceHours: 1300.0,
        lastOverhaulDate: 'Depot Zero-Hour Baseline',
        isSimulatedData: true,
        replacementHistory: [
          { component: 'Rotax High-Pressure Oil Filter (Part 825701)', atHours: 1300.0, date: '2026-08-15', reason: 'Scheduled 100-hour service' },
          { component: 'NGK DCPR8E Spark Plugs (Set of 8)', atHours: 1200.0, date: '2026-07-02', reason: 'Scheduled replacement interval' },
          { component: 'Turbo Wastegate Servo Cable & Bellcrank', atHours: 1000.0, date: '2026-04-18', reason: 'Preventive service bulletin' },
        ],
        faultHistory: [
          { timestamp: '14:20:11', code: 'E-CHT-02', description: 'Transient CHT elevation on Cylinder 2 during climb', resolved: true },
          { timestamp: '09:15:44', code: 'E-MAP-01', description: 'TCU wastegate calibration self-test passed', resolved: true },
        ],
        maintenanceEvents: [
          { date: '2026-08-15', type: '100-Hour Routine Inspection', description: 'Compression check: 8.8-9.0 bar across all 4 cylinders. Oil change with AeroShell 4T.', technician: 'MCC-AIRWORTHINESS #44' },
          { date: '2026-07-02', type: 'Ignition System Inspection', description: 'Dual CDI circuits tested; gap checked at 0.7mm.', technician: 'MCC-PROPULSION #12' },
        ],
      },
      rul: {
        estimatedRul: hasOilPressureLoss
          ? 2.8
          : hasOverheating
          ? 14.5
          : hasFuelLeak
          ? 18.0
          : hasVibAnomaly
          ? 38.0
          : hasCylinderMisfire
          ? 42.0
          : hasWastegateStuck
          ? 82.0
          : 580.0,
        rulUnit: 'operating_hours',
        nominalTboHours: 2000.0,
        rulTrend: hasOilPressureLoss || hasOverheating || hasFuelLeak
          ? 'ACCELERATING'
          : hasVibAnomaly || hasCylinderMisfire || hasWastegateStuck
          ? 'DEGRADING'
          : 'STABLE',
        degradationTrend: hasOilPressureLoss ? 9.8 : hasOverheating ? 4.5 : 0.8,
        healthState: hasOilPressureLoss || hasOverheating || hasFuelLeak || hasVibAnomaly || hasCylinderMisfire
          ? 'ACTION_REQUIRED'
          : hasWastegateStuck
          ? 'MONITOR'
          : 'NOMINAL',
        maintenanceThresholdHours: 50.0,
        isSimulatedPrediction: true,
        rulMethodology: 'SIMULATED / DEMONSTRATION RUL',
        rulHistory: hasOilPressureLoss
          ? [580, 420, 240, 110, 45, 18, 6, 2.8]
          : hasOverheating
          ? [580, 480, 360, 220, 140, 75, 32, 14.5]
          : [650, 640, 630, 620, 610, 600, 590, 580],
        componentRul: {
          corePowerplantHours: hasOilPressureLoss ? 2.8 : hasOverheating ? 14.5 : 580.0,
          turbochargerHours: hasWastegateStuck ? 82.0 : 420.0,
          reductionGearboxHours: hasVibAnomaly ? 45.0 : 580.0,
          oilPumpHours: hasOilPressureLoss ? 1.2 : 580.0,
          carburetorsHours: 340.0,
          ignitionSystemHours: hasCylinderMisfire ? 65.0 : 480.0,
          fuelPumpsHours: hasFuelLeak ? 35.0 : 520.0,
          alternatorHours: 480.0,
          fuelInjectorsHours: hasFuelLeak ? 18.0 : 340.0, // legacy backward compatibility
        },
      },
      derived: {
        powerToFuelEfficiency: parseFloat((powerKw / fuelFlowLh).toFixed(2)),
        brakeSpecificFuelConsumptionGkwh: bsfc,
        chtDeviations,
        egtDeviations,
        rpmError,
        oilPressureDeviation,
        vibrationDeviation: vibDeviation,
        fuelConsumptionTrend: 0.04,
        temperatureTrend: 0.18,
        expectedPowerKw: parseFloat(((144.0 * (targetRpm * 2 * Math.PI / 60)) / 1000 * 0.72).toFixed(1)),
        powerDeviationKw: parseFloat((powerKw - ((144.0 * (targetRpm * 2 * Math.PI / 60)) / 1000 * 0.72)).toFixed(1)),
      },
    };

    // Link circular cylinders reference inside combustion
    engine.combustion.cylinders = engine.cylinders;

    // Buffer historical engine time-series every 1 second
    if (Math.floor(this.simTime) !== Math.floor(this.simTime - dt)) {
      this.engineHistory.push({
        timeSec: Math.round(this.simTime),
        rpm: Math.round(actualEngineRpm),
        propRpm,
        throttle: parseFloat(effectiveThrottle.toFixed(1)),
        engineLoad: Math.round(engineLoad),
        torque,
        powerKw,
        chtAvg: avgCht,
        egtAvg: avgEgt,
        oilPressure: oilPressureBar,
        oilTemp: oilTempC,
        coolantTemp: coolantTempC,
        fuelFlow: fuelFlowLh,
        fuelPressure: fuelPressureBar,
        map: mapInHg,
        boostBar: boostDeltaBar,
        wastegatePct,
        vibrationRms: vibRms,
        ambientTemp: this.ambientTemp,
        altitude: parseFloat((APP_CONFIG.baseCoordinates.altMsl + this.droneZ).toFixed(1)),
        electricalPower: electricalPowerW,
      });
      if (this.engineHistory.length > 180) this.engineHistory.shift();
    }

    const telemetryData: DroneTelemetryData = {
      timestamp: Date.now(),
      droneId: APP_CONFIG.droneId,
      connectionStatus: 'CONNECTED',
      flightMode,
      systemStatus,
      updateFrequencyHz: 20,

      geoPosition: {
        latitude: parseFloat(currentLat.toFixed(6)),
        longitude: parseFloat(currentLng.toFixed(6)),
        altitudeMsl: parseFloat((APP_CONFIG.baseCoordinates.altMsl + this.droneZ).toFixed(1)),
        altitudeAgl: parseFloat(this.droneZ.toFixed(1)),
      },

      simCoordinates: {
        x: parseFloat(this.droneX.toFixed(1)),
        y: parseFloat(this.droneY.toFixed(1)),
        z: parseFloat(this.droneZ.toFixed(1)),
      },

      movement: {
        groundSpeed: parseFloat(this.actualSpeed.toFixed(1)),
        airSpeed: parseFloat((this.actualSpeed + effectiveWind * 0.2).toFixed(1)),
        verticalSpeed: parseFloat(this.actualVerticalSpeed.toFixed(1)),
        heading: Math.round(this.actualYaw),
      },

      attitude: {
        roll: parseFloat(this.actualRoll.toFixed(1)),
        pitch: parseFloat(this.actualPitch.toFixed(1)),
        yaw: parseFloat(this.actualYaw.toFixed(1)),
        angularVelocityX: parseFloat(((-this.actualRoll * 0.8 + (Math.sin(this.simTime * 6) * 1.2)) * noiseMultiplier).toFixed(1)),
        angularVelocityY: parseFloat(((this.actualPitch * 0.8 + (Math.cos(this.simTime * 6) * 1.1)) * noiseMultiplier).toFixed(1)),
        angularVelocityZ: parseFloat((yawDelta * 0.2).toFixed(1)),
        accelerationX: parseFloat(((Math.sin(headingRad) * 0.4) * noiseMultiplier).toFixed(2)),
        accelerationY: parseFloat(((Math.cos(headingRad) * 0.4) * noiseMultiplier).toFixed(2)),
        accelerationZ: parseFloat((1.0 + (this.actualVerticalSpeed * 0.1) * noiseMultiplier).toFixed(2)),
        totalAcceleration: parseFloat((1.02 + Math.abs(this.actualRoll / 30) * 0.1).toFixed(2)),
      },

      battery: {
        percentage: parseFloat(this.batteryPct.toFixed(1)),
        voltage: parseFloat(this.batteryVoltage.toFixed(1)),
        current: parseFloat(totalCurrent.toFixed(1)),
        power: parseFloat(totalPower.toFixed(1)),
        temperature: parseFloat(this.batteryTemp.toFixed(1)),
        remainingFlightTimeMinutes: Math.round(remainingMinutes),
        consumptionRate: parseFloat((totalCurrent * 60).toFixed(0)), // mAh/min approx
        cellVoltages: this.cellVoltages.map(() => parseFloat((this.batteryVoltage / 6).toFixed(2))),
        capacityMah: this.batteryCapacityMah,
        remainingCapacityMah: Math.round((this.batteryPct / 100) * this.batteryCapacityMah),
      },

      propulsion: {
        motors,
        totalCurrent: parseFloat(totalCurrent.toFixed(1)),
        totalPower: parseFloat(totalPower.toFixed(1)),
        avgMotorTemp: parseFloat((motors.reduce((sum, m) => sum + m.temperature, 0) / 4).toFixed(1)),
        rotorBalance: 98,
      },

      flightControl: {
        targetAltitude: this.targetZ,
        actualAltitude: parseFloat(this.droneZ.toFixed(1)),
        altitudeError: parseFloat((this.targetZ - this.droneZ).toFixed(1)),

        targetSpeed: this.targetSpeed,
        actualSpeed: parseFloat(this.actualSpeed.toFixed(1)),
        speedError: parseFloat((this.targetSpeed - this.actualSpeed).toFixed(1)),

        targetHeading: Math.round(this.targetHeading),
        actualHeading: Math.round(this.actualYaw),
        headingError: Math.round(this.targetHeading - this.actualYaw),

        targetRoll: parseFloat(this.targetRoll.toFixed(1)),
        actualRoll: parseFloat(this.actualRoll.toFixed(1)),
        rollError: parseFloat((this.targetRoll - this.actualRoll).toFixed(1)),

        targetPitch: parseFloat(this.targetPitch.toFixed(1)),
        actualPitch: parseFloat(this.actualPitch.toFixed(1)),
        pitchError: parseFloat((this.targetPitch - this.actualPitch).toFixed(1)),
      },

      mission: {
        missionId: 'SURVEY-01',
        name: 'SURVEY MISSION 01',
        status: 'ACTIVE',
        currentWaypoint: this.currentWaypointIndex + 1,
        totalWaypoints: totalWps,
        progressPercent: missionProgress,
        distanceTravelledKm: distTravelledKm,
        distanceRemainingKm: distRemainingKm,
        currentObjective: SURVEY_WAYPOINTS[this.currentWaypointIndex]?.name || 'Autonomous Waypoint Scanning',
        estimatedCompletionTimeSeconds: Math.round(distRemainingKm / (this.actualSpeed / 1000 || 0.02)),
        waypoints: SURVEY_WAYPOINTS,
      },

      environment: {
        ambientTemperature: this.ambientTemp,
        pressureHpa: 1008.4,
        humidity: 62.0,
        windSpeed: parseFloat(effectiveWind.toFixed(1)),
        windDirection: Math.round(this.windDirection),
        airDensity: 1.225,
        visibilityKm: 15.0,
      },

      sensors: {
        imu: {
          accelX: parseFloat((Math.sin(headingRad) * 0.4).toFixed(3)),
          accelY: parseFloat((Math.cos(headingRad) * 0.4).toFixed(3)),
          accelZ: parseFloat((1.0 + this.actualVerticalSpeed * 0.1).toFixed(3)),
          gyroX: parseFloat((-this.actualRoll * 0.8).toFixed(2)),
          gyroY: parseFloat((this.actualPitch * 0.8).toFixed(2)),
          gyroZ: parseFloat((yawDelta * 0.2).toFixed(2)),
          temp: 36.4,
        },
        gps: {
          latitude: parseFloat(currentLat.toFixed(6)),
          longitude: parseFloat(currentLng.toFixed(6)),
          altitude: parseFloat((APP_CONFIG.baseCoordinates.altMsl + this.droneZ).toFixed(1)),
          accuracyM: 0.8,
          satelliteCount: gpsSats,
          fixType: '3D Fix',
          hdop: gpsHdop,
        },
        barometer: {
          pressureHpa: parseFloat((1008.4 - (this.droneZ / 8.5)).toFixed(1)),
          altitudeM: parseFloat(baroAlt.toFixed(1)),
          temperatureC: this.ambientTemp,
        },
        magnetometer: {
          magX: parseFloat((21.4 * Math.cos(headingRad)).toFixed(1)),
          magY: parseFloat((21.4 * Math.sin(headingRad)).toFixed(1)),
          magZ: 42.1,
          heading: Math.round(this.actualYaw),
        },
        esc: {
          motorTemps: motors.map((m) => m.temperature),
          busVoltage: parseFloat(this.batteryVoltage.toFixed(1)),
          rpmReadouts: motors.map((m) => m.rpm),
        },
      },

      engine,
      engineHistory: [...this.engineHistory],
      flightPathHistory: [...this.history],
    };

    const syncStatus: SyncStatus = {
      telemetryStatus: 'LIVE',
      simulationStatus: this.isRunning ? 'RUNNING' : 'PAUSED',
      synchronizationStatus: 'SYNCED',
      updateRateHz: 20,
      latencyMs: 38 + Math.round(Math.sin(this.simTime * 2) * 4),
      packetLossPercent: 0.0,
      frameDropCount: 0,
      isSimulatedSource: true,
    };

    this.notify(telemetryData, syncStatus);
  }

  private notify(data?: DroneTelemetryData, sync?: SyncStatus) {
    if (!data) return;
    const activeFaultsList = this.getActiveFaults();
    for (const sub of this.subscribers) {
      sub(data, activeFaultsList, [...this.eventLogs], sync!);
    }
  }
}

// Singleton simulation engine instance
export const simulationEngine = new SimulationEngine();
