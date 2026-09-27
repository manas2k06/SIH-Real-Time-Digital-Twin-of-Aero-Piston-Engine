import {
  DroneTelemetryData,
  FlightMode,
  SystemStatus,
  MotorStatus,
  MotorTelemetry,
  Waypoint,
} from '../types/telemetry';
import { AeroEngineTelemetry, EngineTelemetryHistoryPoint } from '../types/engine';
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
      MOTOR_1_FAILURE: {
        label: 'Motor 1 Complete Thrust Failure',
        desc: 'ESC telemetry shows zero current draw and rotor stoppage on Front-Right arm.',
        source: 'PROPULSION',
        level: 'CRITICAL',
      },
      MOTOR_3_DEGRADATION: {
        label: 'Motor 3 RPM Deviation & Coil Overheat',
        desc: 'Rotor 3 (Rear-Right) operating with high harmonic resistance and thermal rise.',
        source: 'PROPULSION',
        level: 'WARN',
      },
      BATTERY_SAG: {
        label: 'Battery Cell 4 Rapid Voltage Sag',
        desc: 'Severe internal resistance spike causing pack voltage drop under high-amp load.',
        source: 'BATTERY_BMS',
        level: 'CRITICAL',
      },
      GPS_SIGNAL_LOSS: {
        label: 'GPS Satellite Constellation Loss',
        desc: 'GPS lock dropped to 0 satellites. EKF position estimator switching to dead reckoning.',
        source: 'AI_ANOMALY',
        level: 'CRITICAL',
      },
      SEVERE_WIND_SHEAR: {
        label: 'Severe Crosswind Gust & Turbulence',
        desc: 'Sudden wind vector shift to 21 m/s inducing high roll moment.',
        source: 'ENVIRONMENT',
        level: 'WARN',
      },
      BAROMETER_DRIFT: {
        label: 'Barometric Altitude Drift',
        desc: 'Sensor innovation residual variance triggered by pressure port static obstruction.',
        source: 'AI_ANOMALY',
        level: 'WARN',
      },
      IMU_SENSOR_NOISE: {
        label: 'IMU Accelerometer Noise Injection',
        desc: 'Excessive high-frequency vibrations on Z-axis accelerometer.',
        source: 'AI_ANOMALY',
        level: 'WARN',
      },
      ENGINE_OVERHEATING: {
        label: 'Engine Thermodynamic Overheating',
        desc: 'CHT and Coolant temperature rapid rise exceeding 135°C thermal limit.',
        source: 'FAULT_ENGINE',
        level: 'CRITICAL',
      },
      OIL_PRESSURE_LOSS: {
        label: 'Lubrication Low Oil Pressure',
        desc: 'Oil pump scavenge failure or line loss; pressure dropped below 1.5 bar threshold.',
        source: 'FAULT_ENGINE',
        level: 'CRITICAL',
      },
      VIBRATION_ANOMALY: {
        label: 'Aero-Piston Excessive Mechanical Vibration',
        desc: 'Severe 1X-2X crankshaft harmonic vibration anomaly exceeding 5.5 mm/s RMS.',
        source: 'FAULT_ENGINE',
        level: 'WARN',
      },
      FUEL_SYSTEM_LEAK: {
        label: 'Fuel Supply Rail Pressure Drop & Leak',
        desc: 'High-pressure injection rail pressure loss accompanied by abnormal fuel consumption rate.',
        source: 'FAULT_ENGINE',
        level: 'CRITICAL',
      },
      TURBO_WASTEGATE_STUCK: {
        label: 'Turbocharger Wastegate Open / Stuck',
        desc: 'Wastegate stuck in bypass position; inability to maintain 35.4 inHg boost manifold pressure.',
        source: 'FAULT_ENGINE',
        level: 'WARN',
      },
      CYLINDER_MISFIRE: {
        label: 'Cylinder 3 Ignition Misfire',
        desc: 'Dual CDI spark failure on cylinder 3 causing thermal drop and rotational hunting.',
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

    // Check active faults
    const hasMotor1Fail = this.activeFaults.has('MOTOR_1_FAILURE');
    const hasMotor3Degrade = this.activeFaults.has('MOTOR_3_DEGRADATION');
    const hasBatterySag = this.activeFaults.has('BATTERY_SAG');
    const hasWindShear = this.activeFaults.has('SEVERE_WIND_SHEAR');
    const hasGpsLoss = this.activeFaults.has('GPS_SIGNAL_LOSS');
    const hasBaroDrift = this.activeFaults.has('BAROMETER_DRIFT');
    const hasImuNoise = this.activeFaults.has('IMU_SENSOR_NOISE');
    const hasOverheating = this.activeFaults.has('ENGINE_OVERHEATING');
    const hasOilPressureLoss = this.activeFaults.has('OIL_PRESSURE_LOSS');
    const hasVibAnomaly = this.activeFaults.has('VIBRATION_ANOMALY');
    const hasFuelLeak = this.activeFaults.has('FUEL_SYSTEM_LEAK');
    const hasWastegateStuck = this.activeFaults.has('TURBO_WASTEGATE_STUCK');
    const hasCylinderMisfire = this.activeFaults.has('CYLINDER_MISFIRE');

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
    const effectiveWind = hasWindShear ? 21.5 : this.windSpeed;
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

    // Injected fault disturbance
    if (hasMotor1Fail) {
      this.actualRoll += 6.5 * Math.sin(this.simTime * 5.0);
      this.actualPitch -= 4.2;
    } else if (hasMotor3Degrade) {
      this.actualRoll -= 2.8 * Math.sin(this.simTime * 3.2);
    }

    // Velocity integration
    const headingRad = (this.actualYaw * Math.PI) / 180;
    const forwardSpeed = this.targetSpeed + (Math.sin(this.simTime * 0.5) * 0.6);
    this.actualSpeed = Math.max(0, forwardSpeed - (hasMotor1Fail ? 8.0 : 0));
    
    const vx = Math.cos(headingRad) * this.actualSpeed + windForceX;
    const vy = Math.sin(headingRad) * this.actualSpeed + windForceY;

    this.droneX += vx * dt;
    this.droneY += vy * dt;

    // Altitude tracking
    const altDiff = this.targetZ - this.droneZ;
    this.actualVerticalSpeed = altDiff * 0.4 + (Math.sin(this.simTime * 1.5) * 0.15);
    if (hasMotor1Fail) {
      this.actualVerticalSpeed -= 1.8; // Loss of lift
    }
    this.droneZ += this.actualVerticalSpeed * dt;
    if (this.droneZ < 0) this.droneZ = 0;

    // 3. Propulsion Motors calculation
    const baseRpm = hasMotor1Fail ? 8900 : 8420;
    const loadPercent = Math.min(100, Math.max(10, 60 + (this.actualSpeed / 20) * 15 + (effectiveWind / 15) * 10));

    let m1Rpm = baseRpm + (Math.sin(this.simTime * 10) * 40);
    let m2Rpm = baseRpm + (Math.cos(this.simTime * 10) * 35);
    let m3Rpm = baseRpm + (Math.sin(this.simTime * 8) * 45);
    let m4Rpm = baseRpm + (Math.cos(this.simTime * 8) * 38);

    let m1Status: MotorStatus = 'NORMAL';
    let m2Status: MotorStatus = 'NORMAL';
    let m3Status: MotorStatus = 'NORMAL';
    let m4Status: MotorStatus = 'NORMAL';

    let m1Temp = 41.2 + (loadPercent / 100) * 8;
    let m2Temp = 40.5 + (loadPercent / 100) * 7.5;
    let m3Temp = 42.1 + (loadPercent / 100) * 8.2;
    let m4Temp = 41.0 + (loadPercent / 100) * 7.8;

    if (hasMotor1Fail) {
      m1Rpm = 0;
      m1Status = 'FAULT';
      m1Temp = 29.0;
      // Other motors ramp up
      m2Rpm = 9650;
      m3Rpm = 9780;
      m4Rpm = 9520;
    }

    if (hasMotor3Degrade) {
      m3Rpm = 6850 + Math.sin(this.simTime * 20) * 400; // RPM flutter
      m3Status = 'DEGRADED';
      m3Temp = 68.5; // High coil heat
    }

    const motors: [MotorTelemetry, MotorTelemetry, MotorTelemetry, MotorTelemetry] = [
      {
        id: 1,
        name: 'M1',
        position: 'Front-Right',
        direction: 'CCW',
        rpm: Math.round(m1Rpm),
        loadPercent: Math.round(hasMotor1Fail ? 0 : loadPercent + 2),
        current: hasMotor1Fail ? 0.0 : parseFloat((2.1 * (loadPercent / 60)).toFixed(1)),
        voltage: 22.8,
        power: hasMotor1Fail ? 0 : parseFloat((47.8 * (loadPercent / 60)).toFixed(1)),
        temperature: parseFloat(m1Temp.toFixed(1)),
        status: m1Status,
        vibrationLevel: hasMotor1Fail ? 4.8 : 0.8,
      },
      {
        id: 2,
        name: 'M2',
        position: 'Front-Left',
        direction: 'CW',
        rpm: Math.round(m2Rpm),
        loadPercent: Math.round(hasMotor1Fail ? 92 : loadPercent - 1),
        current: parseFloat((2.1 * (hasMotor1Fail ? 1.5 : loadPercent / 60)).toFixed(1)),
        voltage: 22.8,
        power: parseFloat((47.8 * (hasMotor1Fail ? 1.5 : loadPercent / 60)).toFixed(1)),
        temperature: parseFloat(m2Temp.toFixed(1)),
        status: m2Status,
        vibrationLevel: 0.9,
      },
      {
        id: 3,
        name: 'M3',
        position: 'Rear-Right',
        direction: 'CW',
        rpm: Math.round(m3Rpm),
        loadPercent: Math.round(hasMotor3Degrade ? 45 : hasMotor1Fail ? 95 : loadPercent + 3),
        current: parseFloat((2.1 * (hasMotor3Degrade ? 3.4 : loadPercent / 60)).toFixed(1)),
        voltage: 22.8,
        power: parseFloat((47.8 * (hasMotor3Degrade ? 3.2 : loadPercent / 60)).toFixed(1)),
        temperature: parseFloat(m3Temp.toFixed(1)),
        status: m3Status,
        vibrationLevel: hasMotor3Degrade ? 6.2 : 0.8,
      },
      {
        id: 4,
        name: 'M4',
        position: 'Rear-Left',
        direction: 'CCW',
        rpm: Math.round(m4Rpm),
        loadPercent: Math.round(hasMotor1Fail ? 90 : loadPercent),
        current: parseFloat((2.1 * (hasMotor1Fail ? 1.4 : loadPercent / 60)).toFixed(1)),
        voltage: 22.8,
        power: parseFloat((47.8 * (hasMotor1Fail ? 1.4 : loadPercent / 60)).toFixed(1)),
        temperature: parseFloat(m4Temp.toFixed(1)),
        status: m4Status,
        vibrationLevel: 0.9,
      },
    ];

    const totalCurrent = motors.reduce((sum, m) => sum + m.current, 0);
    const totalPower = motors.reduce((sum, m) => sum + m.power, 0);

    // 4. Battery drain dynamics
    const drainPerSec = (totalCurrent / (this.batteryCapacityMah / 1000)) * (100 / 3600);
    const sagFactor = hasBatterySag ? 4.5 : 1.0;
    this.batteryPct = Math.max(0, this.batteryPct - drainPerSec * dt * sagFactor);
    
    // Voltage curve for 6S LiPo
    const baseVoltage = 19.8 + (this.batteryPct / 100) * 5.4; // 19.8V empty to 25.2V full
    this.batteryVoltage = hasBatterySag ? baseVoltage - 2.1 : baseVoltage - (totalCurrent * 0.04);
    
    // BMS temperature
    this.batteryTemp = hasBatterySag ? 54.2 : 32.0 + (totalCurrent / 10) * 3.5;
    const remainingMinutes = this.batteryPct > 0 ? (this.batteryPct / (drainPerSec * 60 * sagFactor)) : 0;

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
    const baroAlt = hasBaroDrift ? this.droneZ + 14.8 : this.droneZ + (Math.sin(this.simTime * 3) * 0.1);
    const gpsSats = hasGpsLoss ? 0 : 18;
    const gpsHdop = hasGpsLoss ? 9.99 : 0.74;

    const noiseMultiplier = hasImuNoise ? 5.5 : 1.0;

    const systemStatus: SystemStatus = hasMotor1Fail || hasBatterySag || hasGpsLoss || hasOverheating || hasOilPressureLoss
      ? 'CRITICAL'
      : hasMotor3Degrade || hasWindShear || hasBaroDrift || hasVibAnomaly || hasFuelLeak || hasWastegateStuck || hasCylinderMisfire
      ? 'WARNING'
      : 'NORMAL';

    const flightMode: FlightMode = hasMotor1Fail ? 'FAILSAFE' : 'AUTO';

    // 7. AERO-PISTON ENGINE DIGITAL TWIN CALCULATIONS (ROTAX 914F)
    const commandedThrottle = this.engineThrottle;
    const effectiveThrottle = Math.max(30, Math.min(100, commandedThrottle + (this.actualVerticalSpeed * 4.5)));
    const engineLoad = Math.max(20, Math.min(100, 45 + (effectiveThrottle / 100) * 45 + (hasWindShear ? 8 : 0)));

    // Rotax 914F nominal speed: 4,200 - 5,800 RPM
    const baseEngineRpm = 4200 + (effectiveThrottle / 100) * 1550;
    let actualEngineRpm = baseEngineRpm + (Math.sin(this.simTime * 8) * 15);
    if (hasCylinderMisfire) {
      actualEngineRpm -= 450 + Math.sin(this.simTime * 25) * 120;
    }
    const targetRpm = Math.round(baseEngineRpm);
    const rpmError = targetRpm - Math.round(actualEngineRpm);
    const crankshaftSpeed = parseFloat(((actualEngineRpm * 2 * Math.PI) / 60).toFixed(1)); // rad/s

    // Torque and Power Output (Rotax 914F: 144 Nm max torque, 84.5 kW / 115 HP max takeoff)
    const torque = parseFloat((110 + (engineLoad / 100) * 32.5 + Math.sin(this.simTime * 2) * 1.5).toFixed(1));
    const powerKw = parseFloat(((torque * crankshaftSpeed) / 1000).toFixed(1));
    const powerHp = parseFloat((powerKw * 1.34102).toFixed(1));

    // Manifold Absolute Pressure (MAP) & Turbocharger Induction Loop
    const ambientPressInHg = (1008.4 - (this.droneZ / 8.5)) * 0.02953;
    let targetMapInHg = 28.0 + (effectiveThrottle / 100) * 11.5;
    if (hasWastegateStuck) {
      targetMapInHg = ambientPressInHg; // loss of turbocharger boost
    }
    const mapInHg = parseFloat((targetMapInHg + Math.sin(this.simTime * 3) * 0.2).toFixed(1));
    const mapBar = parseFloat((mapInHg * 0.0338639).toFixed(2));
    const boostDeltaBar = parseFloat(Math.max(0, mapBar - (ambientPressInHg * 0.0338639)).toFixed(2));
    const wastegatePct = hasWastegateStuck ? 100 : Math.round(Math.max(0, Math.min(100, 20 + (effectiveThrottle / 100) * 60)));
    const airMassFlow = parseFloat((80 + (engineLoad / 100) * 125 + (mapBar * 20)).toFixed(1));
    const iatC = parseFloat((24 + (engineLoad / 100) * 18 + (boostDeltaBar * 12)).toFixed(1));

    // Fuel System Dynamics (BSFC approx 285 g/kWh, density 0.74 kg/L)
    const baseFuelFlow = (powerKw * 0.285) / 0.74;
    let fuelFlowLh = parseFloat(Math.max(6.5, baseFuelFlow + (Math.sin(this.simTime * 2.5) * 0.4)).toFixed(1));
    let fuelPressureBar = 3.2;
    if (hasFuelLeak) {
      fuelFlowLh = parseFloat((fuelFlowLh * 1.6).toFixed(1));
      fuelPressureBar = 1.8;
    }
    const fuelBurnPerSec = fuelFlowLh / 3600;
    this.fuelRemainingL = Math.max(0, this.fuelRemainingL - fuelBurnPerSec * dt);
    this.fuelConsumedL += fuelBurnPerSec * dt;
    const fuelRemainingPct = parseFloat(((this.fuelRemainingL / 90.0) * 100).toFixed(1));
    const airFuelRatio = parseFloat((14.7 + Math.sin(this.simTime * 1.2) * 0.2).toFixed(2));
    const lambdaVal = parseFloat((airFuelRatio / 14.7).toFixed(2));
    const injectionTimingBtdc = parseFloat((24.0 + (effectiveThrottle / 100) * 4.0).toFixed(1));
    const injectionDurationMs = parseFloat((2.5 + (engineLoad / 100) * 3.5).toFixed(2));

    // Combustion & Thermal Dynamics (Per-Cylinder CHT & EGT)
    const overheatFactor = hasOverheating ? 45.0 : 0.0;
    const misfireFactor = hasCylinderMisfire ? -35.0 : 0.0;
    const baseCht = 92.0 + (engineLoad / 100) * 32.0 + overheatFactor;
    const cyl1Cht = parseFloat((baseCht + 1.8 + Math.sin(this.simTime * 0.7) * 0.5).toFixed(1));
    const cyl2Cht = parseFloat((baseCht - 1.2 + Math.cos(this.simTime * 0.8) * 0.4).toFixed(1));
    const cyl3Cht = parseFloat((baseCht + misfireFactor + 0.6 + Math.sin(this.simTime * 0.9) * 0.5).toFixed(1));
    const cyl4Cht = parseFloat((baseCht - 0.9 + Math.cos(this.simTime * 0.6) * 0.4).toFixed(1));
    const avgCht = parseFloat(((cyl1Cht + cyl2Cht + cyl3Cht + cyl4Cht) / 4).toFixed(1));
    const maxChtDev = parseFloat((Math.max(cyl1Cht, cyl2Cht, cyl3Cht, cyl4Cht) - Math.min(cyl1Cht, cyl2Cht, cyl3Cht, cyl4Cht)).toFixed(1));
    const chtDeviations: [number, number, number, number] = [
      parseFloat((cyl1Cht - avgCht).toFixed(1)),
      parseFloat((cyl2Cht - avgCht).toFixed(1)),
      parseFloat((cyl3Cht - avgCht).toFixed(1)),
      parseFloat((cyl4Cht - avgCht).toFixed(1)),
    ];

    const baseEgt = 710.0 + (engineLoad / 100) * 95.0 + (hasOverheating ? 65.0 : 0.0);
    const cyl1Egt = Math.round(baseEgt + 6.0 + Math.sin(this.simTime * 1.5) * 3.0);
    const cyl2Egt = Math.round(baseEgt - 5.0 + Math.cos(this.simTime * 1.7) * 2.5);
    const cyl3Egt = Math.round(baseEgt + (hasCylinderMisfire ? -120 : 3.0) + Math.sin(this.simTime * 1.9) * 3.0);
    const cyl4Egt = Math.round(baseEgt - 3.0 + Math.cos(this.simTime * 1.3) * 2.5);
    const avgEgt = Math.round((cyl1Egt + cyl2Egt + cyl3Egt + cyl4Egt) / 4);
    const maxEgtDev = Math.max(cyl1Egt, cyl2Egt, cyl3Egt, cyl4Egt) - Math.min(cyl1Egt, cyl2Egt, cyl3Egt, cyl4Egt);
    const egtDeviations: [number, number, number, number] = [
      cyl1Egt - avgEgt,
      cyl2Egt - avgEgt,
      cyl3Egt - avgEgt,
      cyl4Egt - avgEgt,
    ];

    // Lubrication System
    let oilPressureBar = parseFloat((2.8 + (actualEngineRpm / 5800) * 1.8 + Math.sin(this.simTime * 4) * 0.05).toFixed(2));
    if (hasOilPressureLoss) {
      oilPressureBar = parseFloat(Math.max(0.6, 1.1 + Math.sin(this.simTime * 5) * 0.1).toFixed(2));
    }
    const expectedOilPressure = parseFloat((2.8 + (targetRpm / 5800) * 1.8).toFixed(2));
    const oilPressureDeviation = parseFloat((expectedOilPressure - oilPressureBar).toFixed(2));
    const oilTempC = parseFloat((82.0 + (engineLoad / 100) * 24.0 + (hasOverheating || hasOilPressureLoss ? 32.0 : 0.0)).toFixed(1));
    const oilFlowRateLmin = parseFloat((4.5 + (actualEngineRpm / 5800) * 3.2).toFixed(1));

    // Cooling System (Liquid Heads + Ram Air Cylinders)
    const coolantTempC = parseFloat((80.0 + (engineLoad / 100) * 18.0 + (hasOverheating ? 28.0 : 0.0)).toFixed(1));
    const coolantPressureBar = parseFloat((1.15 + (engineLoad / 100) * 0.15).toFixed(2));
    const coolantFlowLmin = parseFloat((14.0 + (actualEngineRpm / 5800) * 6.5).toFixed(1));
    const radiatorTempC = parseFloat((coolantTempC - 18.0).toFixed(1));

    // Vibration Dynamics (Tri-Axial & RMS)
    const baseVibRms = 1.6 + (actualEngineRpm / 5800) * 0.8;
    let vibRms = parseFloat((baseVibRms + Math.sin(this.simTime * 12) * 0.1).toFixed(2));
    if (hasVibAnomaly || hasCylinderMisfire) {
      vibRms = parseFloat((5.8 + Math.sin(this.simTime * 18) * 0.8).toFixed(2));
    }
    const vibX = parseFloat((vibRms * 0.85 + Math.sin(this.simTime * 14) * 0.08).toFixed(2));
    const vibY = parseFloat((vibRms * 0.72 + Math.cos(this.simTime * 16) * 0.08).toFixed(2));
    const vibZ = parseFloat((vibRms * 1.15 + Math.sin(this.simTime * 10) * 0.12).toFixed(2));
    const vibPeak = parseFloat((vibRms * 1.72).toFixed(2));
    const dominantFreqHz = parseFloat((actualEngineRpm / 60).toFixed(1));
    const vibBaseline = 1.8;
    const vibDeviation = parseFloat((vibRms - vibBaseline).toFixed(2));

    // Ignition System (Dual Electronic CDI)
    const ignitionTimingDeg = parseFloat((22.0 + (actualEngineRpm / 5800) * 6.0).toFixed(1));
    const ignitionAdvanceDeg = parseFloat((ignitionTimingDeg - 20.0).toFixed(1));
    const sparkPlugA: ['OK'|'FAULT', 'OK'|'FAULT', 'OK'|'FAULT', 'OK'|'FAULT'] = [
      'OK', 'OK', hasCylinderMisfire ? 'FAULT' : 'OK', 'OK'
    ];
    const sparkPlugB: ['OK'|'FAULT', 'OK'|'FAULT', 'OK'|'FAULT', 'OK'|'FAULT'] = [
      'OK', 'OK', 'OK', 'OK'
    ];

    // Electrical (28V DC Bus & Rotax Alternator)
    const alternatorVoltage = 28.4;
    const alternatorCurrent = parseFloat((11.5 + (engineLoad / 100) * 4.5).toFixed(1));
    const electricalPowerW = parseFloat((alternatorVoltage * alternatorCurrent).toFixed(1));
    const electricalLoadPct = Math.round((alternatorCurrent / 20.0) * 100);

    // Engine Life & Wear Metrics
    this.engineHours += (dt / 3600);
    this.engineFlightHours += (dt / 3600);
    const degradationIndex = parseFloat(Math.min(1.0, 0.076 + (this.engineHours - 1420.0) * 0.0005).toFixed(4));
    const healthIndex = hasOilPressureLoss
      ? 18.5
      : hasOverheating
      ? 34.0
      : hasFuelLeak
      ? 46.0
      : hasVibAnomaly
      ? 52.0
      : hasCylinderMisfire
      ? 58.0
      : hasWastegateStuck
      ? 68.0
      : 94.2;
    const anomalyScore = hasOilPressureLoss
      ? 0.98
      : hasOverheating
      ? 0.92
      : hasFuelLeak
      ? 0.78
      : hasVibAnomaly
      ? 0.72
      : hasCylinderMisfire
      ? 0.65
      : hasWastegateStuck
      ? 0.45
      : 0.03;

    // Assemble Unified Aero-Piston Engine Model
    const engine: AeroEngineTelemetry = {
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
        ambientPressure: parseFloat((1008.4 - (this.droneZ / 8.5)).toFixed(1)),
        ambientTemperature: this.ambientTemp,
      },
      combustion: {
        cht: {
          cylinders: [cyl1Cht, cyl2Cht, cyl3Cht, cyl4Cht],
          average: avgCht,
          maxDeviation: maxChtDev,
          deviations: chtDeviations,
          trend: 0.2,
        },
        egt: {
          cylinders: [cyl1Egt, cyl2Egt, cyl3Egt, cyl4Egt],
          average: avgEgt,
          maxDeviation: maxEgtDev,
          deviations: egtDeviations,
          trend: 0.8,
        },
        exhaustTemperature: avgEgt - 85,
        intakeAirTemperature: iatC,
        combustionStatus: hasCylinderMisfire ? 'LEAN_MISFIRE' : hasOverheating ? 'KNOCK_DETECTED' : 'NOMINAL',
      },
      lubrication: {
        oilPressure: oilPressureBar,
        oilTemperature: oilTempC,
        oilLevel: 96.0,
        oilFlowRate: oilFlowRateLmin,
        oilPressureTrend: 0.01,
        oilTemperatureTrend: 0.12,
        oilPressureDeviation,
        status: hasOilPressureLoss ? 'LOW_PRESSURE' : oilTempC > 120 ? 'HIGH_TEMP' : 'OPTIMAL',
      },
      fuel: {
        fuelFlow: fuelFlowLh,
        fuelPressure: fuelPressureBar,
        fuelTemperature: parseFloat((28.5 + (engineLoad / 100) * 4.0).toFixed(1)),
        fuelQuantity: parseFloat(this.fuelRemainingL.toFixed(1)),
        fuelRemainingPercent: fuelRemainingPct,
        fuelConsumption: parseFloat(this.fuelConsumedL.toFixed(1)),
        fuelConsumptionTrend: 0.05,
        injectionTiming: injectionTimingBtdc,
        injectionDuration: injectionDurationMs,
        status: hasFuelLeak ? 'LEAK_DETECTED' : fuelPressureBar < 2.5 ? 'PRESSURE_DROP' : 'NOMINAL',
      },
      intake: {
        map: mapInHg,
        mapBar,
        intakeAirTemperature: iatC,
        intakeAirPressure: parseFloat((ambientPressInHg * 0.0338639).toFixed(2)),
        airMassFlow,
        throttlePosition: parseFloat(effectiveThrottle.toFixed(1)),
        pressureDifferential: boostDeltaBar,
        wastegatePosition: wastegatePct,
      },
      ignition: {
        ignitionTiming: ignitionTimingDeg,
        ignitionAdvance: ignitionAdvanceDeg,
        sparkPlugStatus: {
          circuitA: sparkPlugA,
          circuitB: sparkPlugB,
        },
        ignitionVoltage: 13.8,
        primaryIgnitionState: hasCylinderMisfire ? 'DEGRADED' : 'ACTIVE',
        secondaryIgnitionState: 'ACTIVE',
        misfireCount: hasCylinderMisfire ? 18 : 0,
        misfireDetected: hasCylinderMisfire,
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
          bearings: hasOilPressureLoss ? 68 : 91,
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
      electrical: {
        batteryVoltage: 28.4,
        batteryCurrent: alternatorCurrent,
        batteryTemperature: 34.0,
        batterySoc: 94.0,
        alternatorVoltage,
        alternatorCurrent,
        electricalPower: electricalPowerW,
        electricalLoad: electricalLoadPct,
        starterStatus: 'DISENGAGED',
      },
      cooling: {
        architecture: 'LIQUID_HEADS_AIR_CYLINDERS',
        coolantTemperature: coolantTempC,
        coolantPressure: coolantPressureBar,
        coolantFlow: coolantFlowLmin,
        radiatorTemperature: radiatorTempC,
        coolingAirTemperature: parseFloat((this.ambientTemp + 2.5).toFixed(1)),
        coolingAirFlow: parseFloat((this.actualSpeed * 1.15).toFixed(1)),
        status: hasOverheating ? 'OVERHEAT' : 'NOMINAL',
      },
      exhaust: {
        egtAverage: avgEgt,
        egtPerCylinder: [cyl1Egt, cyl2Egt, cyl3Egt, cyl4Egt],
        egtMaxDeviation: maxEgtDev,
        exhaustPressure: parseFloat((1.18 + (engineLoad / 100) * 0.22).toFixed(2)),
        exhaustFlow: parseFloat((airMassFlow + fuelFlowLh * 0.74).toFixed(1)),
        exhaustTemperature: avgEgt - 78,
      },
      environment: {
        altitude: parseFloat((APP_CONFIG.baseCoordinates.altMsl + this.droneZ).toFixed(1)),
        airspeed: parseFloat((this.actualSpeed + effectiveWind * 0.2).toFixed(1)),
        oat: this.ambientTemp,
        ambientTemperature: this.ambientTemp,
        ambientPressure: parseFloat((1008.4 - (this.droneZ / 8.5)).toFixed(1)),
        humidity: 62.0,
        airDensity: 1.225,
        windSpeed: parseFloat(effectiveWind.toFixed(1)),
        windDirection: Math.round(this.windDirection),
      },
      health: {
        overallEngineHealth: healthIndex,
        engineHealthIndex: healthIndex,
        degradationIndex,
        anomalyScore,
        faultState: hasOverheating || hasOilPressureLoss || hasVibAnomaly ? 'FAULT' : hasCylinderMisfire || hasFuelLeak || hasWastegateStuck ? 'DEGRADED' : 'HEALTHY',
        faultType: this.getActiveFaults()[0]?.label || null,
        faultSeverity: hasOverheating || hasOilPressureLoss ? 'CRITICAL' : hasVibAnomaly || hasCylinderMisfire ? 'HIGH' : hasFuelLeak || hasWastegateStuck ? 'MEDIUM' : 'NONE',
        healthTrend: hasOverheating || hasOilPressureLoss ? 'DEGRADING' : 'STABLE',
        componentHealth: {
          cylinder: hasOverheating ? 72 : 93,
          bearing: hasOilPressureLoss ? 68 : 91,
          lubrication: hasOilPressureLoss ? 62 : 95,
          fuelSystem: hasFuelLeak ? 70 : 94,
          ignitionSystem: hasCylinderMisfire ? 74 : 96,
          coolingSystem: hasOverheating ? 65 : 95,
          electricalSystem: 94,
        },
      },
      maintenance: {
        engineOperatingHours: parseFloat(this.engineHours.toFixed(1)),
        flightHours: parseFloat(this.engineFlightHours.toFixed(1)),
        engineCycleCount: this.engineCycles,
        cyclesSinceMaintenance: 42,
        operatingHoursSinceMaintenance: 120.4,
        lastMaintenanceDate: '2026-08-15',
        lastMaintenanceHours: 1300.0,
        lastOverhaulDate: 'Depot Zero-Hour Baseline',
        isSimulatedData: true,
        replacementHistory: [
          { component: 'Rotax High-Pressure Oil Filter', atHours: 1300.0, date: '2026-08-15', reason: 'Scheduled 100-hour service' },
          { component: 'NGK DCPR8E Spark Plugs (Set of 8)', atHours: 1200.0, date: '2026-07-02', reason: 'Scheduled replacement interval' },
          { component: 'Turbo Wastegate Actuator Diaphragm', atHours: 1000.0, date: '2026-04-18', reason: 'Preventive service bulletin' },
        ],
        faultHistory: [
          { timestamp: '14:20:11', code: 'E-CHT-02', description: 'Transient CHT elevation on Cylinder 1 during climb', resolved: true },
          { timestamp: '09:15:44', code: 'E-MAP-01', description: 'Wastegate calibration self-test passed', resolved: true },
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
        rulHistory: hasOilPressureLoss
          ? [580, 420, 240, 110, 45, 18, 6, 2.8]
          : hasOverheating
          ? [580, 480, 360, 220, 140, 75, 32, 14.5]
          : [650, 640, 630, 620, 610, 600, 590, 580],
        componentRul: {
          corePowerplantHours: hasOilPressureLoss ? 2.8 : hasOverheating ? 14.5 : 580.0,
          turbochargerHours: hasWastegateStuck ? 82.0 : 420.0,
          oilPumpHours: hasOilPressureLoss ? 1.2 : 580.0,
          alternatorHours: 480.0,
          fuelInjectorsHours: hasFuelLeak ? 18.0 : 340.0,
        },
      },
      derived: {
        powerToFuelEfficiency: parseFloat((powerKw / fuelFlowLh).toFixed(2)),
        chtDeviations,
        egtDeviations,
        rpmError,
        oilPressureDeviation,
        vibrationDeviation: vibDeviation,
        fuelConsumptionTrend: 0.04,
        temperatureTrend: 0.18,
      },
    };

    // Buffer historical engine time-series every 1 second
    if (Math.floor(this.simTime) !== Math.floor(this.simTime - dt)) {
      this.engineHistory.push({
        timeSec: Math.round(this.simTime),
        rpm: Math.round(actualEngineRpm),
        throttle: parseFloat(effectiveThrottle.toFixed(1)),
        engineLoad: Math.round(engineLoad),
        torque,
        powerKw,
        chtAvg: avgCht,
        egtAvg: avgEgt,
        oilPressure: oilPressureBar,
        oilTemp: oilTempC,
        fuelFlow: fuelFlowLh,
        fuelPressure: fuelPressureBar,
        map: mapInHg,
        vibrationRms: vibRms,
        coolantTemp: coolantTempC,
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
        cellVoltages: this.cellVoltages.map((_, i) => (hasBatterySag && i === 3 ? 3.12 : parseFloat((this.batteryVoltage / 6).toFixed(2)))),
        capacityMah: this.batteryCapacityMah,
        remainingCapacityMah: Math.round((this.batteryPct / 100) * this.batteryCapacityMah),
      },

      propulsion: {
        motors,
        totalCurrent: parseFloat(totalCurrent.toFixed(1)),
        totalPower: parseFloat(totalPower.toFixed(1)),
        avgMotorTemp: parseFloat(((m1Temp + m2Temp + m3Temp + m4Temp) / 4).toFixed(1)),
        rotorBalance: hasMotor1Fail ? 32 : hasMotor3Degrade ? 68 : 98,
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
          accuracyM: hasGpsLoss ? 99.0 : 0.8,
          satelliteCount: gpsSats,
          fixType: hasGpsLoss ? 'No Fix' : '3D Fix',
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
          motorTemps: [m1Temp, m2Temp, m3Temp, m4Temp].map((t) => parseFloat(t.toFixed(1))),
          busVoltage: parseFloat(this.batteryVoltage.toFixed(1)),
          rpmReadouts: [m1Rpm, m2Rpm, m3Rpm, m4Rpm].map((r) => Math.round(r)),
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
