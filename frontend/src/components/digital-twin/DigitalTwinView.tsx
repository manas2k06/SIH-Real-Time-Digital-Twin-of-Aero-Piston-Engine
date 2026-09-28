import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { RotaxEngineModel3D } from './RotaxEngineModel3D';
import { CoordinateGizmo } from './CoordinateGizmo';
import { useTelemetry } from '../../context/TelemetryContext';
import {
  Camera,
  Box,
  RotateCcw,
  Maximize2,
  Minimize2,
  Thermometer,
  Disc,
  MapPin,
  X,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

export type CameraPreset = 'ISO' | 'FRONT' | 'CYLINDERS' | 'TURBO' | 'TOP';

interface ComponentSpecData {
  title: string;
  category: string;
  description: string;
  specs: { label: string; value: string }[];
  manualRef: string;
}

const COMPONENT_SPECS: Record<string, ComponentSpecData> = {
  gearbox: {
    title: 'Propeller Reduction Gearbox',
    category: 'POWER TRANSMISSION (Section 20)',
    description: 'Integrated mechanical reduction drive with torsional vibration shock absorber and overload slipper clutch. Drives fixed-pitch or constant-speed propellers.',
    specs: [
      { label: 'Gear Reduction Ratio', value: '2.4286 : 1 (51T / 21T)' },
      { label: 'Direction of Rotation', value: 'Counter-Clockwise (looking at flange)' },
      { label: 'Max Propeller Torque', value: '340 Nm (250 ft·lb)' },
      { label: 'Propeller Flange P.C.D.', value: '75 mm / 80 mm / 101.6 mm (6-bolt)' },
      { label: 'Hub Spigot Diameter', value: '47 mm (1.85 in)' },
      { label: 'Max Moment of Inertia', value: '6,000 kg·cm²' },
    ],
    manualRef: 'Installation Manual Page 127, Section 20.1',
  },
  cyl1: {
    title: 'Cylinder 1 Assembly (Left Front)',
    category: 'COMBUSTION CHAMBER (Section 7)',
    description: 'Horizontally opposed boxer cylinder with ram-air cooled ribbed barrel, liquid-cooled aluminum cylinder head, and signature red ROTAX rocker cover.',
    specs: [
      { label: 'Bore x Stroke', value: '79.5 mm x 61.0 mm' },
      { label: 'Displacement', value: '1,211 cm³ (Total)' },
      { label: 'Max CHT Limit', value: '135 °C (275 °F)' },
      { label: 'Normal Operating CHT', value: '90 °C - 115 °C' },
      { label: 'Ignition per Head', value: 'Dual Spark Plugs (Circuit A + B)' },
    ],
    manualRef: 'Installation Manual Page 21 & 44',
  },
  cyl2: {
    title: 'Cylinder 2 Assembly (Right Front - Primary Sensor)',
    category: 'COMBUSTION CHAMBER (Section 23.1)',
    description: 'Critical flight monitoring cylinder fitted with direct cylinder head temperature (CHT) thermocouple probe. Experiences maximum thermal gradients.',
    specs: [
      { label: 'Sensor Thread', value: 'M10 x 1.5 in Head Material' },
      { label: 'Max Permissible CHT', value: '135 °C (275 °F) Continuous' },
      { label: 'Max Cylinder Wall Temp', value: '200 °C (392 °F)' },
      { label: 'Sensor Location', value: 'Cylinder Head 2 (x: -200, y: 241, z: -157 mm)' },
    ],
    manualRef: 'Installation Manual Page 46, 59 & 133',
  },
  cyl3: {
    title: 'Cylinder 3 Assembly (Left Rear)',
    category: 'COMBUSTION CHAMBER (Section 19.4.4)',
    description: 'Left-bank rear cylinder driven by central camshaft with pushrods and hydraulic valve tappets. Instrumented for secondary CHT telemetry.',
    specs: [
      { label: 'Valve Actuation', value: 'Single central camshaft · Hydraulic tappets · OHV' },
      { label: 'Max Allowable Valve Lash', value: '0.5 mm (0.02 in) unprimed' },
      { label: 'Secondary CHT Sensor', value: 'Cylinder Head 3 (x: -387, y: -241, z: -157 mm)' },
    ],
    manualRef: 'Installation Manual Page 78 & 133',
  },
  cyl4: {
    title: 'Cylinder 4 Assembly (Right Rear)',
    category: 'COMBUSTION CHAMBER (Section 7)',
    description: 'Right-bank rear cylinder. Completes the 4-cylinder horizontally opposed firing order (1-4-3-2) delivering balanced boxer primary harmonics.',
    specs: [
      { label: 'Compression Ratio', value: '9.0 : 1' },
      { label: 'Cooling Media', value: '50% Ethylene Glycol / 50% Water' },
      { label: 'Spark Plug Gap', value: '0.6 - 0.7 mm' },
    ],
    manualRef: 'Installation Manual Page 21 & 45',
  },
  turbocharger: {
    title: 'Turbocharger & TCU Wastegate',
    category: 'INDUCTION & BOOST (Section 16 & 18)',
    description: 'Exhaust-driven turbocharger regulated by electronic Turbo Control Unit (TCU) via Bowden servo cable and wastegate flapper valve.',
    specs: [
      { label: 'Max Take-off Boost Pressure', value: '1.27 bar / 39.0 inHg (5 min limit)' },
      { label: 'Max Continuous MAP', value: '1.15 bar / 35.4 inHg' },
      { label: 'Max Airbox Temperature', value: '72 °C (162 °F)' },
      { label: 'Wastegate Servo Travel', value: '65 mm (2.5 in)' },
      { label: 'Air Intake Duct Dia.', value: '60 mm (2 3/8 in)' },
      { label: 'Exhaust Turbine Temp', value: 'Max 950 °C (1,740 °F)' },
    ],
    manualRef: 'Installation Manual Page 97, 98 & 105',
  },
  exhaust: {
    title: 'Stainless Steel Exhaust & Muffler',
    category: 'EXHAUST SYSTEM (Section 11)',
    description: 'Complete 4-into-1 tuned stainless steel exhaust manifold with collector flange, turbine inlet runner, and cylindrical vibration-damped muffler.',
    specs: [
      { label: 'Material Specification', value: 'X 15CrNiSi 20 (DIN 1.4828 / AISI 309)' },
      { label: 'Muffler Dimensions', value: 'Dia: 100 mm · Length: 271 mm (10.67 in)' },
      { label: 'Tailpipe Outlet Dia.', value: '43 mm (1.69 in) at Point P1' },
      { label: 'Max Exhaust Gas Temp (EGT)', value: '950 °C (1,740 °F)' },
      { label: 'Normal EGT', value: '900 °C (1,650 °F)' },
      { label: 'Max Backpressure', value: '0.15 bar (2.17 psi)' },
    ],
    manualRef: 'Installation Manual Page 39 - 41',
  },
  oilFilter: {
    title: 'Dry Sump Lubrication & Oil Filter',
    category: 'LUBRICATION SYSTEM (Section 13)',
    description: 'Forced dry sump lubrication system with camshaft-driven main pressure pump, crankcase scavenge pump, and spin-on microfilter canister.',
    specs: [
      { label: 'Operating Oil Pressure', value: '2.0 - 5.0 bar (Nominal)' },
      { label: 'Min Oil Pressure', value: '1.5 bar (below 3,500 RPM: 0.8 bar)' },
      { label: 'Max Oil Pressure', value: '7.0 bar (cold start limit)' },
      { label: 'Oil Temperature Range', value: '50 °C - 130 °C (266 °F max)' },
      { label: 'Oil Capacity (Dry Engine)', value: 'Min 3.0 L (0.8 US gal)' },
      { label: 'Oil Tank Capacity', value: '2.5 L (Min) to 3.0 L (Max)' },
    ],
    manualRef: 'Installation Manual Page 63 - 75',
  },
  cooling: {
    title: 'Coolant Expansion Tank & Circuit',
    category: 'COOLING SYSTEM (Section 12)',
    description: 'High-point closed cooling circuit with pressure cap, expansion chamber, and siphon return hose to overflow recovery bottle.',
    specs: [
      { label: 'Total Coolant Capacity', value: 'Approx. 1.5 L (0.4 US gal)' },
      { label: 'Radiator Cap Relief Pressure', value: '1.2 bar (17.5 psi)' },
      { label: 'Max Coolant Exit Temp', value: '120 °C (248 °F)' },
      { label: 'Water Pump Flow Rate', value: 'Approx. 60 L/min at 5,800 RPM' },
      { label: 'Radiator Heat Dissipation', value: 'Approx. 30 kW (28 BTU/s) at Takeoff' },
    ],
    manualRef: 'Installation Manual Page 43 - 59',
  },
};

export const DigitalTwinView: React.FC<{ isExpanded?: boolean; onToggleExpand?: () => void }> = ({
  isExpanded,
  onToggleExpand,
}) => {
  const { telemetry, syncStatus } = useTelemetry();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  // Viewport Settings
  const [currentPreset, setCurrentPreset] = useState<CameraPreset>('ISO');
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showHud, setShowHud] = useState<boolean>(true);
  const [showPropeller, setShowPropeller] = useState<boolean>(true);
  const [showHotspots, setShowHotspots] = useState<boolean>(true);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'3D' | 'PHOTO'>('3D');
  const [selectedComponentKey, setSelectedComponentKey] = useState<string | null>(null);

  const setCameraView = (preset: CameraPreset) => {
    if (!controlsRef.current) return;
    setCurrentPreset(preset);

    const controls = controlsRef.current;
    const camera = controls.object as THREE.PerspectiveCamera;

    if (preset === 'ISO') {
      camera.position.set(-1.8, 1.3, -1.9);
      controls.target.set(0, 0.35, 0);
    } else if (preset === 'FRONT') {
      camera.position.set(0, 0.45, -2.4);
      controls.target.set(0, 0.4, -0.2);
    } else if (preset === 'CYLINDERS') {
      camera.position.set(-2.2, 0.4, 0);
      controls.target.set(0, 0.35, 0);
    } else if (preset === 'TURBO') {
      camera.position.set(-1.3, -0.1, -1.2);
      controls.target.set(-0.25, 0.05, -0.2);
    } else if (preset === 'TOP') {
      camera.position.set(0, 2.8, -0.01);
      controls.target.set(0, 0.35, 0);
    }
    controls.update();
  };

  const handleResetCamera = () => {
    setCameraView('ISO');
  };

  // Telemetry Parameter Extractions
  const engine = telemetry?.engine;
  const rpm = engine?.operating?.rpm ?? 0;
  const throttlePct = engine?.operating?.throttlePosition ?? 0;
  const powerKw = engine?.operating?.powerKw ?? 0;
  const powerHp = engine?.operating?.powerHp ?? 0;
  const torque = engine?.operating?.torque ?? 0;
  const fuelFlow = engine?.operating?.fuelFlowRate ?? 0;
  const mapInHg = engine?.operating?.map ?? 29.92;
  const boostBar = engine?.intake?.pressureDifferential ?? 0;
  const wastegatePct = engine?.intake?.wastegatePosition ?? 0;

  // Propeller speed via 2.4286 reduction gearbox
  const propRpm = Math.round(rpm / 2.42857);

  // Combustion & CHT Matrix
  const [c1, c2, c3, c4] = engine?.combustion?.cht?.cylinders ?? [102, 108, 104, 101];
  const maxCht = Math.max(c1, c2, c3, c4);
  const avgEgt = engine?.combustion?.egt?.average ?? 875;

  // Fluids & Pressures
  const oilPressure = engine?.lubrication?.oilPressure ?? 3.8;
  const oilTemp = engine?.lubrication?.oilTemperature ?? 88;
  const coolantTemp = engine?.cooling?.coolantTemperature ?? 92;
  const fuelPressure = engine?.operating?.fuelPressure ?? 3.2;
  const vibRms = engine?.vibration?.rmsVibration ?? 1.8;

  // Subsystem Fault Checks
  const isOverheating = engine?.cooling?.status === 'OVERHEAT' || maxCht > 130;
  const isOilLoss = engine?.lubrication?.status === 'LOW_PRESSURE' || oilPressure < 1.8;
  const isWastegateStuck = (engine?.intake?.wastegatePosition ?? 0) > 85 && boostBar < 0.05;
  const isCylMisfire = engine?.combustion?.combustionStatus === 'LEAN_MISFIRE' || (c3 < 75);
  const isVibAnomaly = vibRms > 4.5;
  const isFuelLeak = engine?.fuel?.status === 'LEAK_DETECTED';

  const hasAnyFault = isOverheating || isOilLoss || isWastegateStuck || isCylMisfire || isVibAnomaly || isFuelLeak;

  const selectedSpec = selectedComponentKey ? COMPONENT_SPECS[selectedComponentKey] : null;

  return (
    <div className={`relative bg-white/90 border border-slate-200 rounded-3xl overflow-hidden flex flex-col shadow-xs transition-all ${isExpanded ? 'h-[760px]' : 'h-[420px] lg:h-[460px]'}`}>
      {/* Top Operations MFD Control Bar */}
      <div className="flex flex-wrap items-center justify-between px-3.5 py-2 bg-[#efeae2] border-b border-[#ddd5c7] text-[10px] text-[#6e6457] z-20 select-none gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#d8533c] animate-pulse" />
            <span className="font-mono font-bold text-[#1c1917] tracking-wider text-[11px]">
              ROTAX 914F · 4-CYL TURBO DIGITAL TWIN
            </span>
          </div>
          <span className="text-[#b5aa9c]">|</span>
          <span className="text-[#0284c7] font-mono font-semibold">
            {syncStatus?.updateRateHz || 20} Hz Telemetry Sync
          </span>
          {hasAnyFault && (
            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-mono font-bold border border-red-300 animate-pulse text-[9px] flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              FAULT DETECTED
            </span>
          )}
        </div>

        {/* Viewport Control Softkeys */}
        <div className="flex items-center space-x-1.5">
          {/* Mode Switcher: 3D Model vs Specimen Photo */}
          <div className="flex items-center bg-[#e4ddcf] p-0.5 rounded-full border border-[#d5ccbe]">
            <button
              onClick={() => setViewMode('3D')}
              className={`flex items-center gap-1 px-2.5 py-0.5 text-[9px] font-mono font-bold rounded-full transition-all ${
                viewMode === '3D'
                  ? 'bg-white text-[#d8533c] shadow-xs'
                  : 'text-[#6e6457] hover:text-[#1c1917]'
              }`}
            >
              <Box className="w-3 h-3" />
              3D ENGINE
            </button>
            <button
              onClick={() => setViewMode('PHOTO')}
              className={`flex items-center gap-1 px-2.5 py-0.5 text-[9px] font-mono font-bold rounded-full transition-all ${
                viewMode === 'PHOTO'
                  ? 'bg-white text-[#d8533c] shadow-xs'
                  : 'text-[#6e6457] hover:text-[#1c1917]'
              }`}
            >
              <Camera className="w-3 h-3" />
              SPECIMEN
            </button>
          </div>

          {viewMode === '3D' && (
            <>
              {/* Camera Presets */}
              <div className="hidden sm:flex items-center space-x-0.5 bg-[#e4ddcf] p-0.5 rounded-md border border-[#d5ccbe]">
                {(['ISO', 'FRONT', 'CYLINDERS', 'TURBO', 'TOP'] as const).map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setCameraView(preset)}
                    className={`px-1.5 py-0.5 text-[9px] font-mono font-semibold rounded transition-colors ${
                      currentPreset === preset
                        ? 'bg-white text-[#d8533c] shadow-xs'
                        : 'text-[#6e6457] hover:text-[#1c1917]'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {/* Propeller Visibility Toggle */}
              <button
                onClick={() => setShowPropeller(!showPropeller)}
                className={`px-2 py-0.5 text-[9px] font-mono font-semibold rounded border transition-colors flex items-center gap-1 ${
                  showPropeller
                    ? 'bg-white text-[#d8533c] border-[#d8d0c2]'
                    : 'bg-[#efeae2] text-[#8c8074] border-[#ddd5c7]'
                }`}
                title="Toggle Propeller vs Bare Flange"
              >
                <Disc className="w-3 h-3" />
                PROP
              </button>

              {/* Thermal Heatmap Toggle */}
              <button
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={`px-2 py-0.5 text-[9px] font-mono font-semibold rounded border transition-colors flex items-center gap-1 ${
                  showHeatmap
                    ? 'bg-red-50 text-red-600 border-red-300 font-bold'
                    : 'bg-[#efeae2] text-[#8c8074] border-[#ddd5c7]'
                }`}
                title="Toggle CHT Thermal Heatmap"
              >
                <Thermometer className="w-3 h-3" />
                HEAT
              </button>

              {/* Subsystem 3D Pins Toggle */}
              <button
                onClick={() => setShowHotspots(!showHotspots)}
                className={`px-2 py-0.5 text-[9px] font-mono font-semibold rounded border transition-colors flex items-center gap-1 ${
                  showHotspots
                    ? 'bg-white text-[#d8533c] border-[#d8d0c2]'
                    : 'bg-[#efeae2] text-[#8c8074] border-[#ddd5c7]'
                }`}
                title="Toggle 3D Subsystem Callout Pins"
              >
                <MapPin className="w-3 h-3" />
                PINS
              </button>

              {/* Grid Toggle */}
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`px-2 py-0.5 text-[9px] font-mono font-semibold rounded border transition-colors ${
                  showGrid
                    ? 'bg-white text-[#d8533c] border-[#d8d0c2]'
                    : 'bg-[#efeae2] text-[#8c8074] border-[#ddd5c7]'
                }`}
                title="Toggle Testbed Dyno Grid"
              >
                GRID
              </button>

              {/* HUD Toggle */}
              <button
                onClick={() => setShowHud(!showHud)}
                className={`px-2 py-0.5 text-[9px] font-mono font-semibold rounded border transition-colors ${
                  showHud
                    ? 'bg-white text-[#d8533c] border-[#d8d0c2]'
                    : 'bg-[#efeae2] text-[#8c8074] border-[#ddd5c7]'
                }`}
                title="Toggle Engine Telemetry HUD"
              >
                HUD
              </button>

              {/* Camera Reset */}
              <button
                onClick={handleResetCamera}
                className="p-1 rounded bg-[#efeae2] text-[#6e6457] hover:text-[#1c1917] hover:bg-white border border-[#ddd5c7] transition-colors"
                title="Reset Camera View"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </>
          )}

          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className="p-1 rounded bg-[#efeae2] text-[#6e6457] hover:text-[#1c1917] hover:bg-white border border-[#ddd5c7] transition-colors"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>

      {/* Main Viewport Workspace */}
      <div className="relative flex-1 w-full h-full bg-[#f2ede4] overflow-hidden">
        {viewMode === '3D' ? (
          <>
            {/* 3D WebGL Canvas */}
            <Canvas
              shadows
              gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
              className="w-full h-full cursor-grab active:cursor-grabbing"
            >
              {/* Studio Warm Engineering Backdrop */}
              <color attach="background" args={['#ece5d8']} />
              <PerspectiveCamera makeDefault position={[-1.8, 1.3, -1.9]} fov={44} />
              <OrbitControls
                ref={controlsRef}
                enableDamping
                dampingFactor={0.12}
                maxDistance={8}
                minDistance={0.6}
                target={[0, 0.35, 0]}
              />

              {/* Multi-Point Studio Lighting */}
              <ambientLight intensity={0.95} color="#ffffff" />
              <directionalLight
                position={[-4, 7, -5]}
                intensity={1.8}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
                shadow-bias={-0.0001}
              />
              <directionalLight position={[4, 5, 4]} intensity={0.9} color="#f7f2ea" />
              <directionalLight position={[0, -2, -3]} intensity={0.45} color="#dfd8cb" />
              <pointLight position={[0, 1.8, 0]} intensity={0.6} color="#ffffff" />

              {/* Rotax 914 Aero-Piston 3D Model */}
              <RotaxEngineModel3D
                telemetry={telemetry}
                showPropeller={showPropeller}
                showHotspots={showHotspots}
                showHeatmap={showHeatmap}
                selectedComponent={selectedComponentKey}
                onSelectComponent={(comp) => setSelectedComponentKey(comp)}
              />

              {/* Testbed Reference Datum Grid */}
              {showGrid && <CoordinateGizmo telemetry={telemetry} />}
            </Canvas>

            {/* Rotax Aero-Piston Engine Telemetry HUD Layer */}
            {showHud && (
              <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-3">
                {/* Top HUD: Speed, MAP, & Subsystem Status */}
                <div className="flex items-start justify-between">
                  {/* Left Top: RPM, Prop Speed, Throttle & Boost */}
                  <div className="bg-[#ffffff]/90 backdrop-blur-sm border border-[#ddd5c7] px-3 py-2 rounded-2xl font-mono text-[10px] text-[#5c544d] space-y-1 shadow-xs">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[8px] uppercase tracking-wider text-[#8c8074] font-bold">ROTAX POWERPLANT</span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full ${
                        rpm > 5500 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {rpm > 5500 ? 'TAKEOFF (5 MIN)' : rpm > 2000 ? 'CRUISE POWER' : rpm > 0 ? 'IDLE' : 'OFF'}
                      </span>
                    </div>

                    <div className="flex items-baseline space-x-3 text-[#1c1917]">
                      <div>
                        <span className="text-[9px] text-[#8c8074]">CRANK: </span>
                        <strong className="text-sm font-extrabold text-[#d8533c]">{rpm.toLocaleString()}</strong>
                        <span className="text-[9px] text-slate-500"> RPM</span>
                      </div>
                      <div className="border-l border-[#ddd5c7] pl-3">
                        <span className="text-[9px] text-[#8c8074]">PROP (1:2.43): </span>
                        <strong className="text-sm font-bold text-[#1c1917]">{propRpm.toLocaleString()}</strong>
                        <span className="text-[9px] text-slate-500"> RPM</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 text-[9px] text-[#6e6457] pt-0.5 border-t border-[#ede7dc]">
                      <span>MAP: <strong className="text-[#1c1917]">{mapInHg.toFixed(1)} inHg</strong> ({boostBar >= 0 ? `+${boostBar.toFixed(2)}` : boostBar.toFixed(2)} bar)</span>
                      <span>·</span>
                      <span>THROTTLE: <strong className="text-[#1c1917]">{throttlePct.toFixed(0)}%</strong></span>
                      <span>·</span>
                      <span>PWR: <strong className="text-[#0284c7]">{powerHp.toFixed(0)} HP</strong> ({powerKw.toFixed(1)} kW)</span>
                    </div>
                  </div>

                  {/* Right Top: Subsystem Alerts & Tri-Axial Vibration */}
                  <div className="bg-[#ffffff]/90 backdrop-blur-sm border border-[#ddd5c7] px-3 py-2 rounded-2xl font-mono text-[10px] text-[#5c544d] space-y-1 text-right shadow-xs">
                    <div className="text-[8px] uppercase tracking-wider text-[#8c8074] font-bold">
                      HEALTH & HARMONIC VIBRATION
                    </div>
                    <div className="flex items-center justify-end space-x-2">
                      <span className="text-[9px] text-[#8c8074]">STATUS:</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                        hasAnyFault ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}>
                        {hasAnyFault ? 'DEGRADED / FAULT' : 'NOMINAL (100%)'}
                      </span>
                    </div>
                    <div className="text-[9px] text-[#1c1917]">
                      VIB RMS: <strong className={vibRms > 4.5 ? 'text-red-600 font-bold' : 'font-semibold'}>{vibRms.toFixed(2)} mm/s</strong>
                      <span className="text-[8px] text-slate-500"> (Limit: 5.5)</span>
                    </div>
                  </div>
                </div>

                {/* Left Edge: 4-Cylinder CHT Combustion Matrix Tape */}
                <div className="absolute left-3 top-24 bottom-20 w-28 bg-[#ffffff]/90 backdrop-blur-sm border border-[#ddd5c7] rounded-2xl flex flex-col justify-between py-2 px-2.5 font-mono text-[9px] text-[#5c544d] shadow-xs">
                  <div className="text-[8px] text-center uppercase tracking-wider text-[#8c8074] font-bold border-b border-[#e5dfd3] pb-1">
                    CHT MATRIX (°C)
                  </div>
                  <div className="flex-1 flex flex-col justify-around py-1 space-y-1">
                    {[
                      { label: 'CYL 1', temp: c1 },
                      { label: 'CYL 2*', temp: c2, isSensor: true },
                      { label: 'CYL 3', temp: c3 },
                      { label: 'CYL 4', temp: c4 },
                    ].map((cyl, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between px-1.5 py-0.5 rounded ${
                          cyl.temp > 135
                            ? 'bg-red-100 text-red-800 font-bold animate-pulse'
                            : cyl.temp > 120
                            ? 'bg-amber-100 text-amber-800 font-semibold'
                            : 'bg-[#f4efe6] text-[#1c1917]'
                        }`}
                      >
                        <span className="text-[8px] text-[#786c5f]">{cyl.label}</span>
                        <span className="font-bold">{cyl.temp.toFixed(1)}°</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-[7.5px] text-center text-[#8c8074] border-t border-[#e5dfd3] pt-1">
                    *PRIMARY REF LIMIT: 135°C
                  </div>
                </div>

                {/* Right Edge: Fluids, Lubrication & Cooling Tape */}
                <div className="absolute right-3 top-24 bottom-20 w-32 bg-[#ffffff]/90 backdrop-blur-sm border border-[#ddd5c7] rounded-2xl flex flex-col justify-between py-2 px-2.5 font-mono text-[9px] text-[#5c544d] shadow-xs">
                  <div className="text-[8px] text-center uppercase tracking-wider text-[#8c8074] font-bold border-b border-[#e5dfd3] pb-1">
                    FLUIDS & PRESSURES
                  </div>
                  <div className="flex-1 flex flex-col justify-around py-1 space-y-1.5">
                    <div>
                      <div className="flex justify-between text-[8px] text-[#8c8074]">
                        <span>OIL PRESS</span>
                        <span>NOM: 2-5 BAR</span>
                      </div>
                      <div className={`font-bold text-xs ${oilPressure < 1.8 ? 'text-red-600 animate-pulse' : 'text-[#1c1917]'}`}>
                        {oilPressure.toFixed(2)} bar
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[8px] text-[#8c8074]">
                        <span>OIL TEMP</span>
                        <span>MAX: 130°C</span>
                      </div>
                      <div className={`font-bold text-xs ${oilTemp > 125 ? 'text-red-600' : 'text-[#1c1917]'}`}>
                        {oilTemp.toFixed(1)} °C
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[8px] text-[#8c8074]">
                        <span>COOLANT</span>
                        <span>MAX: 120°C</span>
                      </div>
                      <div className={`font-bold text-xs ${coolantTemp > 115 ? 'text-red-600' : 'text-[#1c1917]'}`}>
                        {coolantTemp.toFixed(1)} °C
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[8px] text-[#8c8074]">
                        <span>FUEL PRESS</span>
                        <span>AIRBOX + 0.25</span>
                      </div>
                      <div className="font-bold text-xs text-[#1c1917]">
                        {fuelPressure.toFixed(2)} bar
                      </div>
                    </div>
                  </div>
                  <div className="text-[7.5px] text-center text-[#8c8074] border-t border-[#e5dfd3] pt-1">
                    ROTAX CLOSED CIRCUIT
                  </div>
                </div>

                {/* Bottom Edge: Auxiliary Diagnostics Ribbon */}
                <div className="flex items-end justify-center">
                  <div className="bg-[#ffffff]/90 backdrop-blur-sm border border-[#ddd5c7] px-4 py-1.5 rounded-full font-mono text-[10px] text-[#5c544d] flex items-center space-x-3.5 shadow-xs">
                    <span className="text-[8px] uppercase tracking-wider text-[#8c8074] font-bold">TCU BOOST:</span>
                    <span className="text-white font-bold text-[10px] bg-[#1c1917] px-2 py-0.5 rounded-full">
                      WG {wastegatePct.toFixed(0)}%
                    </span>
                    <span className="text-[#1c1917]">FLOW: <strong className="font-semibold">{fuelFlow.toFixed(1)} L/h</strong></span>
                    <span>·</span>
                    <span className="text-[#1c1917]">TORQUE: <strong className="font-semibold">{torque.toFixed(0)} Nm</strong></span>
                    <span>·</span>
                    <span className="text-[#1c1917]">EGT AVG: <strong className="font-semibold">{avgEgt.toFixed(0)} °C</strong></span>
                  </div>
                </div>
              </div>
            )}

            {/* Interactive Selected Component Detail Modal */}
            {selectedSpec && (
              <div className="absolute bottom-4 left-4 max-w-sm w-full bg-white/95 backdrop-blur-md border border-[#ddd5c7] rounded-3xl p-4 shadow-xl z-30 font-mono text-xs">
                <div className="flex items-start justify-between pb-2 border-b border-[#ede7dc]">
                  <div>
                    <span className="text-[8px] font-bold text-[#d8533c] tracking-wider uppercase">
                      {selectedSpec.category}
                    </span>
                    <h3 className="font-bold text-sm text-[#1c1917] mt-0.5">
                      {selectedSpec.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedComponentKey(null)}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-[10.5px] text-[#6e6457] my-2 leading-relaxed">
                  {selectedSpec.description}
                </p>

                <div className="space-y-1 bg-[#faf8f5] p-2 rounded-xl border border-[#ede7dc]">
                  {selectedSpec.specs.map((item, i) => (
                    <div key={i} className="flex justify-between text-[10px]">
                      <span className="text-[#8c8074]">{item.label}:</span>
                      <strong className="text-[#1c1917]">{item.value}</strong>
                    </div>
                  ))}
                </div>

                <div className="mt-2 pt-2 border-t border-[#ede7dc] flex items-center justify-between text-[9px] text-[#8c8074]">
                  <span>{selectedSpec.manualRef}</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> VERIFIED MANUAL DATA
                  </span>
                </div>
              </div>
            )}
          </>
        ) : (
          /* ROTAX 914 ENGINE SPECIMEN MODE (High-Resolution Visual Reference) */
          <div className="w-full h-full flex flex-col items-center justify-center p-6 relative overflow-y-auto">
            <div className="relative max-w-2xl w-full bg-white rounded-3xl p-6 border border-[#ddd5c7] shadow-lg flex flex-col items-center">
              <div className="w-full flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-mono text-[10px] font-bold border border-red-300">
                    FACTORY SPECIMEN
                  </div>
                  <h2 className="font-display font-extrabold text-base text-[#0f172a]">
                    BRP-ROTAX 914 UL / 914 F TURBO POWERPLANT
                  </h2>
                </div>
                <span className="text-xs font-mono text-slate-500 font-bold">
                  PART NO: 897817
                </span>
              </div>

              {/* Official Rotax 914 Engine Reference Photograph */}
              <div className="relative w-full my-4 bg-slate-900/5 rounded-2xl p-4 flex items-center justify-center border border-slate-100">
                <img
                  src="/assets/rotax-specimen.jpg"
                  alt="Rotax 914 UL/F Turbo Aero Piston Engine"
                  className="w-full h-auto object-contain max-h-[300px] filter drop-shadow-md rounded-lg"
                />
              </div>

              {/* Engineering Specs Grid from Manual */}
              <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                <div className="bg-[#faf8f5] p-2.5 rounded-2xl border border-[#ede7dc]">
                  <div className="text-[9px] text-[#8c8074] font-bold">ARCHITECTURE</div>
                  <div className="font-extrabold text-[#1c1917] mt-0.5">4-Cyl Boxer</div>
                  <div className="text-[8px] text-slate-500">Liquid Heads / Air Cyls</div>
                </div>

                <div className="bg-[#faf8f5] p-2.5 rounded-2xl border border-[#ede7dc]">
                  <div className="text-[9px] text-[#8c8074] font-bold">TAKEOFF POWER</div>
                  <div className="font-extrabold text-[#d8533c] mt-0.5">84.5 kW / 115 HP</div>
                  <div className="text-[8px] text-slate-500">@ 5,800 RPM (5 min)</div>
                </div>

                <div className="bg-[#faf8f5] p-2.5 rounded-2xl border border-[#ede7dc]">
                  <div className="text-[9px] text-[#8c8074] font-bold">GEARBOX RATIO</div>
                  <div className="font-extrabold text-[#0284c7] mt-0.5">i = 2.4286</div>
                  <div className="text-[8px] text-slate-500">Torsional Clutch (51/21T)</div>
                </div>

                <div className="bg-[#faf8f5] p-2.5 rounded-2xl border border-[#ede7dc]">
                  <div className="text-[9px] text-[#8c8074] font-bold">DRY WEIGHT</div>
                  <div className="font-extrabold text-[#1c1917] mt-0.5">74.4 kg</div>
                  <div className="text-[8px] text-slate-500">Config 3 with Governor</div>
                </div>
              </div>

              <div className="mt-4 w-full flex items-center justify-between pt-3 border-t border-slate-200 text-xs font-mono text-slate-500">
                <span className="text-[10px]">
                  Reference: BRP-Rotax 914 Series Installation Manual (IM-914 Edition 2)
                </span>
                <button
                  onClick={() => setViewMode('3D')}
                  className="px-3 py-1 bg-[#1c1917] text-white rounded-full text-[10px] font-bold hover:bg-[#d8533c] transition-colors"
                >
                  RETURN TO 3D TWIN
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
