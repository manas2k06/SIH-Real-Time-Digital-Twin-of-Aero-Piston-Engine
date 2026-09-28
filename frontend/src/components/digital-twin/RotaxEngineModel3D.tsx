import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DroneTelemetryData } from '../../types/telemetry';

export interface RotaxEngineModel3DProps {
  telemetry: DroneTelemetryData | null;
  showPropeller?: boolean;
  showHotspots?: boolean;
  showHeatmap?: boolean;
  selectedComponent?: string | null;
  onSelectComponent?: (componentName: string | null) => void;
}

export const RotaxEngineModel3D: React.FC<RotaxEngineModel3DProps> = ({
  telemetry,
  showPropeller = true,
  showHotspots = true,
  showHeatmap = false,
  selectedComponent = null,
  onSelectComponent,
}) => {
  const rootShakeGroupRef = useRef<THREE.Group>(null);
  const propGroupRef = useRef<THREE.Group>(null);
  const blurDiscRef = useRef<THREE.Mesh>(null);
  const turboImpellerRef = useRef<THREE.Group>(null);
  const wastegateArmRef = useRef<THREE.Group>(null);

  // Hover state for interactive 3D inspection
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  // Extract key engine telemetry parameters
  const engine = telemetry?.engine;
  const rpm = engine?.operating?.rpm ?? 0;
  const boostDeltaBar = engine?.intake?.pressureDifferential ?? 0;
  const wastegatePct = engine?.intake?.wastegatePosition ?? 0;
  const overallVib = engine?.vibration?.overallVibration ?? 1.8;
  const vibX = engine?.vibration?.vibrationX ?? 0.8;
  const vibY = engine?.vibration?.vibrationY ?? 0.8;
  const vibZ = engine?.vibration?.vibrationZ ?? 1.2;

  // Cylinder temperatures (Rotax 914: Cyl 1 & 3 on one bank, Cyl 2 & 4 on other bank)
  const [cyl1Cht, cyl2Cht, cyl3Cht, cyl4Cht] = engine?.combustion?.cht?.cylinders ?? [102, 108, 104, 101];
  const maxCht = Math.max(cyl1Cht, cyl2Cht, cyl3Cht, cyl4Cht);

  // Lubrication and Cooling
  const oilPressure = engine?.lubrication?.oilPressure ?? 3.8;

  // Fault detection states
  const isOverheating = (engine?.cooling?.status === 'OVERHEAT') || maxCht > 130;
  const isOilLoss = (engine?.lubrication?.status === 'LOW_PRESSURE') || oilPressure < 1.8;
  const isWastegateStuck = (engine?.intake?.wastegatePosition ?? 0) > 85 && boostDeltaBar < 0.05;
  const isCylMisfire = engine?.combustion?.combustionStatus === 'LEAN_MISFIRE' || (cyl3Cht < 75);
  const isVibAnomaly = overallVib > 4.5;
  const isFuelLeak = engine?.fuel?.status === 'LEAK_DETECTED';

  // Reduction gearbox ratio: 2.4286 (51 teeth / 21 teeth) - from Rotax 914 manual p. 127
  const GEAR_REDUCTION_RATIO = 2.42857;
  const propRpm = rpm / GEAR_REDUCTION_RATIO;

  // Frame loop: Dynamic rotations, physical micro-vibration, wastegate actuation, and thermal emissions
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 1. Physical Propeller & Flange Rotation (Counter-Clockwise looking at flange face, per manual p. 127)
    if (propGroupRef.current) {
      if (rpm > 10) {
        // Rotational velocity: radians per second = (RPM / 60) * 2 * PI
        const radPerSec = (propRpm / 60) * Math.PI * 2;
        // Looking from front towards engine, counter-clockwise rotation around Z
        propGroupRef.current.rotation.z += radPerSec * delta;
      }
    }

    // 2. Propeller Motion Blur Disc Opacity based on RPM
    if (blurDiscRef.current) {
      const blurMaterial = blurDiscRef.current.material as THREE.MeshStandardMaterial;
      if (blurMaterial) {
        if (rpm > 2200) {
          const targetOpacity = Math.min(0.68, ((rpm - 2200) / 3600) * 0.7);
          blurMaterial.opacity = THREE.MathUtils.lerp(blurMaterial.opacity, targetOpacity, 0.1);
          blurMaterial.transparent = true;
          blurDiscRef.current.visible = true;
        } else {
          blurMaterial.opacity = THREE.MathUtils.lerp(blurMaterial.opacity, 0, 0.15);
          if (blurMaterial.opacity < 0.02) blurDiscRef.current.visible = false;
        }
      }
    }

    // 3. High-Speed Turbocharger Impeller Spin (spins at ~12x - 16x crankshaft speed)
    if (turboImpellerRef.current && rpm > 10) {
      const turboRadPerSec = ((rpm * 12) / 60) * Math.PI * 2;
      turboImpellerRef.current.rotation.x += turboRadPerSec * delta;
    }

    // 4. Wastegate Actuator Arm Articulation
    if (wastegateArmRef.current) {
      // 0% open = 0 rad, 100% open = ~0.65 rad swing
      const targetAngle = (wastegatePct / 100) * 0.65;
      wastegateArmRef.current.rotation.z = THREE.MathUtils.lerp(
        wastegateArmRef.current.rotation.z,
        targetAngle,
        0.1
      );
    }

    // 5. Realistic Engine Harmonic Micro-Vibration & Mechanical Jitter
    if (rootShakeGroupRef.current) {
      if (rpm > 50) {
        // Base vibration frequency proportional to 4-stroke boxer engine RPM
        const engineFreq = (rpm / 60) * 2; // 2 combustion events per revolution in 4-cyl 4-stroke
        const shakeIntensity = 0.0006 * (overallVib / 2.0) * (1 + (rpm / 5800) * 0.8);

        // Cylinder misfire or severe vibration anomaly induces sudden erratic kicks
        const anomalyKick = isVibAnomaly || isCylMisfire ? Math.sin(time * 38) * 0.003 : 0;

        rootShakeGroupRef.current.position.x = Math.sin(time * engineFreq * 6.28) * (shakeIntensity * vibX + anomalyKick);
        rootShakeGroupRef.current.position.y = Math.cos(time * engineFreq * 6.28 * 0.5) * (shakeIntensity * vibY);
        rootShakeGroupRef.current.position.z = Math.sin(time * engineFreq * 3.14 + 1.2) * (shakeIntensity * vibZ);

        // Subtle rotational torque reaction kick on throttle changes
        rootShakeGroupRef.current.rotation.z = Math.sin(time * engineFreq * 6.28) * (shakeIntensity * 0.4);
      } else {
        rootShakeGroupRef.current.position.set(0, 0, 0);
        rootShakeGroupRef.current.rotation.set(0, 0, 0);
      }
    }
  });

  // Reusable PBR Materials Memoization
  const materials = useMemo(() => {
    return {
      // Cast aluminum for crankcase & gear housings (natural die-cast finish)
      crankcase: new THREE.MeshStandardMaterial({
        color: '#d8dee6',
        metalness: 0.72,
        roughness: 0.38,
      }),
      crankcaseDark: new THREE.MeshStandardMaterial({
        color: '#8b96a4',
        metalness: 0.8,
        roughness: 0.42,
      }),
      // Ram-air cooling fins for cylinder barrels (ribbed graphite-aluminum)
      cylinderFins: new THREE.MeshStandardMaterial({
        color: '#2b333c',
        metalness: 0.82,
        roughness: 0.35,
      }),
      // Signature bright crimson red Rotax rocker/valve covers
      rotaxRed: new THREE.MeshStandardMaterial({
        color: '#cf1028',
        metalness: 0.4,
        roughness: 0.22,
      }),
      // Overheated pulsing red/orange rocker cover
      rotaxRedOverheat: new THREE.MeshStandardMaterial({
        color: '#ff2200',
        emissive: '#e63900',
        emissiveIntensity: 0.85,
        metalness: 0.4,
        roughness: 0.2,
      }),
      // Embossed Rotax silver logo lettering
      rotaxLogoWhite: new THREE.MeshStandardMaterial({
        color: '#ffffff',
        metalness: 0.85,
        roughness: 0.15,
      }),
      // Stainless steel exhaust headers (AISI 309 / DIN 1.4828 per manual p. 39)
      exhaustStainless: new THREE.MeshStandardMaterial({
        color: '#9aa2aa',
        metalness: 0.88,
        roughness: 0.28,
      }),
      // Hot glowing incandescent exhaust under high load or thermal run
      exhaustGlowing: new THREE.MeshStandardMaterial({
        color: '#ff4400',
        emissive: '#d63000',
        emissiveIntensity: 1.4,
        metalness: 0.7,
        roughness: 0.3,
      }),
      // Muffler canister
      muffler: new THREE.MeshStandardMaterial({
        color: '#848d97',
        metalness: 0.86,
        roughness: 0.32,
      }),
      // High-precision machined propeller hub flange & spigot
      propFlange: new THREE.MeshStandardMaterial({
        color: '#1a1f26',
        metalness: 0.9,
        roughness: 0.2,
      }),
      // Chrome/plated mounting studs and bolts
      chromeBolts: new THREE.MeshStandardMaterial({
        color: '#e2e8f0',
        metalness: 0.98,
        roughness: 0.1,
      }),
      // Glossy black spin-on oil filter
      oilFilter: new THREE.MeshStandardMaterial({
        color: '#0e1115',
        metalness: 0.5,
        roughness: 0.25,
      }),
      // Oil filter critical fault pulse
      oilFilterFault: new THREE.MeshStandardMaterial({
        color: '#ff1a1a',
        emissive: '#cc0000',
        emissiveIntensity: 1.2,
        metalness: 0.6,
        roughness: 0.2,
      }),
      // Turbocharger compressor scroll (cast aluminum)
      turboScroll: new THREE.MeshStandardMaterial({
        color: '#d0d7df',
        metalness: 0.78,
        roughness: 0.32,
      }),
      // Turbo turbine housing (heat-treated cast alloy)
      turboTurbine: new THREE.MeshStandardMaterial({
        color: '#464f59',
        metalness: 0.82,
        roughness: 0.45,
      }),
      // Thick reinforced black silicone boost & coolant hoses
      blackHose: new THREE.MeshStandardMaterial({
        color: '#16191d',
        metalness: 0.08,
        roughness: 0.85,
      }),
      // Stainless worm-gear hose clamps
      hoseClamp: new THREE.MeshStandardMaterial({
        color: '#e5e7eb',
        metalness: 0.95,
        roughness: 0.12,
      }),
      // Brass carburetor fittings, banjo bolts, fuel nipples
      brass: new THREE.MeshStandardMaterial({
        color: '#cca43b',
        metalness: 0.9,
        roughness: 0.22,
      }),
      // Bing carburetors cast aluminum bodies
      carbBody: new THREE.MeshStandardMaterial({
        color: '#c4cad2',
        metalness: 0.75,
        roughness: 0.35,
      }),
      // Airbox intake plenum (lightweight composite / satin aluminum)
      airbox: new THREE.MeshStandardMaterial({
        color: '#1e2329',
        metalness: 0.6,
        roughness: 0.45,
      }),
      // Coolant expansion tank
      coolantTank: new THREE.MeshStandardMaterial({
        color: '#bcc5cf',
        metalness: 0.78,
        roughness: 0.3,
      }),
      // Radiator cap brass/chrome
      radiatorCap: new THREE.MeshStandardMaterial({
        color: '#d9a74a',
        metalness: 0.92,
        roughness: 0.18,
      }),
      // Carbon fiber propeller blade
      carbonBlade: new THREE.MeshStandardMaterial({
        color: '#15191e',
        metalness: 0.3,
        roughness: 0.32,
      }),
      // Propeller blade high-visibility amber warning tip
      propTipYellow: new THREE.MeshStandardMaterial({
        color: '#f59e0b',
        metalness: 0.2,
        roughness: 0.3,
      }),
      // Transparent spinning propeller blur disc
      propBlur: new THREE.MeshStandardMaterial({
        color: '#cbd5e1',
        transparent: true,
        opacity: 0.0,
        roughness: 0.6,
        metalness: 0.1,
        side: THREE.DoubleSide,
      }),
      // Test stand ring mount tubular frame (from reference photo 2)
      standTubing: new THREE.MeshStandardMaterial({
        color: '#334155',
        metalness: 0.85,
        roughness: 0.35,
      }),
    };
  }, []);

  // Calculate dynamic cylinder head thermal materials
  const getChtMaterial = (cylTemp: number) => {
    if (showHeatmap || isOverheating) {
      if (cylTemp > 135) return materials.rotaxRedOverheat;
      if (cylTemp > 120) {
        return new THREE.MeshStandardMaterial({
          color: '#e64a19',
          emissive: '#bf360c',
          emissiveIntensity: 0.5,
          metalness: 0.4,
          roughness: 0.25,
        });
      }
    }
    return materials.rotaxRed;
  };

  // Cylinder cooling fin disc stack helper
  const renderCylinderFins = (length: number = 0.24, radius: number = 0.14, finCount: number = 9) => {
    const fins = [];
    const spacing = length / finCount;
    for (let i = 0; i < finCount; i++) {
      fins.push(
        <mesh key={i} position={[0, 0, (i - finCount / 2) * spacing]}>
          <cylinderGeometry args={[radius, radius, 0.008, 20]} />
          <primitive object={materials.cylinderFins} attach="material" />
        </mesh>
      );
    }
    return (
      <group>
        {/* Core Cylinder Sleeve Barrel */}
        <mesh>
          <cylinderGeometry args={[radius * 0.82, radius * 0.82, length, 20]} />
          <primitive object={materials.crankcaseDark} attach="material" />
        </mesh>
        {fins}
      </group>
    );
  };

  // Red Rocker Cover with Embossed "ROTAX" Lettering & Center Stud
  const renderRockerCover = (
    label: string,
    cylTemp: number,
    isMisfiring: boolean = false
  ) => {
    const isSelected = selectedComponent === label || hoveredPart === label;
    const coverMaterial = getChtMaterial(cylTemp);

    return (
      <group
        onPointerOver={(e) => {
          e.stopPropagation();
          setHoveredPart(label);
        }}
        onPointerOut={() => setHoveredPart(null)}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent?.(selectedComponent === label ? null : label);
        }}
      >
        {/* Main Angled Beveled Red Cover Box */}
        <mesh castShadow receiveShadow position={[0, 0, 0]}>
          <boxGeometry args={[0.22, 0.14, 0.12]} />
          <primitive object={coverMaterial} attach="material" />
        </mesh>

        {/* Top Chamfer Bevel Roof */}
        <mesh position={[0, 0.055, 0]}>
          <boxGeometry args={[0.18, 0.035, 0.09]} />
          <primitive object={coverMaterial} attach="material" />
        </mesh>

        {/* Center Chrome Hold-Down Stud with Belleville Washer */}
        <mesh position={[0, 0.075, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.02, 12]} />
          <primitive object={materials.chromeBolts} attach="material" />
        </mesh>
        <mesh position={[0, 0.088, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.016, 6]} />
          <primitive object={materials.chromeBolts} attach="material" />
        </mesh>

        {/* Embossed Silver "ROTAX" 3D Raised Lettering Plaque */}
        <group position={[0, 0, 0.063]}>
          <mesh position={[0, 0.01, 0]}>
            <boxGeometry args={[0.13, 0.032, 0.005]} />
            <primitive object={materials.rotaxLogoWhite} attach="material" />
          </mesh>
          {/* Subtle logo contrast base */}
          <mesh position={[0, 0.01, -0.001]}>
            <boxGeometry args={[0.14, 0.038, 0.003]} />
            <meshBasicMaterial color="#1a0000" />
          </mesh>
        </group>

        {/* Spark Plug Connectors (Dual Ignition per head: 1 top, 1 bottom) */}
        <group position={[-0.06, 0.05, -0.04]}>
          <mesh rotation={[0.4, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.014, 0.05, 10]} />
            <primitive object={materials.blackHose} attach="material" />
          </mesh>
        </group>
        <group position={[0.06, -0.05, -0.04]}>
          <mesh rotation={[-0.4, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.014, 0.05, 10]} />
            <primitive object={materials.blackHose} attach="material" />
          </mesh>
        </group>

        {/* Misfire Electrical Spark Flash effect */}
        {isMisfiring && (
          <mesh position={[0, 0.08, 0]}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshBasicMaterial color="#facc15" wireframe />
          </mesh>
        )}

        {/* Interactive Selection Halo */}
        {isSelected && (
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.24, 0.16, 0.14]} />
            <meshBasicMaterial color="#00c0e8" wireframe />
          </mesh>
        )}
      </group>
    );
  };

  return (
    <group position={[0, 0.35, 0]} scale={[1.35, 1.35, 1.35]}>
      {/* Root Harmonic Vibration Shake Group */}
      <group ref={rootShakeGroupRef}>
        {/* ======================================================== */}
        {/* 1. CENTRAL CRANKCASE / ENGINE BLOCK (Horizontally Split) */}
        {/* ======================================================== */}
        <group position={[0, 0, 0]}>
          {/* Main Aluminum Crankcase Body */}
          <mesh castShadow receiveShadow position={[0, 0, 0]}>
            <boxGeometry args={[0.44, 0.38, 0.58]} />
            <primitive object={materials.crankcase} attach="material" />
          </mesh>

          {/* Longitudinal Vertical Splitting Seam & Ribbing */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.455, 0.395, 0.02]} />
            <primitive object={materials.crankcaseDark} attach="material" />
          </mesh>
          <mesh position={[0, 0.195, 0]}>
            <boxGeometry args={[0.06, 0.02, 0.56]} />
            <primitive object={materials.crankcaseDark} attach="material" />
          </mesh>

          {/* Lower Oil Sump Pan */}
          <mesh castShadow position={[0, -0.22, 0.02]}>
            <boxGeometry args={[0.34, 0.08, 0.44]} />
            <primitive object={materials.crankcaseDark} attach="material" />
          </mesh>
          {/* Sump Magnetic Drain Plug (M12 per manual p. 66) */}
          <mesh position={[0, -0.265, -0.06]}>
            <cylinderGeometry args={[0.018, 0.018, 0.02, 6]} />
            <primitive object={materials.chromeBolts} attach="material" />
          </mesh>

          {/* Rear Magneto / Generator Housing */}
          <mesh castShadow position={[0, 0.02, 0.34]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.18, 0.20, 0.16, 24]} />
            <primitive object={materials.crankcase} attach="material" />
          </mesh>
          {/* Ignition Housing Cover Plate */}
          <mesh position={[0, 0.02, 0.425]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.015, 24]} />
            <primitive object={materials.crankcaseDark} attach="material" />
          </mesh>
        </group>

        {/* ======================================================== */}
        {/* 2. PROPELLER REDUCTION GEARBOX (Front / Power Take-Off)  */}
        {/* ======================================================== */}
        <group
          position={[0, 0.05, -0.34]}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredPart('gearbox');
          }}
          onPointerOut={() => setHoveredPart(null)}
          onClick={(e) => {
            e.stopPropagation();
            onSelectComponent?.(selectedComponent === 'gearbox' ? null : 'gearbox');
          }}
        >
          {/* Tapered Cast Aluminum Gearbox Housing */}
          <mesh castShadow receiveShadow position={[0, 0, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.16, 0.21, 0.22, 24]} />
            <primitive object={materials.crankcase} attach="material" />
          </mesh>

          {/* Front Gearbox Bearing Nose Cone */}
          <mesh castShadow position={[0, 0, -0.22]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.11, 0.15, 0.08, 24]} />
            <primitive object={materials.crankcase} attach="material" />
          </mesh>

          {/* Circumferential Gearbox Flange Perimeter Bolts */}
          {Array.from({ length: 10 }).map((_, i) => {
            const angle = (i * Math.PI * 2) / 10;
            return (
              <mesh
                key={i}
                position={[Math.cos(angle) * 0.18, Math.sin(angle) * 0.18, -0.02]}
                rotation={[Math.PI / 2, 0, 0]}
              >
                <cylinderGeometry args={[0.009, 0.009, 0.02, 6]} />
                <primitive object={materials.chromeBolts} attach="material" />
              </mesh>
            );
          })}

          {/* Selection indicator */}
          {(selectedComponent === 'gearbox' || hoveredPart === 'gearbox') && (
            <mesh position={[0, 0, -0.15]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.19, 0.19, 0.28, 24]} />
              <meshBasicMaterial color="#00c0e8" wireframe />
            </mesh>
          )}

          {/* ---------------------------------------------------- */}
          {/* ROTATING PROPELLER DRIVE SHAFT & FLANGE ASSEMBLY    */}
          {/* ---------------------------------------------------- */}
          <group ref={propGroupRef} position={[0, 0, -0.28]}>
            {/* Hardened Steel Drive Shaft Spindle */}
            <mesh position={[0, 0, -0.02]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.038, 0.038, 0.06, 24]} />
              <primitive object={materials.chromeBolts} attach="material" />
            </mesh>

            {/* Black Propeller Mounting Flange Disk (PCD 75/80/101.6mm) */}
            <mesh castShadow position={[0, 0, -0.045]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.125, 0.125, 0.018, 32]} />
              <primitive object={materials.propFlange} attach="material" />
            </mesh>

            {/* Central Pilot Hub Spigot (Dia 47mm per manual p. 127/128) */}
            <mesh position={[0, 0, -0.07]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.047, 0.047, 0.036, 24]} />
              <primitive object={materials.propFlange} attach="material" />
            </mesh>

            {/* 6 High-Tensile Propeller Drive Studs on Bolt Circle */}
            {Array.from({ length: 6 }).map((_, i) => {
              const angle = (i * Math.PI * 2) / 6;
              const pcdRadius = 0.082; // ~80mm pitch circle
              return (
                <group
                  key={i}
                  position={[Math.cos(angle) * pcdRadius, Math.sin(angle) * pcdRadius, -0.055]}
                >
                  <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.009, 0.009, 0.025, 12]} />
                    <primitive object={materials.chromeBolts} attach="material" />
                  </mesh>
                  {/* Hex Locknut */}
                  <mesh position={[0, 0, -0.014]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.012, 0.012, 0.012, 6]} />
                    <primitive object={materials.chromeBolts} attach="material" />
                  </mesh>
                </group>
              );
            })}

            {/* Optional Propeller Blades & Aerodynamic Spinner */}
            {showPropeller && (
              <group position={[0, 0, -0.08]}>
                {/* Central Carbon / Aluminum Spinner Cone */}
                <mesh position={[0, 0, -0.08]} rotation={[-Math.PI / 2, 0, 0]}>
                  <coneGeometry args={[0.075, 0.16, 24]} />
                  <primitive object={materials.propFlange} attach="material" />
                </mesh>

                {/* Blade 1 (Upper Blade) */}
                <group position={[0, 0.06, -0.03]}>
                  {/* Blade Root Shank */}
                  <mesh position={[0, 0.12, 0]}>
                    <cylinderGeometry args={[0.022, 0.025, 0.12, 16]} />
                    <primitive object={materials.propFlange} attach="material" />
                  </mesh>
                  {/* Carbon Airfoil Blade Body */}
                  <mesh position={[0, 0.42, 0]} rotation={[0, 0.14, 0]}>
                    <boxGeometry args={[0.095, 0.52, 0.016]} />
                    <primitive object={materials.carbonBlade} attach="material" />
                  </mesh>
                  {/* High-Visibility Amber Safety Tip */}
                  <mesh position={[0, 0.72, 0]} rotation={[0, 0.14, 0]}>
                    <boxGeometry args={[0.09, 0.12, 0.017]} />
                    <primitive object={materials.propTipYellow} attach="material" />
                  </mesh>
                </group>

                {/* Blade 2 (Opposed Lower Blade - 180 deg) */}
                <group position={[0, -0.06, -0.03]} rotation={[0, 0, Math.PI]}>
                  <mesh position={[0, 0.12, 0]}>
                    <cylinderGeometry args={[0.022, 0.025, 0.12, 16]} />
                    <primitive object={materials.propFlange} attach="material" />
                  </mesh>
                  <mesh position={[0, 0.42, 0]} rotation={[0, 0.14, 0]}>
                    <boxGeometry args={[0.095, 0.52, 0.016]} />
                    <primitive object={materials.carbonBlade} attach="material" />
                  </mesh>
                  <mesh position={[0, 0.72, 0]} rotation={[0, 0.14, 0]}>
                    <boxGeometry args={[0.09, 0.12, 0.017]} />
                    <primitive object={materials.propTipYellow} attach="material" />
                  </mesh>
                </group>

                {/* Dynamic Propeller Motion Blur Disc */}
                <mesh ref={blurDiscRef} position={[0, 0, -0.01]}>
                  <ringGeometry args={[0.075, 0.78, 48]} />
                  <primitive object={materials.propBlur} attach="material" />
                </mesh>
              </group>
            )}
          </group>
        </group>

        {/* ======================================================== */}
        {/* 3. 4 HORIZONTALLY OPPOSED CYLINDERS (BOXER CONFIGURATION)*/}
        {/* ======================================================== */}
        {/* Left Bank: Cylinder 1 (Front), Cylinder 3 (Rear)         */}
        {/* Right Bank: Cylinder 2 (Front), Cylinder 4 (Rear)        */}
        {/* ======================================================== */}

        {/* CYLINDER 1 (Left Bank - Front, -X, -Z) */}
        <group position={[-0.34, 0.02, -0.14]}>
          <group rotation={[0, 0, Math.PI / 2]}>
            {renderCylinderFins(0.24, 0.14, 9)}
          </group>
          <mesh castShadow position={[-0.14, 0, 0]}>
            <boxGeometry args={[0.1, 0.22, 0.22]} />
            <primitive object={materials.crankcase} attach="material" />
          </mesh>
          <group position={[-0.22, 0.02, 0]} rotation={[0, -Math.PI / 2, 0]}>
            {renderRockerCover('cyl1', cyl1Cht, false)}
          </group>
        </group>

        {/* CYLINDER 3 (Left Bank - Rear, -X, +Z) */}
        <group position={[-0.34, 0.02, 0.16]}>
          <group rotation={[0, 0, Math.PI / 2]}>
            {renderCylinderFins(0.24, 0.14, 9)}
          </group>
          <mesh castShadow position={[-0.14, 0, 0]}>
            <boxGeometry args={[0.1, 0.22, 0.22]} />
            <primitive object={materials.crankcase} attach="material" />
          </mesh>
          <group position={[-0.22, 0.02, 0]} rotation={[0, -Math.PI / 2, 0]}>
            {renderRockerCover('cyl3', cyl3Cht, isCylMisfire)}
          </group>
        </group>

        {/* CYLINDER 2 (Right Bank - Front, +X, -Z, Slight Rod Stagger Offset) */}
        <group position={[0.34, 0.02, -0.10]}>
          <group rotation={[0, 0, -Math.PI / 2]}>
            {renderCylinderFins(0.24, 0.14, 9)}
          </group>
          <mesh castShadow position={[0.14, 0, 0]}>
            <boxGeometry args={[0.1, 0.22, 0.22]} />
            <primitive object={materials.crankcase} attach="material" />
          </mesh>
          <group position={[0.22, 0.02, 0]} rotation={[0, Math.PI / 2, 0]}>
            {renderRockerCover('cyl2', cyl2Cht, false)}
          </group>
        </group>

        {/* CYLINDER 4 (Right Bank - Rear, +X, +Z) */}
        <group position={[0.34, 0.02, 0.20]}>
          <group rotation={[0, 0, -Math.PI / 2]}>
            {renderCylinderFins(0.24, 0.14, 9)}
          </group>
          <mesh castShadow position={[0.14, 0, 0]}>
            <boxGeometry args={[0.1, 0.22, 0.22]} />
            <primitive object={materials.crankcase} attach="material" />
          </mesh>
          <group position={[0.22, 0.02, 0]} rotation={[0, Math.PI / 2, 0]}>
            {renderRockerCover('cyl4', cyl4Cht, false)}
          </group>
        </group>

        {/* ======================================================== */}
        {/* 4. TURBOCHARGER & WASTEGATE SYSTEM (Lower Front-Left)    */}
        {/* ======================================================== */}
        <group
          position={[-0.26, -0.32, -0.22]}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredPart('turbocharger');
          }}
          onPointerOut={() => setHoveredPart(null)}
          onClick={(e) => {
            e.stopPropagation();
            onSelectComponent?.(selectedComponent === 'turbocharger' ? null : 'turbocharger');
          }}
        >
          {/* Turbo Compressor Housing (Aluminum Scroll Snail) */}
          <mesh castShadow position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 0.09, 20]} />
            <primitive object={materials.turboScroll} attach="material" />
          </mesh>

          {/* Turbo Compressor Mouth / Air Inlet Spigot */}
          <mesh position={[0, 0, -0.06]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.055, 0.06, 0.05, 20]} />
            <primitive object={materials.turboScroll} attach="material" />
          </mesh>

          {/* Yellow Inlet Protective Cover / Plug Cap (matches reference photo 1 & 2!) */}
          <mesh position={[0, 0, -0.088]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.058, 0.058, 0.025, 20]} />
            <meshStandardMaterial color="#eab308" roughness={0.4} />
          </mesh>

          {/* Internal High-Speed Rotating Compressor Impeller */}
          <group ref={turboImpellerRef} position={[0, 0, -0.04]}>
            {Array.from({ length: 6 }).map((_, i) => {
              const bladeAngle = (i * Math.PI * 2) / 6;
              return (
                <mesh
                  key={i}
                  position={[Math.cos(bladeAngle) * 0.025, Math.sin(bladeAngle) * 0.025, 0]}
                  rotation={[0, 0, bladeAngle + 0.4]}
                >
                  <boxGeometry args={[0.025, 0.006, 0.015]} />
                  <primitive object={materials.chromeBolts} attach="material" />
                </mesh>
              );
            })}
          </group>

          {/* Exhaust Turbine Housing (Heat-treated cast alloy) */}
          <mesh castShadow position={[0, 0, 0.11]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.085, 0.085, 0.1, 20]} />
            <primitive object={materials.turboTurbine} attach="material" />
          </mesh>

          {/* Wastegate Actuator Canister & Linkage Arm */}
          <group position={[0.12, 0.06, 0.08]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.035, 0.035, 0.08, 16]} />
              <primitive object={materials.crankcaseDark} attach="material" />
            </mesh>
            {/* Actuator Pushrod */}
            <mesh position={[-0.05, -0.04, 0]} rotation={[0, 0, -0.5]}>
              <cylinderGeometry args={[0.005, 0.005, 0.09, 8]} />
              <primitive object={materials.chromeBolts} attach="material" />
            </mesh>
            {/* Pivoting Wastegate Bellcrank Arm */}
            <group ref={wastegateArmRef} position={[-0.08, -0.08, 0]}>
              <mesh position={[0, -0.03, 0]}>
                <boxGeometry args={[0.012, 0.06, 0.02]} />
                <primitive object={materials.brass} attach="material" />
              </mesh>
            </group>
          </group>

          {/* Thick Curving Boost Duct rising from Turbo Outlet to Top Air Intake Cross-Pipe */}
          <group position={[0.07, 0.16, -0.02]}>
            {/* Vertical Segment of Duct */}
            <mesh castShadow position={[-0.08, 0.22, 0.04]}>
              <cylinderGeometry args={[0.045, 0.045, 0.48, 18]} />
              <primitive object={materials.blackHose} attach="material" />
            </mesh>
            {/* Lower Worm-Gear Hose Clamp */}
            <mesh position={[-0.08, 0.04, 0.04]}>
              <cylinderGeometry args={[0.048, 0.048, 0.02, 18]} />
              <primitive object={materials.hoseClamp} attach="material" />
            </mesh>
            {/* Upper Worm-Gear Hose Clamp */}
            <mesh position={[-0.08, 0.42, 0.04]}>
              <cylinderGeometry args={[0.048, 0.048, 0.02, 18]} />
              <primitive object={materials.hoseClamp} attach="material" />
            </mesh>
            {/* Top 90-degree Elbow into Airbox */}
            <mesh position={[-0.04, 0.48, 0.08]} rotation={[0.4, 0, -0.6]}>
              <cylinderGeometry args={[0.045, 0.045, 0.14, 18]} />
              <primitive object={materials.crankcase} attach="material" />
            </mesh>
          </group>

          {/* Wastegate stuck or boost fault alert ring */}
          {isWastegateStuck && (
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.18, 14, 14]} />
              <meshBasicMaterial color="#f59e0b" wireframe />
            </mesh>
          )}

          {/* Selection indicator */}
          {(selectedComponent === 'turbocharger' || hoveredPart === 'turbocharger') && (
            <mesh position={[0, 0, 0.05]}>
              <boxGeometry args={[0.28, 0.28, 0.35]} />
              <meshBasicMaterial color="#00c0e8" wireframe />
            </mesh>
          )}
        </group>

        {/* ======================================================== */}
        {/* 5. INDUCTION & CARBURETORS (Top Bing 64 CD Carburetors)   */}
        {/* ======================================================== */}
        <group position={[0, 0.28, 0]}>
          {/* Top Aluminum Intake Cross-Tube & Airbox Plenum */}
          <mesh castShadow position={[0, 0.12, 0.18]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.065, 0.065, 0.52, 20]} />
            <primitive object={materials.airbox} attach="material" />
          </mesh>

          {/* Left Bing 64 Carburetor (Feeds Cyl 1 & 3) */}
          <group position={[-0.18, 0.02, 0.02]}>
            {/* Vacuum Chamber Dome */}
            <mesh position={[0, 0.06, 0]}>
              <cylinderGeometry args={[0.05, 0.058, 0.06, 18]} />
              <primitive object={materials.carbBody} attach="material" />
            </mesh>
            {/* Carburetor Venturi Throttle Body */}
            <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.042, 0.042, 0.08, 16]} />
              <primitive object={materials.carbBody} attach="material" />
            </mesh>
            {/* Float Bowl Chamber */}
            <mesh position={[0, -0.055, 0]}>
              <boxGeometry args={[0.08, 0.05, 0.08]} />
              <primitive object={materials.carbBody} attach="material" />
            </mesh>
            {/* Throttle Cable Return Spring & Arm */}
            <mesh position={[-0.05, 0.01, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.04, 10]} />
              <primitive object={materials.brass} attach="material" />
            </mesh>
            {/* Curved Intake Runner Pipe into Cyl 1 & 3 */}
            <mesh position={[-0.08, -0.06, -0.08]} rotation={[0.4, 0, -0.8]}>
              <cylinderGeometry args={[0.028, 0.028, 0.18, 14]} />
              <primitive object={materials.crankcase} attach="material" />
            </mesh>
          </group>

          {/* Right Bing 64 Carburetor (Feeds Cyl 2 & 4) */}
          <group position={[0.18, 0.02, 0.02]}>
            <mesh position={[0, 0.06, 0]}>
              <cylinderGeometry args={[0.05, 0.058, 0.06, 18]} />
              <primitive object={materials.carbBody} attach="material" />
            </mesh>
            <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.042, 0.042, 0.08, 16]} />
              <primitive object={materials.carbBody} attach="material" />
            </mesh>
            <mesh position={[0, -0.055, 0]}>
              <boxGeometry args={[0.08, 0.05, 0.08]} />
              <primitive object={materials.carbBody} attach="material" />
            </mesh>
            <mesh position={[0.05, 0.01, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.04, 10]} />
              <primitive object={materials.brass} attach="material" />
            </mesh>
            <mesh position={[0.08, -0.06, -0.08]} rotation={[0.4, 0, 0.8]}>
              <cylinderGeometry args={[0.028, 0.028, 0.18, 14]} />
              <primitive object={materials.crankcase} attach="material" />
            </mesh>
          </group>

          {/* Fuel Rail & Fuel Pressure Regulator (Section 14.4.3 per manual) */}
          <group position={[0, 0.06, 0.08]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.014, 0.014, 0.32, 12]} />
              <primitive object={materials.brass} attach="material" />
            </mesh>
            {/* Fuel Pressure Sensor Boss */}
            <mesh position={[0, 0.03, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.03, 10]} />
              <primitive object={materials.chromeBolts} attach="material" />
            </mesh>
            {/* Fuel Leak Warning Flasher */}
            {isFuelLeak && (
              <mesh position={[0, 0.06, 0]}>
                <sphereGeometry args={[0.05, 12, 12]} />
                <meshBasicMaterial color="#ef4444" wireframe />
              </mesh>
            )}
          </group>
        </group>

        {/* ======================================================== */}
        {/* 6. EXHAUST SYSTEM & MUFFLER (Underside Headers)          */}
        {/* ======================================================== */}
        <group
          position={[0, -0.26, 0]}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredPart('exhaust');
          }}
          onPointerOut={() => setHoveredPart(null)}
          onClick={(e) => {
            e.stopPropagation();
            onSelectComponent?.(selectedComponent === 'exhaust' ? null : 'exhaust');
          }}
        >
          {/* Header 1 (from Cyl 1) */}
          <mesh position={[-0.30, 0.06, -0.14]} rotation={[0.6, 0, 0.5]}>
            <cylinderGeometry args={[0.022, 0.022, 0.22, 14]} />
            <primitive object={isOverheating ? materials.exhaustGlowing : materials.exhaustStainless} attach="material" />
          </mesh>

          {/* Header 3 (from Cyl 3) */}
          <mesh position={[-0.30, 0.06, 0.12]} rotation={[-0.5, 0, 0.5]}>
            <cylinderGeometry args={[0.022, 0.022, 0.24, 14]} />
            <primitive object={isOverheating ? materials.exhaustGlowing : materials.exhaustStainless} attach="material" />
          </mesh>

          {/* Header 2 (from Cyl 2) */}
          <mesh position={[0.30, 0.06, -0.10]} rotation={[0.6, 0, -0.5]}>
            <cylinderGeometry args={[0.022, 0.022, 0.22, 14]} />
            <primitive object={isOverheating ? materials.exhaustGlowing : materials.exhaustStainless} attach="material" />
          </mesh>

          {/* Header 4 (from Cyl 4) */}
          <mesh position={[0.30, 0.06, 0.16]} rotation={[-0.5, 0, -0.5]}>
            <cylinderGeometry args={[0.022, 0.022, 0.24, 14]} />
            <primitive object={isOverheating ? materials.exhaustGlowing : materials.exhaustStainless} attach="material" />
          </mesh>

          {/* Exhaust Cross-Collector Under Engine Block */}
          <mesh position={[0, -0.06, -0.05]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.026, 0.026, 0.54, 16]} />
            <primitive object={isOverheating ? materials.exhaustGlowing : materials.exhaustStainless} attach="material" />
          </mesh>

          {/* Stainless Steel Muffler (Manual p. 39: Length 271mm, Dia ~100mm) */}
          <mesh castShadow position={[0.08, -0.12, 0.14]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.065, 0.065, 0.36, 24]} />
            <primitive object={materials.muffler} attach="material" />
          </mesh>

          {/* Tailpipe Outlet (P1 - Dia 43mm per manual p. 39) */}
          <mesh position={[0.29, -0.12, 0.14]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.028, 0.028, 0.06, 16]} />
            <primitive object={materials.exhaustStainless} attach="material" />
          </mesh>
        </group>

        {/* ======================================================== */}
        {/* 7. LUBRICATION SYSTEM (Black Spin-On Filter & Oil Pump)  */}
        {/* ======================================================== */}
        <group
          position={[0.22, -0.18, -0.22]}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredPart('oilFilter');
          }}
          onPointerOut={() => setHoveredPart(null)}
          onClick={(e) => {
            e.stopPropagation();
            onSelectComponent?.(selectedComponent === 'oilFilter' ? null : 'oilFilter');
          }}
        >
          {/* Black Cylindrical Spin-On Oil Filter Canister */}
          <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.052, 0.052, 0.14, 20]} />
            <primitive object={isOilLoss ? materials.oilFilterFault : materials.oilFilter} attach="material" />
          </mesh>
          {/* Filter Flange Rim & Hex Grip Ring */}
          <mesh position={[0, 0, 0.075]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.054, 0.054, 0.015, 20]} />
            <primitive object={materials.chromeBolts} attach="material" />
          </mesh>
          {/* Silkscreen Rotax Oil Filter White Band */}
          <mesh position={[0, 0, -0.01]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.053, 0.053, 0.035, 20]} />
            <primitive object={materials.rotaxLogoWhite} attach="material" />
          </mesh>

          {/* Oil Pressure Sender Boss ("TO" Marking per manual p. 134) */}
          <mesh position={[0.07, 0.06, 0.04]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.016, 0.016, 0.04, 10]} />
            <primitive object={materials.brass} attach="material" />
          </mesh>

          {/* Oil Pressure Warning Flash Halo */}
          {isOilLoss && (
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.12, 14, 14]} />
              <meshBasicMaterial color="#ef4444" wireframe />
            </mesh>
          )}

          {/* Selection indicator */}
          {(selectedComponent === 'oilFilter' || hoveredPart === 'oilFilter') && (
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.16, 0.16, 0.22]} />
              <meshBasicMaterial color="#00c0e8" wireframe />
            </mesh>
          )}
        </group>

        {/* ======================================================== */}
        {/* 8. COOLING SYSTEM (Expansion Tank & Water Pump Housing)   */}
        {/* ======================================================== */}
        <group
          position={[0, 0.38, -0.06]}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredPart('cooling');
          }}
          onPointerOut={() => setHoveredPart(null)}
          onClick={(e) => {
            e.stopPropagation();
            onSelectComponent?.(selectedComponent === 'cooling' ? null : 'cooling');
          }}
        >
          {/* Aluminum Coolant Expansion Tank (Manual p. 43 Fig. 14) */}
          <mesh castShadow>
            <cylinderGeometry args={[0.065, 0.065, 0.12, 20]} />
            <primitive object={materials.coolantTank} attach="material" />
          </mesh>
          {/* Pressure Relief Radiator Cap */}
          <mesh position={[0, 0.07, 0]}>
            <cylinderGeometry args={[0.042, 0.042, 0.02, 16]} />
            <primitive object={materials.radiatorCap} attach="material" />
          </mesh>
          {/* Overflow Nipple Tube (to Overflow Bottle per manual p. 55) */}
          <mesh position={[0.05, 0.06, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.006, 0.006, 0.03, 8]} />
            <primitive object={materials.brass} attach="material" />
          </mesh>

          {/* Coolant Feed Hoses branching to cylinder heads */}
          <mesh position={[-0.14, -0.06, -0.04]} rotation={[0.4, 0, -0.7]}>
            <cylinderGeometry args={[0.015, 0.015, 0.22, 12]} />
            <primitive object={materials.blackHose} attach="material" />
          </mesh>
          <mesh position={[0.14, -0.06, -0.04]} rotation={[0.4, 0, 0.7]}>
            <cylinderGeometry args={[0.015, 0.015, 0.22, 12]} />
            <primitive object={materials.blackHose} attach="material" />
          </mesh>

          {/* Overheating Warning Glow */}
          {isOverheating && (
            <mesh position={[0, 0.04, 0]}>
              <sphereGeometry args={[0.12, 12, 12]} />
              <meshBasicMaterial color="#ef4444" wireframe />
            </mesh>
          )}
        </group>

        {/* ======================================================== */}
        {/* 9. DUAL IGNITION MODULES & STARTER MOTOR                 */}
        {/* ======================================================== */}
        <group position={[0, 0.18, 0.38]}>
          {/* Ducati CDI Dual Electronic Ignition Modules (2 Black Boxes) */}
          <mesh position={[-0.09, 0, 0]}>
            <boxGeometry args={[0.11, 0.07, 0.05]} />
            <primitive object={materials.crankcaseDark} attach="material" />
          </mesh>
          <mesh position={[0.09, 0, 0]}>
            <boxGeometry args={[0.11, 0.07, 0.05]} />
            <primitive object={materials.crankcaseDark} attach="material" />
          </mesh>

          {/* Electric Starter Motor (Cylindrical Motor per manual p. 116) */}
          <group position={[0.14, -0.16, 0.02]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.048, 0.048, 0.18, 18]} />
              <primitive object={materials.crankcaseDark} attach="material" />
            </mesh>
            <mesh position={[0, 0, 0.10]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.024, 0.024, 0.04, 12]} />
              <primitive object={materials.chromeBolts} attach="material" />
            </mesh>
          </group>
        </group>

        {/* ======================================================== */}
        {/* 10. ENGINE MOUNTING RING CRADLE (Test Stand Tubular Frame)*/}
        {/* ======================================================== */}
        <group position={[0, -0.14, 0.12]}>
          {/* Main Tubular Torus Engine Ring Mount */}
          <mesh rotation={[0, 0, 0]}>
            <torusGeometry args={[0.42, 0.024, 16, 48]} />
            <primitive object={materials.standTubing} attach="material" />
          </mesh>
          {/* Four Lord Rubber Vibration Isolator Mounts (Manual p. 38 Fig. 12) */}
          {[
            [-0.34, 0.22, 0],
            [0.34, 0.22, 0],
            [-0.34, -0.22, 0],
            [0.34, -0.22, 0],
          ].map(([x, y, z], idx) => (
            <mesh key={idx} position={[x, y, z]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.035, 0.035, 0.05, 14]} />
              <primitive object={materials.blackHose} attach="material" />
            </mesh>
          ))}
          {/* Lower Test Stand Pedestal Pipe */}
          <mesh position={[0, -0.42, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.32, 20]} />
            <primitive object={materials.standTubing} attach="material" />
          </mesh>
        </group>

        {/* ======================================================== */}
        {/* 11. INTERACTIVE 3D HOTSPOT ANNOTATION PINS & GAUGES      */}
        {/* ======================================================== */}
        {showHotspots && (
          <group>
            {/* Gearbox Pin */}
            <group position={[0, 0.28, -0.48]}>
              <mesh>
                <sphereGeometry args={[0.028, 12, 12]} />
                <meshBasicMaterial color="#00c0e8" />
              </mesh>
              <mesh position={[0, -0.04, 0]}>
                <cylinderGeometry args={[0.003, 0.003, 0.06, 6]} />
                <meshBasicMaterial color="#00c0e8" />
              </mesh>
            </group>

            {/* Cylinder 2 CHT Pin (Hottest Cylinder per manual p. 46 & 133) */}
            <group position={[0.54, 0.16, -0.10]}>
              <mesh>
                <sphereGeometry args={[0.028, 12, 12]} />
                <meshBasicMaterial color={isOverheating ? '#ef4444' : '#10b981'} />
              </mesh>
              <mesh position={[-0.04, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.003, 0.003, 0.08, 6]} />
                <meshBasicMaterial color={isOverheating ? '#ef4444' : '#10b981'} />
              </mesh>
            </group>

            {/* Turbocharger Boost Pin */}
            <group position={[-0.46, -0.28, -0.22]}>
              <mesh>
                <sphereGeometry args={[0.028, 12, 12]} />
                <meshBasicMaterial color={isWastegateStuck ? '#f59e0b' : '#38bdf8'} />
              </mesh>
              <mesh position={[0.04, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.003, 0.003, 0.08, 6]} />
                <meshBasicMaterial color={isWastegateStuck ? '#f59e0b' : '#38bdf8'} />
              </mesh>
            </group>

            {/* Oil Pressure Pin */}
            <group position={[0.42, -0.22, -0.22]}>
              <mesh>
                <sphereGeometry args={[0.028, 12, 12]} />
                <meshBasicMaterial color={isOilLoss ? '#ef4444' : '#10b981'} />
              </mesh>
            </group>
          </group>
        )}
      </group>
    </group>
  );
};
