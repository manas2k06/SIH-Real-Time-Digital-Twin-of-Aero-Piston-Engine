import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DroneTelemetryData } from '../../types/telemetry';

interface DroneModel3DProps {
  telemetry: DroneTelemetryData | null;
}

export const DroneModel3D: React.FC<DroneModel3DProps> = ({ telemetry }) => {
  const groupRef = useRef<THREE.Group>(null);
  const gimbalRef = useRef<THREE.Group>(null);

  // 4 Independent Rotors (M1 Front-Right, M2 Front-Left, M3 Rear-Right, M4 Rear-Left)
  const rotor1Ref = useRef<THREE.Group>(null);
  const rotor2Ref = useRef<THREE.Group>(null);
  const rotor3Ref = useRef<THREE.Group>(null);
  const rotor4Ref = useRef<THREE.Group>(null);

  // Smooth rotation and position interpolation
  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (telemetry) {
      // Attitude Euler angles (Three.js coordinates: Y is UP, -Z is FORWARD, X is RIGHT)
      const targetRollRad = (telemetry.attitude.roll * Math.PI) / 180;
      const targetPitchRad = (telemetry.attitude.pitch * Math.PI) / 180;
      const targetYawRad = (-telemetry.attitude.yaw * Math.PI) / 180;

      // Smooth lerp to prevent numerical jitter
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetPitchRad, 0.15);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -targetRollRad, 0.15);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetYawRad, 0.15);

      // Height subtle hovering offset
      const targetAltitudeVisual = 0.45 + (telemetry.simCoordinates.z % 50) * 0.015;
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetAltitudeVisual, 0.1);

      // Gimbal camera counter-stabilization (keeps camera leveled with horizon)
      if (gimbalRef.current) {
        gimbalRef.current.rotation.x = THREE.MathUtils.lerp(gimbalRef.current.rotation.x, -targetPitchRad * 0.9, 0.2);
        gimbalRef.current.rotation.z = THREE.MathUtils.lerp(gimbalRef.current.rotation.z, targetRollRad * 0.9, 0.2);
      }

      // Spin rotors based on individual motor RPMs
      const m1Rpm = telemetry.propulsion.motors[0]?.rpm ?? 8400;
      const m2Rpm = telemetry.propulsion.motors[1]?.rpm ?? 8400;
      const m3Rpm = telemetry.propulsion.motors[2]?.rpm ?? 8400;
      const m4Rpm = telemetry.propulsion.motors[3]?.rpm ?? 8400;

      // Motors 1 & 4 spin CW (negative), Motors 2 & 3 spin CCW (positive)
      if (rotor1Ref.current) rotor1Ref.current.rotation.y -= (m1Rpm / 60) * Math.PI * 2 * delta * 0.09;
      if (rotor2Ref.current) rotor2Ref.current.rotation.y += (m2Rpm / 60) * Math.PI * 2 * delta * 0.09;
      if (rotor3Ref.current) rotor3Ref.current.rotation.y += (m3Rpm / 60) * Math.PI * 2 * delta * 0.09;
      if (rotor4Ref.current) rotor4Ref.current.rotation.y -= (m4Rpm / 60) * Math.PI * 2 * delta * 0.09;
    }
  });

  // Folding arm motor coordinates (matches exact folding drone geometry)
  // X: Lateral (Right + / Left -), Z: Longitudinal (Rear + / Front -)
  const m1Pos: [number, number, number] = [0.88, 0.06, -0.74]; // Front-Right
  const m2Pos: [number, number, number] = [-0.88, 0.06, -0.74]; // Front-Left
  const m3Pos: [number, number, number] = [0.94, 0.01, 0.82]; // Rear-Right
  const m4Pos: [number, number, number] = [-0.94, 0.01, 0.82]; // Rear-Left

  // Motor Status indicator glow (red on fault, amber on degradation, green on nominal)
  const getMotorLedColor = (motorIndex: number) => {
    if (!telemetry) return '#10b981';
    const status = telemetry.propulsion.motors[motorIndex]?.status;
    if (status === 'FAULT') return '#ef4444';
    if (status === 'DEGRADED') return '#f59e0b';
    return '#10b981';
  };

  // Reusable Folding Propeller Component with Signature Golden Safety Tips
  const renderPropellerAssembly = (
    ref: React.RefObject<THREE.Group>
  ) => {
    return (
      <group ref={ref} position={[0, 0.075, 0]}>
        {/* Central Rotor Hub Cap */}
        <mesh position={[0, 0.01, 0]}>
          <cylinderGeometry args={[0.038, 0.042, 0.03, 16]} />
          <meshStandardMaterial color="#1e242d" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Hub Locking Pin Screws */}
        <mesh position={[0.02, 0.026, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.005, 8]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[-0.02, 0.026, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.005, 8]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Blade 1 (Extending +X) */}
        <group position={[0.03, 0.01, 0]}>
          {/* Main Carbon Blade Body (Curved Aerodynamic Profile) */}
          <mesh position={[0.18, 0, 0]} rotation={[0.08, 0, 0]}>
            <boxGeometry args={[0.34, 0.008, 0.072]} />
            <meshStandardMaterial color="#181c22" roughness={0.4} metalness={0.2} />
          </mesh>
          {/* Signature Golden/Amber Safety Tip */}
          <mesh position={[0.38, 0.001, 0]} rotation={[0.08, 0, 0]}>
            <boxGeometry args={[0.07, 0.009, 0.058]} />
            <meshStandardMaterial
              color="#f59e0b"
              emissive="#b45309"
              emissiveIntensity={0.25}
              roughness={0.3}
              metalness={0.2}
            />
          </mesh>
        </group>

        {/* Blade 2 (Extending -X) */}
        <group position={[-0.03, 0.01, 0]} rotation={[0, Math.PI, 0]}>
          {/* Main Carbon Blade Body */}
          <mesh position={[0.18, 0, 0]} rotation={[0.08, 0, 0]}>
            <boxGeometry args={[0.34, 0.008, 0.072]} />
            <meshStandardMaterial color="#181c22" roughness={0.4} metalness={0.2} />
          </mesh>
          {/* Signature Golden/Amber Safety Tip */}
          <mesh position={[0.38, 0.001, 0]} rotation={[0.08, 0, 0]}>
            <boxGeometry args={[0.07, 0.009, 0.058]} />
            <meshStandardMaterial
              color="#f59e0b"
              emissive="#b45309"
              emissiveIntensity={0.25}
              roughness={0.3}
              metalness={0.2}
            />
          </mesh>
        </group>
      </group>
    );
  };

  return (
    <group ref={groupRef} position={[0, 0.45, 0]}>
      {/* ======================================================== */}
      {/* 1. SCULPTED FUSELAGE / MAIN BODY (Matte Gunmetal Alloy)  */}
      {/* ======================================================== */}
      <group position={[0, 0, 0]}>
        {/* Main Central Aerodynamic Tub */}
        <mesh castShadow receiveShadow position={[0, 0, 0.02]}>
          <boxGeometry args={[0.42, 0.16, 0.88]} />
          <meshStandardMaterial color="#232a34" metalness={0.65} roughness={0.35} />
        </mesh>

        {/* Tapered Nose Section (Chiseled Front) */}
        <mesh castShadow receiveShadow position={[0, -0.01, -0.48]}>
          <boxGeometry args={[0.34, 0.14, 0.22]} />
          <meshStandardMaterial color="#1c222b" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Top Chamfered Canopy Cover with Spine */}
        <mesh castShadow position={[0, 0.09, -0.04]}>
          <boxGeometry args={[0.32, 0.06, 0.74]} />
          <meshStandardMaterial color="#2c3542" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Raised Center Spine Ridge */}
        <mesh position={[0, 0.125, -0.04]}>
          <boxGeometry args={[0.16, 0.02, 0.62]} />
          <meshStandardMaterial color="#364152" metalness={0.7} roughness={0.25} />
        </mesh>

        {/* Top Spine Model Markings (Gold Technical Strip) */}
        <mesh position={[0, 0.137, 0.02]}>
          <boxGeometry args={[0.07, 0.005, 0.24]} />
          <meshStandardMaterial color="#eab308" emissive="#ca8a04" emissiveIntensity={0.35} roughness={0.3} />
        </mesh>

        {/* Rear Battery Pack Compartment & Upper Heat Sink Vents */}
        <group position={[0, 0.07, 0.38]}>
          {/* Battery Housing */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.34, 0.11, 0.28]} />
            <meshStandardMaterial color="#1a2029" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Battery Latch Button */}
          <mesh position={[0, 0.06, -0.08]}>
            <boxGeometry args={[0.12, 0.015, 0.06]} />
            <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.4} />
          </mesh>
          {/* 4S/6S Battery Level LED Matrix */}
          <mesh position={[-0.045, 0.062, 0.04]}>
            <boxGeometry args={[0.018, 0.006, 0.012]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
          <mesh position={[-0.015, 0.062, 0.04]}>
            <boxGeometry args={[0.018, 0.006, 0.012]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
          <mesh position={[0.015, 0.062, 0.04]}>
            <boxGeometry args={[0.018, 0.006, 0.012]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
          <mesh position={[0.045, 0.062, 0.04]}>
            <boxGeometry args={[0.018, 0.006, 0.012]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        </group>

        {/* Side Cooling Intake Grilles */}
        <mesh position={[0.215, 0.01, -0.05]}>
          <boxGeometry args={[0.01, 0.05, 0.36]} />
          <meshStandardMaterial color="#0f1318" roughness={0.9} />
        </mesh>
        <mesh position={[-0.215, 0.01, -0.05]}>
          <boxGeometry args={[0.01, 0.05, 0.36]} />
          <meshStandardMaterial color="#0f1318" roughness={0.9} />
        </mesh>
      </group>

      {/* ======================================================== */}
      {/* 2. FORWARD BINOCULAR SENSORS & 3-AXIS GIMBAL 4K CAMERA   */}
      {/* ======================================================== */}
      <group position={[0, -0.02, -0.58]}>
        {/* Forward Binocular Obstacle Avoidance Stereo Lenses */}
        {/* Right Sensor Eye */}
        <group position={[0.09, 0.03, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.032, 0.032, 0.02, 16]} />
            <meshStandardMaterial color="#0b0e14" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0, -0.012]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.022, 0.022, 0.005, 16]} />
            <meshStandardMaterial color="#0284c7" metalness={0.95} roughness={0.05} />
          </mesh>
        </group>
        {/* Left Sensor Eye */}
        <group position={[-0.09, 0.03, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.032, 0.032, 0.02, 16]} />
            <meshStandardMaterial color="#0b0e14" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0, -0.012]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.022, 0.022, 0.005, 16]} />
            <meshStandardMaterial color="#0284c7" metalness={0.95} roughness={0.05} />
          </mesh>
        </group>

        {/* 3-Axis Stabilized Mechanical Gimbal & 4K Camera Payload */}
        <group ref={gimbalRef} position={[0, -0.11, 0.06]}>
          {/* Gimbal Top Shock Mount Bracket */}
          <mesh position={[0, 0.04, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.03, 12]} />
            <meshStandardMaterial color="#11161f" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Gimbal Yaw Motor Pod */}
          <mesh position={[0, 0.015, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.03, 12]} />
            <meshStandardMaterial color="#1a202c" metalness={0.9} roughness={0.15} />
          </mesh>
          {/* U-Shaped Roll Bracket Arm */}
          <mesh position={[0.065, -0.03, 0]}>
            <boxGeometry args={[0.02, 0.08, 0.04]} />
            <meshStandardMaterial color="#1e2634" metalness={0.8} />
          </mesh>

          {/* 4K Camera Body (Rectangular Rounded Bezel) */}
          <group position={[0, -0.05, 0]}>
            <mesh castShadow position={[0, 0, 0]}>
              <boxGeometry args={[0.13, 0.12, 0.16]} />
              <meshStandardMaterial color="#131822" metalness={0.8} roughness={0.25} />
            </mesh>
            {/* Front Lens Barrel */}
            <mesh position={[0, 0, -0.09]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.045, 0.048, 0.04, 20]} />
              <meshStandardMaterial color="#0f141d" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Camera Optical Glass Lens Element */}
            <mesh position={[0, 0, -0.112]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.035, 0.035, 0.005, 20]} />
              <meshStandardMaterial color="#0369a1" metalness={0.95} roughness={0.05} />
            </mesh>
            {/* Red 4K Recording Indicator Ring */}
            <mesh position={[0, 0, -0.075]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.049, 0.049, 0.004, 20]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
          </group>
        </group>
      </group>

      {/* ======================================================== */}
      {/* 3. FOLDING CANTILEVER ARMS & FRONT LANDING GEAR FEET     */}
      {/* ======================================================== */}
      {/* FRONT-RIGHT ARM (Spans to M1) */}
      <group position={[0.18, 0.02, -0.15]}>
        {/* Hinge Joint Knuckle at Fuselage */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.045, 0.045, 0.05, 12]} />
          <meshStandardMaterial color="#1a202c" metalness={0.85} roughness={0.2} />
        </mesh>
        {/* Cantilever Arm Beam */}
        <mesh position={[0.34, 0.01, -0.28]} rotation={[0, -0.68, 0]}>
          <boxGeometry args={[0.09, 0.055, 0.82]} />
          <meshStandardMaterial color="#212833" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Gold Technical Decal on Arm */}
        <mesh position={[0.34, 0.04, -0.28]} rotation={[0, -0.68, 0]}>
          <boxGeometry args={[0.035, 0.002, 0.18]} />
          <meshStandardMaterial color="#eab308" emissive="#ca8a04" emissiveIntensity={0.2} />
        </mesh>
      </group>

      {/* FRONT-LEFT ARM (Spans to M2) */}
      <group position={[-0.18, 0.02, -0.15]}>
        {/* Hinge Joint Knuckle */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.045, 0.045, 0.05, 12]} />
          <meshStandardMaterial color="#1a202c" metalness={0.85} roughness={0.2} />
        </mesh>
        {/* Cantilever Arm Beam */}
        <mesh position={[-0.34, 0.01, -0.28]} rotation={[0, 0.68, 0]}>
          <boxGeometry args={[0.09, 0.055, 0.82]} />
          <meshStandardMaterial color="#212833" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Gold Technical Decal on Arm */}
        <mesh position={[-0.34, 0.04, -0.28]} rotation={[0, 0.68, 0]}>
          <boxGeometry args={[0.035, 0.002, 0.18]} />
          <meshStandardMaterial color="#eab308" emissive="#ca8a04" emissiveIntensity={0.2} />
        </mesh>
      </group>

      {/* REAR-RIGHT ARM (Spans to M3) */}
      <group position={[0.18, -0.01, 0.22]}>
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.042, 0.042, 0.05, 12]} />
          <meshStandardMaterial color="#1a202c" metalness={0.85} />
        </mesh>
        <mesh position={[0.36, 0.01, 0.28]} rotation={[0, 0.72, 0]}>
          <boxGeometry args={[0.085, 0.05, 0.86]} />
          <meshStandardMaterial color="#212833" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* REAR-LEFT ARM (Spans to M4) */}
      <group position={[-0.18, -0.01, 0.22]}>
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.042, 0.042, 0.05, 12]} />
          <meshStandardMaterial color="#1a202c" metalness={0.85} />
        </mesh>
        <mesh position={[-0.36, 0.01, 0.28]} rotation={[0, -0.72, 0]}>
          <boxGeometry args={[0.085, 0.05, 0.86]} />
          <meshStandardMaterial color="#212833" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* FRONT VERTICAL LANDING GEAR LEGS WITH RED WARNING REFLECTORS */}
      {/* Front-Right Landing Gear Leg */}
      <group position={[m1Pos[0], m1Pos[1] - 0.14, m1Pos[2]]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.055, 0.24, 0.055]} />
          <meshStandardMaterial color="#181e26" metalness={0.7} roughness={0.4} />
        </mesh>
        {/* Red Reflector Badge on Outer Leg Face (Matches image!) */}
        <mesh position={[0.029, 0.02, 0]}>
          <boxGeometry args={[0.005, 0.065, 0.035]} />
          <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={0.6} roughness={0.2} />
        </mesh>
        {/* Rubberized Base Foot */}
        <mesh position={[0, -0.12, 0]}>
          <cylinderGeometry args={[0.032, 0.036, 0.02, 12]} />
          <meshStandardMaterial color="#0c1015" roughness={0.9} />
        </mesh>
      </group>

      {/* Front-Left Landing Gear Leg */}
      <group position={[m2Pos[0], m2Pos[1] - 0.14, m2Pos[2]]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.055, 0.24, 0.055]} />
          <meshStandardMaterial color="#181e26" metalness={0.7} roughness={0.4} />
        </mesh>
        {/* Red Reflector Badge on Outer Leg Face (Matches image!) */}
        <mesh position={[-0.029, 0.02, 0]}>
          <boxGeometry args={[0.005, 0.065, 0.035]} />
          <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={0.6} roughness={0.2} />
        </mesh>
        {/* Rubberized Base Foot */}
        <mesh position={[0, -0.12, 0]}>
          <cylinderGeometry args={[0.032, 0.036, 0.02, 12]} />
          <meshStandardMaterial color="#0c1015" roughness={0.9} />
        </mesh>
      </group>

      {/* Rear Landing Skid Pegs (Under Rear Motor Pods) */}
      <mesh position={[m3Pos[0], m3Pos[1] - 0.08, m3Pos[2]]}>
        <cylinderGeometry args={[0.025, 0.03, 0.1, 10]} />
        <meshStandardMaterial color="#181e26" roughness={0.8} />
      </mesh>
      <mesh position={[m4Pos[0], m4Pos[1] - 0.08, m4Pos[2]]}>
        <cylinderGeometry args={[0.025, 0.03, 0.1, 10]} />
        <meshStandardMaterial color="#181e26" roughness={0.8} />
      </mesh>

      {/* ======================================================== */}
      {/* 4. TWO-TONE BRUSHLESS MOTORS (M1 - M4)                   */}
      {/* ======================================================== */}
      {/* MOTOR 1 POD (Front-Right, CW) */}
      <group position={m1Pos}>
        {/* Lower Motor Base / Stator Mount (Dark Charcoal) */}
        <mesh position={[0, -0.02, 0]}>
          <cylinderGeometry args={[0.082, 0.082, 0.045, 20]} />
          <meshStandardMaterial color="#181e26" metalness={0.75} roughness={0.35} />
        </mesh>
        {/* Upper Rotating Motor Bell (Brushed Metallic Silver / Titanium - matches image!) */}
        <mesh position={[0, 0.025, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.045, 20]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.18} />
        </mesh>
        {/* Status Indicator LED Ring */}
        <mesh position={[0, -0.045, 0]}>
          <cylinderGeometry args={[0.084, 0.084, 0.012, 20]} />
          <meshBasicMaterial color={getMotorLedColor(0)} />
        </mesh>
        {/* Rotor & Propeller Blades with Golden Tips */}
        {renderPropellerAssembly(rotor1Ref)}
      </group>

      {/* MOTOR 2 POD (Front-Left, CCW) */}
      <group position={m2Pos}>
        <mesh position={[0, -0.02, 0]}>
          <cylinderGeometry args={[0.082, 0.082, 0.045, 20]} />
          <meshStandardMaterial color="#181e26" metalness={0.75} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.025, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.045, 20]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.18} />
        </mesh>
        <mesh position={[0, -0.045, 0]}>
          <cylinderGeometry args={[0.084, 0.084, 0.012, 20]} />
          <meshBasicMaterial color={getMotorLedColor(1)} />
        </mesh>
        {renderPropellerAssembly(rotor2Ref)}
      </group>

      {/* MOTOR 3 POD (Rear-Right, CW) */}
      <group position={m3Pos}>
        <mesh position={[0, -0.02, 0]}>
          <cylinderGeometry args={[0.082, 0.082, 0.045, 20]} />
          <meshStandardMaterial color="#181e26" metalness={0.75} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.025, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.045, 20]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.18} />
        </mesh>
        <mesh position={[0, -0.045, 0]}>
          <cylinderGeometry args={[0.084, 0.084, 0.012, 20]} />
          <meshBasicMaterial color={getMotorLedColor(2)} />
        </mesh>
        {renderPropellerAssembly(rotor3Ref)}
      </group>

      {/* MOTOR 4 POD (Rear-Left, CCW) */}
      <group position={m4Pos}>
        <mesh position={[0, -0.02, 0]}>
          <cylinderGeometry args={[0.082, 0.082, 0.045, 20]} />
          <meshStandardMaterial color="#181e26" metalness={0.75} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.025, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.045, 20]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.18} />
        </mesh>
        <mesh position={[0, -0.045, 0]}>
          <cylinderGeometry args={[0.084, 0.084, 0.012, 20]} />
          <meshBasicMaterial color={getMotorLedColor(3)} />
        </mesh>
        {renderPropellerAssembly(rotor4Ref)}
      </group>
    </group>
  );
};
