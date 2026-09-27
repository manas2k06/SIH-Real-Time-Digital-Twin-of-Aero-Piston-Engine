export type FlightMode = 'AUTO' | 'MANUAL' | 'GUIDED' | 'RTL' | 'FAILSAFE' | 'HOLD';
export type SystemStatus = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'OFFLINE' | 'CALIBRATING';
export type MotorStatus = 'NORMAL' | 'DEGRADED' | 'FAULT' | 'OFFLINE';

export interface GeographicPosition {
  latitude: number; // e.g. 37.7749 deg
  longitude: number; // e.g. -122.4194 deg
  altitudeMsl: number; // Mean Sea Level altitude (m)
  altitudeAgl: number; // Above Ground Level altitude (m)
}

export interface SimulationCoordinates {
  x: number; // Local NED or Cartesian X (m)
  y: number; // Local NED or Cartesian Y (m)
  z: number; // Local NED or Cartesian Z (m)
}

export interface MovementTelemetry {
  groundSpeed: number; // m/s
  airSpeed: number; // m/s
  verticalSpeed: number; // m/s (climb rate)
  heading: number; // degrees 0-360
}

export interface AttitudeMotion {
  roll: number; // deg (-180 to 180)
  pitch: number; // deg (-90 to 90)
  yaw: number; // deg (0 to 360)
  angularVelocityX: number; // deg/s
  angularVelocityY: number; // deg/s
  angularVelocityZ: number; // deg/s
  accelerationX: number; // m/s^2 or G
  accelerationY: number; // m/s^2
  accelerationZ: number; // m/s^2
  totalAcceleration: number; // G
}

export interface BatteryState {
  percentage: number; // 0-100%
  voltage: number; // V (e.g., 22.8V for 6S)
  current: number; // A (e.g., 8.4A)
  power: number; // W (e.g., 191.5W)
  temperature: number; // deg C
  remainingFlightTimeMinutes: number; // min
  consumptionRate: number; // mAh/min or W/km
  cellVoltages: number[]; // 6S individual voltages (e.g., [3.80, 3.81, 3.79, 3.80, 3.80, 3.80])
  capacityMah: number;
  remainingCapacityMah: number;
}

export interface MotorTelemetry {
  id: number; // 1, 2, 3, 4
  name: string; // M1, M2, M3, M4
  position: 'Front-Right' | 'Front-Left' | 'Rear-Right' | 'Rear-Left';
  direction: 'CW' | 'CCW';
  rpm: number; // RPM (e.g., 8420)
  loadPercent: number; // 0-100%
  current: number; // A
  voltage: number; // V
  power: number; // W
  temperature: number; // deg C
  status: MotorStatus;
  vibrationLevel: number; // mm/s
}

export interface PropulsionState {
  motors: [MotorTelemetry, MotorTelemetry, MotorTelemetry, MotorTelemetry];
  totalCurrent: number;
  totalPower: number;
  avgMotorTemp: number;
  rotorBalance: number; // % (100% = perfectly balanced)
}

export interface FlightControlTargetActual {
  targetAltitude: number;
  actualAltitude: number;
  altitudeError: number;
  
  targetSpeed: number;
  actualSpeed: number;
  speedError: number;
  
  targetHeading: number;
  actualHeading: number;
  headingError: number;
  
  targetRoll: number;
  actualRoll: number;
  rollError: number;
  
  targetPitch: number;
  actualPitch: number;
  pitchError: number;
}

export interface Waypoint {
  id: number;
  lat: number;
  lng: number;
  altitude: number;
  x: number;
  y: number;
  reached: boolean;
  name?: string;
}

export interface MissionState {
  missionId: string;
  name: string;
  status: 'ACTIVE' | 'STANDBY' | 'COMPLETED' | 'PAUSED' | 'ABORTED';
  currentWaypoint: number;
  totalWaypoints: number;
  progressPercent: number;
  distanceTravelledKm: number;
  distanceRemainingKm: number;
  currentObjective: string;
  estimatedCompletionTimeSeconds: number;
  waypoints: Waypoint[];
}

export interface EnvironmentalConditions {
  ambientTemperature: number; // deg C
  pressureHpa: number; // hPa
  humidity: number; // %
  windSpeed: number; // m/s
  windDirection: number; // deg (0-360)
  airDensity: number; // kg/m^3
  visibilityKm: number; // km
}

export interface SensorTelemetry {
  imu: {
    accelX: number;
    accelY: number;
    accelZ: number;
    gyroX: number;
    gyroY: number;
    gyroZ: number;
    temp: number;
  };
  gps: {
    latitude: number;
    longitude: number;
    altitude: number;
    accuracyM: number;
    satelliteCount: number;
    fixType: '3D Fix' | '2D Fix' | 'RTK Fixed' | 'No Fix';
    hdop: number;
  };
  barometer: {
    pressureHpa: number;
    altitudeM: number;
    temperatureC: number;
  };
  magnetometer: {
    magX: number;
    magY: number;
    magZ: number;
    heading: number;
  };
  esc: {
    motorTemps: number[];
    busVoltage: number;
    rpmReadouts: number[];
  };
}

export interface DroneTelemetryData {
  timestamp: number;
  droneId: string;
  connectionStatus: 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING';
  flightMode: FlightMode;
  systemStatus: SystemStatus;
  updateFrequencyHz: number;
  
  geoPosition: GeographicPosition;
  simCoordinates: SimulationCoordinates;
  movement: MovementTelemetry;
  attitude: AttitudeMotion;
  battery: BatteryState;
  propulsion: PropulsionState;
  flightControl: FlightControlTargetActual;
  mission: MissionState;
  environment: EnvironmentalConditions;
  sensors: SensorTelemetry;
  engine: import('./engine').AeroEngineTelemetry;
  engineHistory?: import('./engine').EngineTelemetryHistoryPoint[];
  flightPathHistory: Array<{ x: number; y: number; z: number; timestamp: number }>;
}

export * from './engine';

