import {
  AIPredictionState,
  LSTMPredictionHorizon,
  XGBoostAnomalyState,
  AnomalySubsystemStatus,
  AnomalySeverity,
  ComponentRUL,
  AirworthinessState,
  RULStatus,
  RULTrend,
} from '../types/prediction';
import { DroneTelemetryData } from '../types/telemetry';
import { ActiveFault } from '../types/simulation';

export function computeAIPredictions(
  currentTelemetry: DroneTelemetryData,
  activeFaults: ActiveFault[]
): AIPredictionState {
  const now = Date.now();
  const { simCoordinates, movement, attitude, battery, propulsion, environment, sensors, engine } = currentTelemetry;

  // 1. Compute LSTM Time-Series Horizons (+10s, +30s, +60s)
  const horizons = [10, 30, 60];
  const predictionSteps: LSTMPredictionHorizon[] = horizons.map((hSec) => {
    // Kinematic & aerodynamic extrapolation with dampening
    const vx = Math.cos((attitude.yaw * Math.PI) / 180) * movement.groundSpeed;
    const vy = Math.sin((attitude.yaw * Math.PI) / 180) * movement.groundSpeed;
    const vz = movement.verticalSpeed;

    // Wind drift vector
    const windRad = (environment.windDirection * Math.PI) / 180;
    const windDriftX = Math.cos(windRad) * (environment.windSpeed * 0.15);
    const windDriftY = Math.sin(windRad) * (environment.windSpeed * 0.15);

    const futureX = simCoordinates.x + (vx + windDriftX) * hSec;
    const futureY = simCoordinates.y + (vy + windDriftY) * hSec;
    // Altitude smoothly converges toward target or follows vertical rate
    const futureZ = Math.max(0, simCoordinates.z + vz * hSec * 0.85);

    // Battery polynomial decay based on current draw
    const burnRatePerSec = (battery.current / (battery.capacityMah / 1000)) * (100 / 3600);
    const predictedBattPct = Math.max(0, battery.percentage - burnRatePerSec * hSec);

    // Speed extrapolation
    const predictedSpeed = Math.max(0, movement.airSpeed + (currentTelemetry.flightControl.speedError * 0.1));

    return {
      horizonSeconds: hSec,
      predictedAltitude: parseFloat(futureZ.toFixed(1)),
      predictedSpeed: parseFloat(predictedSpeed.toFixed(1)),
      predictedBatteryPercent: parseFloat(predictedBattPct.toFixed(1)),
      predictedPosition: {
        x: parseFloat(futureX.toFixed(1)),
        y: parseFloat(futureY.toFixed(1)),
        z: parseFloat(futureZ.toFixed(1)),
      },
      uncertaintyBound: {
        altitudeMin: parseFloat((futureZ - 0.4 * Math.sqrt(hSec)).toFixed(1)),
        altitudeMax: parseFloat((futureZ + 0.4 * Math.sqrt(hSec)).toFixed(1)),
        speedMin: parseFloat(Math.max(0, predictedSpeed - 0.3 * Math.sqrt(hSec)).toFixed(1)),
        speedMax: parseFloat((predictedSpeed + 0.3 * Math.sqrt(hSec)).toFixed(1)),
      },
    };
  });

  // Generate 5-point predicted trajectory polyline for map and 3D visualization
  const trajectoryPolyline: Array<{ x: number; y: number; z: number }> = [];
  for (let step = 1; step <= 6; step++) {
    const t = step * 10;
    const vx = Math.cos((attitude.yaw * Math.PI) / 180) * movement.groundSpeed;
    const vy = Math.sin((attitude.yaw * Math.PI) / 180) * movement.groundSpeed;
    trajectoryPolyline.push({
      x: simCoordinates.x + vx * t,
      y: simCoordinates.y + vy * t,
      z: simCoordinates.z + movement.verticalSpeed * t,
    });
  }

  // 2. Compute XGBoost Anomaly Classifications across 6 Subsystems
  const subsystems: AnomalySubsystemStatus[] = [];

  // Check Motor / Propulsion Anomaly
  const rpms = propulsion.motors.map((m) => m.rpm);
  const avgRpm = rpms.reduce((a, b) => a + b, 0) / 4;
  const maxRpmDiff = Math.max(...rpms.map((r) => Math.abs(r - avgRpm)));
  const motorFaultActive = activeFaults.some((f) => f.type.startsWith('MOTOR'));

  let motorSeverity: AnomalySeverity = 'NORMAL';
  let motorScore = 0.04;
  let motorDesc = 'All 4 propulsion units operating symmetrically within nominal torque limits.';
  if (motorFaultActive || maxRpmDiff > 1200) {
    motorSeverity = 'CRITICAL';
    motorScore = 0.94;
    motorDesc = 'Severe thrust asymmetry detected. Motor 3 RPM deviation exceeds safety envelope.';
  } else if (maxRpmDiff > 500) {
    motorSeverity = 'WARNING';
    motorScore = 0.62;
    motorDesc = 'Moderate RPM variance observed across opposing rotor pairs.';
  }

  subsystems.push({
    subsystem: 'Motor Propulsion',
    severity: motorSeverity,
    score: motorScore,
    description: motorDesc,
    contributingFeatures: [
      { feature: 'delta_rpm_m3_m1', importance: 0.42, actualValue: `${Math.round(maxRpmDiff)} RPM`, expectedRange: '< 350 RPM' },
      { feature: 'propulsion_load_balance', importance: 0.31, actualValue: `${propulsion.rotorBalance}%`, expectedRange: '92-100%' },
      { feature: 'esc_phase_current_std', importance: 0.18, actualValue: `${(propulsion.totalCurrent / 4).toFixed(1)} A`, expectedRange: '6.0-10.5 A' },
    ],
  });

  // Battery System Anomaly
  const battFaultActive = activeFaults.some((f) => f.type === 'BATTERY_SAG');
  let battSeverity: AnomalySeverity = 'NORMAL';
  let battScore = 0.06;
  let battDesc = '6S Cell voltages balanced; internal impedance and discharge rate nominal.';
  if (battFaultActive || battery.temperature > 50 || battery.voltage < 21.0) {
    battSeverity = 'CRITICAL';
    battScore = 0.88;
    battDesc = 'Cell sag / abnormal voltage drop under load. Rapid thermal rise detected.';
  } else if (battery.percentage < 20 || battery.temperature > 42) {
    battSeverity = 'WARNING';
    battScore = 0.55;
    battDesc = 'Elevated battery temperature or state of charge below caution threshold.';
  }

  subsystems.push({
    subsystem: 'Battery System',
    severity: battSeverity,
    score: battScore,
    description: battDesc,
    contributingFeatures: [
      { feature: 'pack_voltage_sag_rate', importance: 0.38, actualValue: `${battery.voltage.toFixed(1)} V`, expectedRange: '22.2 - 25.2 V' },
      { feature: 'cell_delta_v', importance: 0.29, actualValue: '0.02 V', expectedRange: '< 0.05 V' },
      { feature: 'bms_pack_temp', importance: 0.22, actualValue: `${battery.temperature.toFixed(0)} °C`, expectedRange: '20 - 45 °C' },
    ],
  });

  // Thermal Dynamics Anomaly
  const maxMotorTemp = Math.max(...propulsion.motors.map((m) => m.temperature));
  let thermSeverity: AnomalySeverity = 'NORMAL';
  let thermScore = 0.05;
  let thermDesc = 'Nacelle and ESC temperatures stable with adequate convective cooling.';
  if (maxMotorTemp > 65) {
    thermSeverity = 'CRITICAL';
    thermScore = 0.91;
    thermDesc = 'Motor coil temperature exceeding continuous rating (65 °C).';
  } else if (maxMotorTemp > 50) {
    thermSeverity = 'WARNING';
    thermScore = 0.48;
    thermDesc = 'Motor temperatures elevated due to sustained high-throttle operation.';
  }

  subsystems.push({
    subsystem: 'Thermal Dynamics',
    severity: thermSeverity,
    score: thermScore,
    description: thermDesc,
    contributingFeatures: [
      { feature: 'max_esc_temp', importance: 0.45, actualValue: `${maxMotorTemp.toFixed(1)} °C`, expectedRange: '< 50 °C' },
      { feature: 'ambient_temp_gradient', importance: 0.30, actualValue: `${environment.ambientTemperature.toFixed(0)} °C`, expectedRange: '-10 to 40 °C' },
    ],
  });

  // Vibration / Aero Anomaly
  const highWindFault = activeFaults.some((f) => f.type === 'SEVERE_WIND_SHEAR');
  let aeroSeverity: AnomalySeverity = 'NORMAL';
  let aeroScore = 0.08;
  let aeroDesc = 'Frame acceleration RMS and harmonic vibration levels within 0.15G nominal baseline.';
  if (highWindFault || environment.windSpeed > 15) {
    aeroSeverity = 'WARNING';
    aeroScore = 0.74;
    aeroDesc = 'Turbulence-induced frame buffeting and crosswind roll torque compensation.';
  }

  subsystems.push({
    subsystem: 'Vibration / Aero',
    severity: aeroSeverity,
    score: aeroScore,
    description: aeroDesc,
    contributingFeatures: [
      { feature: 'imu_accel_rms_z', importance: 0.52, actualValue: `${attitude.totalAcceleration.toFixed(2)} G`, expectedRange: '0.95 - 1.15 G' },
      { feature: 'wind_speed_shear', importance: 0.35, actualValue: `${environment.windSpeed.toFixed(1)} m/s`, expectedRange: '< 12 m/s' },
    ],
  });

  // Sensor Integrity Anomaly
  const gpsFault = activeFaults.some((f) => f.type === 'GPS_SIGNAL_LOSS');
  const baroFault = activeFaults.some((f) => f.type === 'BAROMETER_DRIFT');
  const imuFault = activeFaults.some((f) => f.type === 'IMU_SENSOR_NOISE');
  let sensorSeverity: AnomalySeverity = 'NORMAL';
  let sensorScore = 0.03;
  let sensorDesc = 'EKF state estimation converged with full GPS/IMU/Baro multi-sensor redundancy.';
  if (gpsFault) {
    sensorSeverity = 'CRITICAL';
    sensorScore = 0.95;
    sensorDesc = 'GPS lock lost (0 satellites). EKF falling back to dead-reckoning / optical flow.';
  } else if (baroFault || imuFault) {
    sensorSeverity = 'WARNING';
    sensorScore = 0.65;
    sensorDesc = 'Sensor innovation residual variance elevated in vertical altitude state.';
  }

  subsystems.push({
    subsystem: 'Sensor Integrity',
    severity: sensorSeverity,
    score: sensorScore,
    description: sensorDesc,
    contributingFeatures: [
      { feature: 'gps_hdop_uncertainty', importance: 0.44, actualValue: `${sensors.gps.hdop.toFixed(2)}`, expectedRange: '< 1.20' },
      { feature: 'ekf_innovation_variance', importance: 0.36, actualValue: '0.04 m²', expectedRange: '< 0.10 m²' },
      { feature: 'satellite_constellation', importance: 0.20, actualValue: `${sensors.gps.satelliteCount} Sats`, expectedRange: '> 10 Sats' },
    ],
  });

  // Flight Stability Anomaly
  const rollErr = Math.abs(currentTelemetry.flightControl.rollError);
  const pitchErr = Math.abs(currentTelemetry.flightControl.pitchError);
  let stabSeverity: AnomalySeverity = 'NORMAL';
  let stabScore = 0.04;
  let stabDesc = 'Attitude tracking error within ±2.5° envelope; PID damping optimal.';
  if (rollErr > 15 || pitchErr > 15 || motorSeverity === 'CRITICAL') {
    stabSeverity = 'CRITICAL';
    stabScore = 0.92;
    stabDesc = 'Attitude control margin degraded. Dynamic instability risk detected.';
  } else if (rollErr > 6 || pitchErr > 6) {
    stabSeverity = 'WARNING';
    stabScore = 0.58;
    stabDesc = 'Subtle attitude oscillation detected during wind gust compensation.';
  }

  subsystems.push({
    subsystem: 'Flight Stability',
    severity: stabSeverity,
    score: stabScore,
    description: stabDesc,
    contributingFeatures: [
      { feature: 'attitude_tracking_error', importance: 0.48, actualValue: `${Math.max(rollErr, pitchErr).toFixed(1)}°`, expectedRange: '< 3.0°' },
      { feature: 'angular_rate_covariance', importance: 0.32, actualValue: `${Math.abs(attitude.angularVelocityX).toFixed(1)} °/s`, expectedRange: '< 15.0 °/s' },
    ],
  });

  // Aero-Piston Engine Thermodynamic Core Anomaly
  const engOverheating = activeFaults.some((f) => f.type === 'ENGINE_OVERHEATING');
  const cylMisfire = activeFaults.some((f) => f.type === 'CYLINDER_MISFIRE');
  const chtAvg = engine ? engine.combustion.cht.average : 108.5;
  const chtMaxDev = engine ? engine.combustion.cht.maxDeviation : 3.0;
  let thermoSeverity: AnomalySeverity = 'NORMAL';
  let thermoScore = 0.05;
  let thermoDesc = 'Cylinder head and exhaust gas temperatures balanced within stoichiometric envelope.';
  if (engOverheating || chtAvg > 130) {
    thermoSeverity = 'CRITICAL';
    thermoScore = 0.96;
    thermoDesc = 'Severe thermodynamic core overheating. Cylinder Head Temperature exceeding 130°C.';
  } else if (cylMisfire || chtMaxDev > 15) {
    thermoSeverity = 'WARNING';
    thermoScore = 0.68;
    thermoDesc = 'Cylinder combustion temperature imbalance detected; possible misfire or uneven fuel delivery.';
  }

  subsystems.push({
    subsystem: 'Thermodynamic Core',
    severity: thermoSeverity,
    score: thermoScore,
    description: thermoDesc,
    contributingFeatures: [
      { feature: 'cht_avg_c', importance: 0.46, actualValue: `${chtAvg.toFixed(1)} °C`, expectedRange: '90 - 120 °C' },
      { feature: 'cht_cylinder_spread', importance: 0.32, actualValue: `Δ ${chtMaxDev.toFixed(1)} °C`, expectedRange: '< 8.0 °C' },
      { feature: 'egt_stoich_variance', importance: 0.22, actualValue: `${(engine ? engine.combustion.egt.average : 740)} °C`, expectedRange: '700 - 820 °C' },
    ],
  });

  // Lubrication & Mechanical Circuit Anomaly
  const oilPressureLoss = activeFaults.some((f) => f.type === 'OIL_PRESSURE_LOSS');
  const oilPress = engine ? engine.lubrication.oilPressure : 4.2;
  const oilTemp = engine ? engine.lubrication.oilTemperature : 92.4;
  let lubSeverity: AnomalySeverity = 'NORMAL';
  let lubScore = 0.04;
  let lubDesc = 'Dry-sump lubrication pressure and scavenge flow nominal with clean magnetic chip readings.';
  if (oilPressureLoss || oilPress < 1.8) {
    lubSeverity = 'CRITICAL';
    lubScore = 0.95;
    lubDesc = 'Loss of oil pressure detected. Hydrodynamic bearing film breakdown hazard.';
  } else if (oilTemp > 115 || oilPress < 2.5) {
    lubSeverity = 'WARNING';
    lubScore = 0.62;
    lubDesc = 'Elevated oil circuit temperature or marginal scavenge return pressure.';
  }

  subsystems.push({
    subsystem: 'Lubrication System',
    severity: lubSeverity,
    score: lubScore,
    description: lubDesc,
    contributingFeatures: [
      { feature: 'oil_manifold_pressure', importance: 0.50, actualValue: `${oilPress.toFixed(2)} bar`, expectedRange: '2.0 - 5.0 bar' },
      { feature: 'oil_gallery_temp', importance: 0.32, actualValue: `${oilTemp.toFixed(1)} °C`, expectedRange: '80 - 110 °C' },
      { feature: 'scavenge_flow_rate', importance: 0.18, actualValue: `${(engine ? engine.lubrication.oilFlowRate : 6.8).toFixed(1)} L/min`, expectedRange: '5.0 - 8.5 L/min' },
    ],
  });

  // Calculate overall health score (0-100)
  const maxSubsystemScore = Math.max(...subsystems.map((s) => s.score));
  const overallHealth = Math.round(Math.max(5, (1.0 - maxSubsystemScore) * 100));
  const activeRiskLevel: AnomalySeverity = maxSubsystemScore > 0.8 ? 'CRITICAL' : maxSubsystemScore > 0.4 ? 'WARNING' : 'NORMAL';

  const xgboost: XGBoostAnomalyState = {
    modelName: 'XGBoost-Ensemble-Classifier-v1.8',
    overallHealthScore: overallHealth,
    anomalyDetected: activeRiskLevel !== 'NORMAL',
    activeRiskLevel,
    inferenceLatencyMs: 14.2,
    lastEvaluated: now,
    subsystems,
  };

  // 3. Compute Remaining Useful Life (RUL) & Airworthiness Degradation Curves
  const isM3Fault = activeFaults.some((f) => f.type.startsWith('MOTOR'));
  const isBattFault = activeFaults.some((f) => f.type === 'BATTERY_SAG');

  // Battery RUL
  const battCyclesRemaining = isBattFault ? 142 : Math.round(380 - (100 - battery.percentage) * 0.2);
  const battHealth = isBattFault ? 35 : Math.round((battCyclesRemaining / 500) * 100);
  const battStatus: RULStatus = isBattFault ? 'CRITICAL' : battery.temperature > 45 ? 'MONITOR' : 'NOMINAL';
  const battTrend: RULTrend = isBattFault ? 'ACCELERATING' : 'STABLE';

  // Motor 3 RUL
  const m3Rul = isM3Fault ? 118.5 : 312.0;
  const m3Health = isM3Fault ? 29 : 78;
  const m3Status: RULStatus = isM3Fault ? 'CRITICAL' : 'NOMINAL';
  const m3Trend: RULTrend = isM3Fault ? 'ACCELERATING' : 'STABLE';

  // ESC 3 RUL
  const esc3Rul = isM3Fault ? 210.0 : 495.0;
  const esc3Health = isM3Fault ? 42 : 82;
  const esc3Status: RULStatus = isM3Fault ? 'MONITOR' : 'NOMINAL';
  const esc3Trend: RULTrend = isM3Fault ? 'DEGRADING' : 'STABLE';

  const components: ComponentRUL[] = [
    {
      id: 'rotax-core',
      name: 'Rotax 914F Core Powerplant',
      subsystem: 'Engine Core',
      rulValue: engine ? engine.rul.estimatedRul : (oilPressureLoss ? 2.8 : engOverheating ? 14.5 : 580.0),
      rulUnit: 'hours',
      nominalLife: 2000,
      healthPercent: engine ? Math.round(engine.health.overallEngineHealth) : (oilPressureLoss ? 18 : engOverheating ? 34 : 92),
      status: engOverheating || oilPressureLoss ? 'CRITICAL' : 'NOMINAL',
      degradationRate: oilPressureLoss ? 9.8 : engOverheating ? 4.5 : 0.8,
      trend: engOverheating || oilPressureLoss ? 'ACCELERATING' : 'STABLE',
      sparkline: oilPressureLoss ? [92, 78, 54, 38, 26, 18, 12, 8] : [98, 97, 95, 94, 93, 92, 91, 90],
      stressFactor: oilPressureLoss ? 'Catastrophic oil starvation' : engOverheating ? 'Thermal cylinder stress' : 'Nominal cruise envelope',
      lastMaintenanceHoursAgo: 120.4,
      isSimulatedPrediction: true,
    },
    {
      id: 'turbo-charger',
      name: 'Turbocharger & Wastegate',
      subsystem: 'Turbocharger',
      rulValue: activeFaults.some((f) => f.type === 'TURBO_WASTEGATE_STUCK') ? 82.0 : 420.0,
      rulUnit: 'hours',
      nominalLife: 2000,
      healthPercent: activeFaults.some((f) => f.type === 'TURBO_WASTEGATE_STUCK') ? 48 : 90,
      status: activeFaults.some((f) => f.type === 'TURBO_WASTEGATE_STUCK') ? 'MONITOR' : 'NOMINAL',
      degradationRate: activeFaults.some((f) => f.type === 'TURBO_WASTEGATE_STUCK') ? 2.8 : 0.7,
      trend: activeFaults.some((f) => f.type === 'TURBO_WASTEGATE_STUCK') ? 'DEGRADING' : 'STABLE',
      sparkline: [97, 96, 94, 93, 92, 91, 90, 89],
      stressFactor: activeFaults.some((f) => f.type === 'TURBO_WASTEGATE_STUCK') ? 'Loss of wastegate control' : 'High-altitude turbine boost cycling',
      lastMaintenanceHoursAgo: 420.0,
      isSimulatedPrediction: true,
    },
    {
      id: 'oil-pump',
      name: 'Dry-Sump Lubrication Pump',
      subsystem: 'Lubrication Pump',
      rulValue: oilPressureLoss ? 1.2 : 580.0,
      rulUnit: 'hours',
      nominalLife: 2000,
      healthPercent: oilPressureLoss ? 15 : 95,
      status: oilPressureLoss ? 'CRITICAL' : 'NOMINAL',
      degradationRate: oilPressureLoss ? 12.5 : 0.6,
      trend: oilPressureLoss ? 'ACCELERATING' : 'STABLE',
      sparkline: oilPressureLoss ? [95, 80, 52, 28, 15, 8, 4, 1] : [99, 98, 97, 96, 95, 95, 94, 93],
      stressFactor: oilPressureLoss ? 'Immediate cavitation & pressure collapse' : 'Nominal hydrodynamic film',
      lastMaintenanceHoursAgo: 120.4,
      isSimulatedPrediction: true,
    },
    {
      id: 'rotax-alternator',
      name: '28V Dual-Bus Alternator',
      subsystem: 'Alternator',
      rulValue: 480.0,
      rulUnit: 'hours',
      nominalLife: 1000,
      healthPercent: 94,
      status: 'NOMINAL',
      degradationRate: 0.6,
      trend: 'STABLE',
      sparkline: [99, 98, 97, 96, 96, 95, 95, 94],
      stressFactor: 'Regulated 15.2A continuous load',
      lastMaintenanceHoursAgo: 240.0,
      isSimulatedPrediction: true,
    },
    {
      id: 'batt-6s',
      name: '6S LiPo 10Ah',
      subsystem: 'Battery',
      rulValue: battCyclesRemaining,
      rulUnit: 'cycles',
      nominalLife: 500,
      healthPercent: battHealth,
      status: battStatus,
      degradationRate: isBattFault ? 3.4 : 0.8,
      trend: battTrend,
      sparkline: isBattFault ? [92, 88, 85, 78, 68, 55, 42, 35] : [98, 96, 95, 93, 91, 89, 87, 85],
      stressFactor: isBattFault ? 'Cell #3 impedance spike (>18mΩ)' : 'Nominal discharge',
      lastMaintenanceHoursAgo: 24.5,
    },
    {
      id: 'm1',
      name: 'Motor 1 (CW Front)',
      subsystem: 'Propulsion',
      rulValue: 342.0,
      rulUnit: 'hours',
      nominalLife: 400,
      healthPercent: 85,
      status: 'NOMINAL',
      degradationRate: 1.0,
      trend: 'STABLE',
      sparkline: [95, 94, 92, 90, 89, 87, 86, 85],
      stressFactor: 'Nominal bearing load',
      lastMaintenanceHoursAgo: 48.0,
    },
    {
      id: 'm2',
      name: 'Motor 2 (CCW Front)',
      subsystem: 'Propulsion',
      rulValue: 338.0,
      rulUnit: 'hours',
      nominalLife: 400,
      healthPercent: 84,
      status: 'NOMINAL',
      degradationRate: 1.05,
      trend: 'STABLE',
      sparkline: [94, 93, 91, 89, 88, 86, 85, 84],
      stressFactor: 'Nominal bearing load',
      lastMaintenanceHoursAgo: 48.0,
    },
    {
      id: 'm3',
      name: 'Motor 3 (CW Rear)',
      subsystem: 'Propulsion',
      rulValue: m3Rul,
      rulUnit: 'hours',
      nominalLife: 400,
      healthPercent: m3Health,
      status: m3Status,
      degradationRate: isM3Fault ? 4.2 : 1.1,
      trend: m3Trend,
      sparkline: isM3Fault ? [86, 82, 75, 64, 52, 41, 33, 29] : [93, 91, 89, 87, 85, 83, 80, 78],
      stressFactor: isM3Fault ? 'Harmonic vibration & stator heat' : 'Nominal bearing load',
      lastMaintenanceHoursAgo: 48.0,
    },
    {
      id: 'm4',
      name: 'Motor 4 (CCW Rear)',
      subsystem: 'Propulsion',
      rulValue: 345.0,
      rulUnit: 'hours',
      nominalLife: 400,
      healthPercent: 86,
      status: 'NOMINAL',
      degradationRate: 0.95,
      trend: 'STABLE',
      sparkline: [96, 95, 93, 91, 90, 88, 87, 86],
      stressFactor: 'Nominal bearing load',
      lastMaintenanceHoursAgo: 48.0,
    },
    {
      id: 'esc1',
      name: 'ESC 1 (60A Opto)',
      subsystem: 'ESC',
      rulValue: 520.0,
      rulUnit: 'hours',
      nominalLife: 600,
      healthPercent: 86,
      status: 'NOMINAL',
      degradationRate: 0.85,
      trend: 'STABLE',
      sparkline: [96, 95, 94, 92, 91, 89, 88, 86],
      stressFactor: 'Nominal FET switching',
      lastMaintenanceHoursAgo: 72.0,
    },
    {
      id: 'esc2',
      name: 'ESC 2 (60A Opto)',
      subsystem: 'ESC',
      rulValue: 515.0,
      rulUnit: 'hours',
      nominalLife: 600,
      healthPercent: 85,
      status: 'NOMINAL',
      degradationRate: 0.88,
      trend: 'STABLE',
      sparkline: [95, 94, 93, 91, 90, 88, 87, 85],
      stressFactor: 'Nominal FET switching',
      lastMaintenanceHoursAgo: 72.0,
    },
    {
      id: 'esc3',
      name: 'ESC 3 (60A Opto)',
      subsystem: 'ESC',
      rulValue: esc3Rul,
      rulUnit: 'hours',
      nominalLife: 600,
      healthPercent: esc3Health,
      status: esc3Status,
      degradationRate: isM3Fault ? 2.8 : 0.95,
      trend: esc3Trend,
      sparkline: isM3Fault ? [90, 86, 79, 71, 62, 54, 47, 42] : [94, 92, 91, 89, 87, 85, 84, 82],
      stressFactor: isM3Fault ? 'Phase ripple thermal stress' : 'Nominal FET switching',
      lastMaintenanceHoursAgo: 72.0,
    },
    {
      id: 'esc4',
      name: 'ESC 4 (60A Opto)',
      subsystem: 'ESC',
      rulValue: 522.0,
      rulUnit: 'hours',
      nominalLife: 600,
      healthPercent: 87,
      status: 'NOMINAL',
      degradationRate: 0.82,
      trend: 'STABLE',
      sparkline: [97, 96, 94, 93, 91, 90, 89, 87],
      stressFactor: 'Nominal FET switching',
      lastMaintenanceHoursAgo: 72.0,
    },
  ];

  // Critical path is the component with the lowest health percentage or RUL
  const sortedByHealth = [...components].sort((a, b) => a.healthPercent - b.healthPercent);
  const critical = sortedByHealth[0];

  const fleetScore = Math.min(...components.map((c) => c.healthPercent));

  const rul: AirworthinessState = {
    fleetAirworthinessScore: fleetScore,
    criticalPathComponentId: critical.id,
    criticalPathRemainingHours: critical.rulValue,
    criticalPathName: critical.name,
    nextScheduledMaintenanceHours: Math.min(critical.rulValue, 85.0),
    components,
  };

  return {
    lstm: {
      modelName: 'LSTM-Seq2Seq-v2.4',
      inferenceLatencyMs: 28.5,
      lastUpdated: now,
      predictionSteps,
      trajectoryPolyline,
    },
    xgboost,
    rul,
  };
}
