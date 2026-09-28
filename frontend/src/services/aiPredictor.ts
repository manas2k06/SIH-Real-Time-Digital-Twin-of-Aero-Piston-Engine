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

  let motorSeverity: AnomalySeverity = 'NORMAL';
  let motorScore = 0.04;
  let motorDesc = 'All 4 propulsion units operating symmetrically within nominal torque limits.';
  if (maxRpmDiff > 1200) {
    motorSeverity = 'CRITICAL';
    motorScore = 0.94;
    motorDesc = 'Severe thrust asymmetry detected. Motor RPM deviation exceeds safety envelope.';
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
  let battSeverity: AnomalySeverity = 'NORMAL';
  let battScore = 0.06;
  let battDesc = '6S Cell voltages balanced; internal impedance and discharge rate nominal.';
  if (battery.temperature > 50 || battery.voltage < 21.0) {
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
  let aeroSeverity: AnomalySeverity = 'NORMAL';
  let aeroScore = 0.08;
  let aeroDesc = 'Frame acceleration RMS and harmonic vibration levels within 0.15G nominal baseline.';
  if (environment.windSpeed > 15) {
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
  let sensorSeverity: AnomalySeverity = 'NORMAL';
  let sensorScore = 0.03;
  let sensorDesc = 'EKF state estimation converged with full GPS/IMU/Baro multi-sensor redundancy.';
  if (sensors.gps.satelliteCount < 4 || sensors.gps.hdop > 5.0) {
    sensorSeverity = 'CRITICAL';
    sensorScore = 0.95;
    sensorDesc = 'GPS lock lost (< 4 satellites). EKF falling back to dead-reckoning / optical flow.';
  } else if (sensors.gps.hdop > 1.8) {
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
  if (rollErr > 15 || pitchErr > 15) {
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
  const coolantRise = activeFaults.some((f) => f.type === 'COOLANT_TEMP_RISE');
  const reducedFlow = activeFaults.some((f) => f.type === 'REDUCED_COOLANT_FLOW');
  const cylMisfire = activeFaults.some((f) => f.type === 'CYLINDER_MISFIRE');
  const chtAvg = engine ? engine.combustion.cht.average : 108.5;
  const chtMaxDev = engine ? engine.combustion.cht.maxDeviation : 3.0;
  let thermoSeverity: AnomalySeverity = 'NORMAL';
  let thermoScore = 0.05;
  let thermoDesc = 'Cylinder head and exhaust gas temperatures balanced within stoichiometric envelope.';
  if (engOverheating || coolantRise || chtAvg > 130) {
    thermoSeverity = 'CRITICAL';
    thermoScore = 0.96;
    thermoDesc = 'Severe thermodynamic core overheating. Cylinder Head Temperature exceeding 130°C.';
  } else if (reducedFlow || cylMisfire || chtMaxDev > 15) {
    thermoSeverity = 'WARNING';
    thermoScore = 0.68;
    thermoDesc = reducedFlow
      ? 'Coolant circulation flow restriction; cylinder head thermal gradient divergence.'
      : 'Cylinder combustion temperature imbalance detected; possible misfire or uneven fuel delivery.';
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
  const highOilTemp = activeFaults.some((f) => f.type === 'HIGH_OIL_TEMP');
  const oilDegrade = activeFaults.some((f) => f.type === 'OIL_SYSTEM_DEGRADATION');
  const oilPress = engine ? engine.lubrication.oilPressure : 4.2;
  const oilTemp = engine ? engine.lubrication.oilTemperature : 92.4;
  let lubSeverity: AnomalySeverity = 'NORMAL';
  let lubScore = 0.04;
  let lubDesc = 'Dry-sump lubrication pressure and scavenge flow nominal with clean magnetic chip readings.';
  if (oilPressureLoss || oilPress < 1.8 || highOilTemp) {
    lubSeverity = 'CRITICAL';
    lubScore = 0.95;
    lubDesc = oilPressureLoss
      ? 'Loss of oil pressure detected. Hydrodynamic bearing film breakdown hazard.'
      : 'Oil temperature exceeds 130°C redline; thermal breakdown and viscosity collapse.';
  } else if (oilDegrade || oilTemp > 115 || oilPress < 2.5) {
    lubSeverity = 'WARNING';
    lubScore = 0.62;
    lubDesc = 'Elevated oil circuit temperature or scavenge aeration / chip detector warning.';
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

  // Turbo Induction & TCU Anomaly
  const isWastegateFault = activeFaults.some((f) => f.type === 'TURBO_WASTEGATE_STUCK');
  const isTcuFault = activeFaults.some((f) => f.type === 'TCU_FAULT');
  const isOverboost = activeFaults.some((f) => f.type === 'TURBO_OVERBOOST');
  const isTurboDegrade = activeFaults.some((f) => f.type === 'TURBO_DEGRADATION');
  const boostBar = engine ? engine.turbocharger.turbocharger.boostPressureBar : 0.22;
  const tcuStatus = engine ? engine.turbocharger.tcu.status : 'ONLINE';
  let turboSeverity: AnomalySeverity = 'NORMAL';
  let turboScore = 0.04;
  let turboDesc = 'TCU automatic wastegate servo control holding manifold boost at stoichiometric reference.';
  if (isOverboost) {
    turboSeverity = 'CRITICAL';
    turboScore = 0.97;
    turboDesc = 'Manifold overboost detected (MAP > 39.9 inHg). Wastegate jammed closed, manifold overpressure hazard.';
  } else if (isWastegateFault || isTcuFault || tcuStatus === 'FAULT') {
    turboSeverity = 'CRITICAL';
    turboScore = 0.94;
    turboDesc = 'Wastegate control loss or TCU servo fault. Boost pressure collapsed to atmospheric vacuum.';
  } else if (isTurboDegrade || (boostBar < 0.10 && (engine?.operating.engineLoad ?? 0) > 70)) {
    turboSeverity = 'WARNING';
    turboScore = 0.58;
    turboDesc = 'Underboost condition or compressor aerodynamic drag during high-load profile.';
  }

  subsystems.push({
    subsystem: 'Turbo Induction',
    severity: turboSeverity,
    score: turboScore,
    description: turboDesc,
    contributingFeatures: [
      { feature: 'boost_pressure_bar', importance: 0.48, actualValue: `${boostBar.toFixed(2)} bar`, expectedRange: '0.18 - 0.35 bar' },
      { feature: 'wastegate_pos_pct', importance: 0.34, actualValue: `${engine?.turbocharger.wastegate.position ?? 55}%`, expectedRange: '15 - 90%' },
      { feature: 'tcu_servo_tracking', importance: 0.18, actualValue: tcuStatus, expectedRange: 'ONLINE' },
    ],
  });

  // Fuel Delivery & Carburetor Balance Anomaly
  const isFuelLeak = activeFaults.some((f) => f.type === 'FUEL_SYSTEM_LEAK');
  const isPump1Fail = activeFaults.some((f) => f.type === 'FUEL_PUMP_1_FAILURE');
  const isPump2Fail = activeFaults.some((f) => f.type === 'FUEL_PUMP_2_FAILURE');
  const isCarbImbalance = activeFaults.some((f) => f.type === 'CARBURETOR_IMBALANCE');
  const fuelPress = engine ? engine.fuel_system.fuelPressure : 3.2;
  const carbBalance = engine ? engine.carburetors.balance : 98.8;
  let fuelSeverity: AnomalySeverity = 'NORMAL';
  let fuelScore = 0.04;
  let fuelDesc = 'Twin Bing 64 constant-depression carburetors synchronized; fuel regulator maintaining airbox+0.25 bar.';
  if (isFuelLeak || fuelPress < 2.0) {
    fuelSeverity = 'CRITICAL';
    fuelScore = 0.96;
    fuelDesc = 'Fuel delivery pressure loss or regulator diaphragm rupture hazard.';
  } else if (isPump1Fail || isPump2Fail || isCarbImbalance || carbBalance < 88) {
    fuelSeverity = 'WARNING';
    fuelScore = 0.64;
    fuelDesc = isPump1Fail
      ? 'Primary fuel pump 1 trip; redundant standby fuel pump 2 carrying full bus flow.'
      : isPump2Fail
      ? 'Auxiliary fuel pump 2 electrical trip; redundancy lost.'
      : 'Bing 64 carburetors vacuum synchronization skew detected between cylinder banks.';
  }

  subsystems.push({
    subsystem: 'Fuel Delivery & Carburetors',
    severity: fuelSeverity,
    score: fuelScore,
    description: fuelDesc,
    contributingFeatures: [
      { feature: 'fuel_regulator_delta_bar', importance: 0.45, actualValue: `${(engine?.fuel_system.fuelPressureDeltaOverAirbox ?? 0.25).toFixed(2)} bar`, expectedRange: '0.20 - 0.30 bar' },
      { feature: 'bing64_carb_balance', importance: 0.35, actualValue: `${carbBalance.toFixed(1)}%`, expectedRange: '> 92.0%' },
      { feature: 'pump_operational_redundancy', importance: 0.20, actualValue: isPump1Fail ? 'P2 ONLY' : 'P1+P2 OK', expectedRange: 'P1 ACTIVE' },
    ],
  });

  // Propeller Reduction Gearbox Anomaly
  const isGearboxVib = activeFaults.some((f) => f.type === 'GEARBOX_VIBRATION');
  const isGearboxOverheat = activeFaults.some((f) => f.type === 'GEARBOX_TEMP_INCREASE');
  const isBearingDegrade = activeFaults.some((f) => f.type === 'BEARING_DEGRADATION');
  const isVibAnomaly = activeFaults.some((f) => f.type === 'VIBRATION_ANOMALY');
  const gbVib = engine ? engine.gearbox.gearbox_vibration : 1.8;
  const gbTemp = engine ? engine.gearbox.gearbox_temperature : 78.5;
  let gbSeverity: AnomalySeverity = 'NORMAL';
  let gbScore = 0.04;
  let gbDesc = 'Propeller speed reduction gearbox (2.43:1) dog clutch engagement and casing harmonics nominal.';
  if (isGearboxVib || isBearingDegrade || gbVib > 5.5) {
    gbSeverity = 'CRITICAL';
    gbScore = 0.93;
    gbDesc = isBearingDegrade
      ? 'Crankshaft journal bearing hydrodynamic film wear; 1X mechanical harmonic surge.'
      : 'Severe gearbox vibration harmonic flutter detected; overload clutch slippage or tooth mesh wear.';
  } else if (isGearboxOverheat || isVibAnomaly || gbTemp > 100 || gbVib > 3.5) {
    gbSeverity = 'WARNING';
    gbScore = 0.60;
    gbDesc = 'Elevated gearbox casing temperature or abnormal torsional resonance.';
  }

  subsystems.push({
    subsystem: 'Reduction Gearbox & Prop',
    severity: gbSeverity,
    score: gbScore,
    description: gbDesc,
    contributingFeatures: [
      { feature: 'gearbox_vibration_rms', importance: 0.52, actualValue: `${gbVib.toFixed(2)} mm/s`, expectedRange: '< 2.50 mm/s' },
      { feature: 'gearbox_casing_temp', importance: 0.30, actualValue: `${gbTemp.toFixed(1)} °C`, expectedRange: '< 95.0 °C' },
      { feature: 'reduction_ratio_sync', importance: 0.18, actualValue: '2.42857 : 1', expectedRange: '2.43 : 1' },
    ],
  });

  // Dual Ducati CDI Ignition System Anomaly
  const isIgnAFail = activeFaults.some((f) => f.type === 'IGNITION_A_FAILURE');
  const isIgnBFail = activeFaults.some((f) => f.type === 'IGNITION_B_FAILURE');
  const ignConsistency = engine ? engine.ignition.dualIgnitionConsistency : 99.4;
  let ignSeverity: AnomalySeverity = 'NORMAL';
  let ignScore = 0.03;
  let ignDesc = 'Dual electronic CDI ignition circuits A & B fully firing with 26° BTDC advance.';
  if (isIgnAFail || isIgnBFail || (engine?.ignition.dualIgnitionState !== 'BOTH_ACTIVE')) {
    ignSeverity = 'WARNING';
    ignScore = 0.72;
    ignDesc = isIgnAFail
      ? 'Ignition Circuit A loss; operating on single circuit B with engine RPM droop.'
      : 'Ignition Circuit B loss; operating on single circuit A with engine RPM droop.';
  } else if (cylMisfire) {
    ignSeverity = 'CRITICAL';
    ignScore = 0.90;
    ignDesc = 'Dual CDI spark failure on cylinder 3 causing misfire and unburnt hydrocarbon buildup.';
  }

  subsystems.push({
    subsystem: 'Ignition System',
    severity: ignSeverity,
    score: ignScore,
    description: ignDesc,
    contributingFeatures: [
      { feature: 'dual_cdi_consistency', importance: 0.50, actualValue: `${ignConsistency.toFixed(1)}%`, expectedRange: '> 95.0%' },
      { feature: 'spark_status_circuit_a', importance: 0.30, actualValue: isIgnAFail ? 'FAULT' : 'ACTIVE', expectedRange: 'ACTIVE' },
      { feature: 'timing_advance_deg', importance: 0.20, actualValue: `${(engine?.ignition.ignitionTiming ?? 26.0).toFixed(1)}° BTDC`, expectedRange: '22 - 28° BTDC' },
    ],
  });

  // Exhaust System & Gas Path Anomaly
  const isExhaustRestrict = activeFaults.some((f) => f.type === 'EXHAUST_RESTRICTION');
  const isEgtImbalance = activeFaults.some((f) => f.type === 'CYLINDER_EGT_IMBALANCE');
  let exhSeverity: AnomalySeverity = 'NORMAL';
  let exhScore = 0.04;
  let exhDesc = 'Exhaust collector backpressure and cylinder gas path temperatures nominal.';
  if (isExhaustRestrict || (engine?.exhaust.egtAverage ?? 0) > 940) {
    exhSeverity = 'CRITICAL';
    exhScore = 0.95;
    exhDesc = 'Pre-turbine exhaust restriction; EGT exceeding 950°C redline with severe power choke.';
  } else if (isEgtImbalance || (engine?.exhaust.egtMaxDeviation ?? 0) > 75) {
    exhSeverity = 'WARNING';
    exhScore = 0.65;
    exhDesc = 'Cylinder bank EGT spread exceeding 85°C; mixture skew or dirty jetting.';
  }

  subsystems.push({
    subsystem: 'Exhaust System',
    severity: exhSeverity,
    score: exhScore,
    description: exhDesc,
    contributingFeatures: [
      { feature: 'egt_average_c', importance: 0.52, actualValue: `${(engine?.exhaust.egtAverage ?? 760)} °C`, expectedRange: '< 880 °C' },
      { feature: 'egt_bank_spread', importance: 0.32, actualValue: `Δ ${(engine?.exhaust.egtMaxDeviation ?? 25)} °C`, expectedRange: '< 45 °C' },
      { feature: 'exhaust_backpressure', importance: 0.16, actualValue: `${(engine?.exhaust.exhaustPressure ?? 1.25).toFixed(2)} bar`, expectedRange: '< 1.45 bar' },
    ],
  });

  // Electrical & Generation Anomaly
  const isGenFail = activeFaults.some((f) => f.type === 'GENERATOR_FAILURE');
  const isAltFail = activeFaults.some((f) => f.type === 'ALTERNATOR_FAILURE');
  let elecSeverity: AnomalySeverity = 'NORMAL';
  let elecScore = 0.03;
  let elecDesc = 'Integrated 250W AC generator and 28V alternator supplying full avionics load.';
  if (isGenFail && isAltFail) {
    elecSeverity = 'CRITICAL';
    elecScore = 0.94;
    elecDesc = 'Total generation loss; aircraft avionics and TCU operating on buffer battery drain.';
  } else if (isGenFail || isAltFail) {
    elecSeverity = 'WARNING';
    elecScore = 0.65;
    elecDesc = isGenFail
      ? 'Integrated 250W AC generator cutout; alternator carrying primary electrical bus.'
      : 'External 40A alternator regulator dropout; bus voltage sagged to buffer level.';
  }

  subsystems.push({
    subsystem: 'Electrical System',
    severity: elecSeverity,
    score: elecScore,
    description: elecDesc,
    contributingFeatures: [
      { feature: 'dc_bus_voltage', importance: 0.48, actualValue: `${(engine?.electrical.batteryVoltage ?? 28.4).toFixed(1)} V`, expectedRange: '27.5 - 28.8 V' },
      { feature: 'generator_power_w', importance: 0.32, actualValue: `${(engine?.electrical.integratedGeneratorPowerW ?? 220)} W`, expectedRange: '> 180 W' },
      { feature: 'alternator_status', importance: 0.20, actualValue: isAltFail ? 'FAULT' : 'ACTIVE', expectedRange: 'ACTIVE' },
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
  // Battery RUL
  const battCyclesRemaining = Math.round(380 - (100 - battery.percentage) * 0.2);
  const battHealth = Math.round((battCyclesRemaining / 500) * 100);
  const battStatus: RULStatus = battery.temperature > 45 ? 'MONITOR' : 'NOMINAL';
  const battTrend: RULTrend = 'STABLE';

  // Motor 3 RUL
  const m3Rul = 312.0;
  const m3Health = 78;
  const m3Status: RULStatus = 'NOMINAL';
  const m3Trend: RULTrend = 'STABLE';

  // ESC 3 RUL
  const esc3Rul = 495.0;
  const esc3Health = 82;
  const esc3Status: RULStatus = 'NOMINAL';
  const esc3Trend: RULTrend = 'STABLE';

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
      id: 'rotax-gearbox',
      name: 'Propeller Reduction Gearbox (2.43:1)',
      subsystem: 'Reduction Gearbox',
      rulValue: isGearboxVib ? 45.0 : 580.0,
      rulUnit: 'hours',
      nominalLife: 2000,
      healthPercent: isGearboxVib ? 42 : 96,
      status: isGearboxVib ? 'CRITICAL' : 'NOMINAL',
      degradationRate: isGearboxVib ? 8.5 : 0.5,
      trend: isGearboxVib ? 'ACCELERATING' : 'STABLE',
      sparkline: isGearboxVib ? [96, 85, 70, 55, 42, 30, 22, 18] : [99, 98, 98, 97, 97, 96, 96, 95],
      stressFactor: isGearboxVib ? 'Dog clutch overload flutter' : 'Nominal helical gear meshing',
      lastMaintenanceHoursAgo: 120.4,
      isSimulatedPrediction: true,
    },
    {
      id: 'rotax-carburetors',
      name: 'Twin Bing 64 Carburetors',
      subsystem: 'Carburetors',
      rulValue: isCarbImbalance ? 110.0 : 450.0,
      rulUnit: 'hours',
      nominalLife: 1000,
      healthPercent: isCarbImbalance ? 55 : 95,
      status: isCarbImbalance ? 'MONITOR' : 'NOMINAL',
      degradationRate: isCarbImbalance ? 2.4 : 0.6,
      trend: isCarbImbalance ? 'DEGRADING' : 'STABLE',
      sparkline: [98, 97, 96, 95, 94, 93, 92, 91],
      stressFactor: isCarbImbalance ? 'Vacuum diaphragm linkage imbalance' : 'Nominal float bowl regulation',
      lastMaintenanceHoursAgo: 85.0,
      isSimulatedPrediction: true,
    },
    {
      id: 'rotax-ignition',
      name: 'Dual Ducati CDI Ignition System',
      subsystem: 'Ignition System',
      rulValue: isIgnAFail ? 65.0 : cylMisfire ? 80.0 : 490.0,
      rulUnit: 'hours',
      nominalLife: 1000,
      healthPercent: isIgnAFail ? 22 : cylMisfire ? 62 : 98,
      status: isIgnAFail ? 'CRITICAL' : cylMisfire ? 'MONITOR' : 'NOMINAL',
      degradationRate: isIgnAFail ? 7.2 : 0.4,
      trend: isIgnAFail ? 'ACCELERATING' : 'STABLE',
      sparkline: [99, 99, 98, 98, 97, 97, 96, 95],
      stressFactor: isIgnAFail ? 'Circuit A stator coil failure' : 'Nominal high-voltage spark cycling',
      lastMaintenanceHoursAgo: 85.0,
      isSimulatedPrediction: true,
    },
    {
      id: 'fuel-pumps',
      name: 'Dual 12V Electric Fuel Pumps & Regulator',
      subsystem: 'Fuel System',
      rulValue: isPump1Fail ? 95.0 : isFuelLeak ? 30.0 : 520.0,
      rulUnit: 'hours',
      nominalLife: 1000,
      healthPercent: isPump1Fail ? 68 : isFuelLeak ? 42 : 96,
      status: isFuelLeak ? 'CRITICAL' : isPump1Fail ? 'MONITOR' : 'NOMINAL',
      degradationRate: isFuelLeak ? 8.0 : isPump1Fail ? 3.0 : 0.5,
      trend: isFuelLeak ? 'ACCELERATING' : 'STABLE',
      sparkline: [98, 97, 96, 95, 94, 93, 92, 91],
      stressFactor: isPump1Fail ? 'Primary vane pump motor trip' : 'Airbox + 0.25 bar regulated delivery',
      lastMaintenanceHoursAgo: 85.0,
      isSimulatedPrediction: true,
    },
    {
      id: 'cooling-system',
      name: 'Liquid / Ram-Air Mixed Cooling System',
      subsystem: 'Cooling System',
      rulValue: engOverheating ? 15.0 : 490.0,
      rulUnit: 'hours',
      nominalLife: 1000,
      healthPercent: engOverheating ? 45 : 96,
      status: engOverheating ? 'CRITICAL' : 'NOMINAL',
      degradationRate: engOverheating ? 6.5 : 0.5,
      trend: engOverheating ? 'ACCELERATING' : 'STABLE',
      sparkline: [98, 97, 96, 95, 94, 93, 92, 91],
      stressFactor: engOverheating ? 'Radiator thermal saturation' : 'Closed-loop expansion tank convection',
      lastMaintenanceHoursAgo: 120.4,
      isSimulatedPrediction: true,
    },
    {
      id: 'crankshaft-bearings',
      name: 'Crankshaft Main & Connecting Bearings',
      subsystem: 'Bearings',
      rulValue: oilPressureLoss ? 1.5 : 580.0,
      rulUnit: 'hours',
      nominalLife: 2000,
      healthPercent: oilPressureLoss ? 18 : 94,
      status: oilPressureLoss ? 'CRITICAL' : 'NOMINAL',
      degradationRate: oilPressureLoss ? 14.0 : 0.4,
      trend: oilPressureLoss ? 'ACCELERATING' : 'STABLE',
      sparkline: [99, 98, 97, 96, 95, 95, 94, 93],
      stressFactor: oilPressureLoss ? 'Metal-to-metal boundary friction' : 'Hydrodynamic pressurized film',
      lastMaintenanceHoursAgo: 120.4,
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
      degradationRate: 0.8,
      trend: battTrend,
      sparkline: [98, 96, 95, 93, 91, 89, 87, 85],
      stressFactor: 'Nominal discharge',
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
      degradationRate: 1.1,
      trend: m3Trend,
      sparkline: [93, 91, 89, 87, 85, 83, 80, 78],
      stressFactor: 'Nominal bearing load',
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
      degradationRate: 0.95,
      trend: esc3Trend,
      sparkline: [94, 92, 91, 89, 87, 85, 84, 82],
      stressFactor: 'Nominal FET switching',
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
