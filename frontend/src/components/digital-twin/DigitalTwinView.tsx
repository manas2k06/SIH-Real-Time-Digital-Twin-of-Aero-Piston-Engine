import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { DroneModel3D } from './DroneModel3D';
import { CoordinateGizmo } from './CoordinateGizmo';
import { useTelemetry } from '../../context/TelemetryContext';
import { Camera, Box, RotateCcw, Maximize2, Minimize2 } from 'lucide-react';

export type CameraPreset = 'ORBIT' | 'TOP' | 'FRONT' | 'SIDE';

export const DigitalTwinView: React.FC<{ isExpanded?: boolean; onToggleExpand?: () => void }> = ({
  isExpanded,
  onToggleExpand,
}) => {
  const { telemetry, syncStatus } = useTelemetry();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const [currentPreset, setCurrentPreset] = useState<CameraPreset>('ORBIT');
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showHud, setShowHud] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'3D' | 'PHOTO'>('3D');

  const setCameraView = (preset: CameraPreset) => {
    if (!controlsRef.current) return;
    setCurrentPreset(preset);

    const controls = controlsRef.current;
    const camera = controls.object as THREE.PerspectiveCamera;

    if (preset === 'ORBIT') {
      camera.position.set(-2.2, 1.5, -2.5);
      controls.target.set(0, 0.45, 0);
    } else if (preset === 'TOP') {
      camera.position.set(0, 3.8, -0.01);
      controls.target.set(0, 0.45, 0);
    } else if (preset === 'FRONT') {
      camera.position.set(0, 0.55, -2.8);
      controls.target.set(0, 0.45, 0);
    } else if (preset === 'SIDE') {
      camera.position.set(-2.8, 0.55, 0);
      controls.target.set(0, 0.45, 0);
    }
    controls.update();
  };

  const handleResetCamera = () => {
    setCameraView('ORBIT');
  };

  const roll = telemetry?.attitude.roll ?? 0;
  const pitch = telemetry?.attitude.pitch ?? 0;
  const heading = telemetry?.movement.heading ?? 0;
  const airspeed = telemetry?.movement.airSpeed ?? 0;
  const altitude = telemetry?.geoPosition.altitudeAgl ?? 0;
  const verticalSpeed = telemetry?.movement.verticalSpeed ?? 0;

  return (
    <div className={`relative bg-white/90 border border-slate-200 rounded-3xl overflow-hidden flex flex-col shadow-xs transition-all ${isExpanded ? 'h-[720px]' : 'h-[380px] lg:h-[430px]'}`}>
      {/* Viewport MFD Bezel Bar (Luminous Light Style) */}
      <div className="flex flex-wrap items-center justify-between px-3 py-1.5 bg-[#efeae2] border-b border-[#ddd5c7] text-[10px] text-[#6e6457] z-10 select-none gap-2">
        <div className="flex items-center space-x-2">
          <span className="font-mono font-bold text-[#1c1917] tracking-wide">
            PRIMARY FLIGHT DISPLAY · DIGITAL TWIN
          </span>
          <span className="text-[#b5aa9c]">|</span>
          <span className="text-[#d8533c] font-mono font-semibold">
            {syncStatus?.updateRateHz || 20} Hz Synchronized
          </span>
        </div>

        {/* Viewport Controls */}
        <div className="flex items-center space-x-1.5">
          {/* Mode Switcher: 3D vs Sample Photo */}
          <div className="flex items-center bg-[#e4ddcf] p-0.5 rounded-full border border-[#d5ccbe]">
            <button
              onClick={() => setViewMode('3D')}
              className={`flex items-center gap-1 px-2 py-0.5 text-[9px] font-mono font-bold rounded-full transition-all ${
                viewMode === '3D'
                  ? 'bg-white text-[#d8533c] shadow-xs'
                  : 'text-[#6e6457] hover:text-[#1c1917]'
              }`}
            >
              <Box className="w-3 h-3" />
              3D MODEL
            </button>
            <button
              onClick={() => setViewMode('PHOTO')}
              className={`flex items-center gap-1 px-2 py-0.5 text-[9px] font-mono font-bold rounded-full transition-all ${
                viewMode === 'PHOTO'
                  ? 'bg-white text-[#d8533c] shadow-xs'
                  : 'text-[#6e6457] hover:text-[#1c1917]'
              }`}
            >
              <Camera className="w-3 h-3" />
              DRONE SAMPLE
            </button>
          </div>

          {viewMode === '3D' && (
            <>
              {/* Camera Presets */}
              <div className="hidden sm:flex items-center space-x-0.5 bg-[#e4ddcf] p-0.5 rounded-md border border-[#d5ccbe]">
                {(['ORBIT', 'TOP', 'FRONT', 'SIDE'] as const).map((preset) => (
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

              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`px-2 py-0.5 text-[9px] font-mono font-semibold rounded border transition-colors ${
                  showGrid
                    ? 'bg-white text-[#d8533c] border-[#d8d0c2]'
                    : 'bg-[#efeae2] text-[#8c8074] border-[#ddd5c7]'
                }`}
                title="Toggle Reference Ground"
              >
                GRID
              </button>

              <button
                onClick={() => setShowHud(!showHud)}
                className={`px-2 py-0.5 text-[9px] font-mono font-semibold rounded border transition-colors ${
                  showHud
                    ? 'bg-white text-[#d8533c] border-[#d8d0c2]'
                    : 'bg-[#efeae2] text-[#8c8074] border-[#ddd5c7]'
                }`}
                title="Toggle PFD HUD Overlay"
              >
                HUD
              </button>

              <button
                onClick={handleResetCamera}
                className="p-1 rounded bg-[#efeae2] text-[#6e6457] hover:text-[#1c1917] hover:bg-white border border-[#ddd5c7] transition-colors"
                title="Reset Camera"
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

      {/* Main Viewport Content */}
      <div className="relative flex-1 w-full h-full bg-[#f2ede4] overflow-hidden">
        {viewMode === '3D' ? (
          <>
            {/* 3D WebGL Canvas in Warm Studio Atmosphere */}
            <Canvas
              shadows
              gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
              className="w-full h-full cursor-grab active:cursor-grabbing"
            >
              {/* Studio Warm Sand Background */}
              <color attach="background" args={['#ede7dc']} />
              <PerspectiveCamera makeDefault position={[-2.2, 1.5, -2.5]} fov={45} />
              <OrbitControls
                ref={controlsRef}
                enableDamping
                dampingFactor={0.12}
                maxDistance={14}
                minDistance={0.8}
                target={[0, 0.45, 0]}
              />

              {/* High-Key Studio Lighting */}
              <ambientLight intensity={0.9} color="#ffffff" />
              <directionalLight
                position={[-4, 8, -6]}
                intensity={1.6}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
                shadow-bias={-0.0001}
              />
              <directionalLight position={[5, 6, 4]} intensity={0.8} color="#f5efe6" />
              <directionalLight position={[0, -2, -3]} intensity={0.4} color="#e5ded2" />

              {/* Quadcopter 3D Model */}
              <DroneModel3D telemetry={telemetry} />

              {/* Ground Plane & Reference Grid */}
              {showGrid && <CoordinateGizmo telemetry={telemetry} />}
            </Canvas>

            {/* PFD Avionics HUD Layer (Light Ceramic & Ink HUD) */}
            {showHud && (
              <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-3">
                {/* Top HUD: Coordinates & Attitude Euler Vector */}
                <div className="flex items-start justify-between">
                  {/* Left Top: Euler Angles */}
                  <div className="bg-[#ffffff]/90 backdrop-blur-sm border border-[#ddd5c7] px-2.5 py-1.5 rounded-xl font-mono text-[10px] text-[#5c544d] space-y-0.5 shadow-xs">
                    <div className="text-[8px] uppercase tracking-wider text-[#8c8074] font-bold">ATTITUDE (DEG)</div>
                    <div className="flex space-x-2 text-[#1c1917]">
                      <span>R: <strong className="font-semibold">{roll >= 0 ? '+' : ''}{roll.toFixed(1)}°</strong></span>
                      <span>P: <strong className="font-semibold">{pitch >= 0 ? '+' : ''}{pitch.toFixed(1)}°</strong></span>
                      <span>Y: <strong className="text-[#d8533c] font-bold">{heading.toFixed(0)}°</strong></span>
                    </div>
                  </div>

                  {/* Right Top: Local Cartesian NED Frame */}
                  <div className="bg-[#ffffff]/90 backdrop-blur-sm border border-[#ddd5c7] px-2.5 py-1.5 rounded-xl font-mono text-[10px] text-[#5c544d] space-y-0.5 text-right shadow-xs">
                    <div className="text-[8px] uppercase tracking-wider text-[#8c8074] font-bold">LOCAL CARTESIAN (M)</div>
                    <div className="flex space-x-2 text-[#1c1917] justify-end">
                      <span>X: <strong className="font-semibold">{telemetry?.simCoordinates.x.toFixed(1) ?? '0.0'}</strong></span>
                      <span>Y: <strong className="font-semibold">{telemetry?.simCoordinates.y.toFixed(1) ?? '0.0'}</strong></span>
                      <span>Z: <strong className="text-[#d8533c] font-bold">{telemetry?.simCoordinates.z.toFixed(1) ?? '0.0'}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Center ADI: Artificial Horizon Reticle */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    className="relative w-52 h-52 flex items-center justify-center transition-transform duration-75"
                    style={{ transform: `rotate(${-(roll)}deg)` }}
                  >
                    {/* Roll Angle Arc */}
                    <div className="absolute top-4 w-36 h-18 border-t-2 border-[#b8aca0] rounded-t-full flex justify-between px-2 text-[8px] font-mono text-[#786c5f]">
                      <span className="-mt-1 font-bold">-30°</span>
                      <div className="w-2 h-2 rounded-full bg-[#d8533c] -mt-1 mx-auto ring-2 ring-white" />
                      <span className="-mt-1 font-bold">+30°</span>
                    </div>

                    {/* Fixed Aircraft Waterline Reticle */}
                    <div className="absolute flex items-center justify-center pointer-events-none">
                      <div className="w-6 h-[2px] bg-[#d8533c] rounded" />
                      <div className="w-2.5 h-2.5 rounded-full border-2 border-[#d8533c] mx-1" />
                      <div className="w-6 h-[2px] bg-[#d8533c] rounded" />
                    </div>
                  </div>
                </div>

                {/* Left Edge: Airspeed Tape */}
                <div className="absolute left-3 top-16 bottom-16 w-12 bg-[#ffffff]/90 backdrop-blur-sm border border-[#ddd5c7] rounded-xl flex flex-col justify-between py-1.5 px-1 font-mono text-[9px] text-[#5c544d] shadow-xs">
                  <div className="text-[8px] text-center uppercase tracking-wider text-[#8c8074] font-bold border-b border-[#e5dfd3] pb-0.5">SPD</div>
                  <div className="flex-1 flex flex-col justify-around text-right pr-1">
                    <div className="flex items-center justify-end space-x-1">
                      <span>35</span>
                      <div className="w-1.5 h-[1px] bg-[#b8aca0]" />
                    </div>
                    <div className="flex items-center justify-end space-x-1">
                      <span>25</span>
                      <div className="w-1.5 h-[1px] bg-[#b8aca0]" />
                    </div>
                    <div className="bg-[#1c1917] text-white rounded font-bold py-0.5 px-0.5 text-center text-[10px]">
                      {airspeed.toFixed(1)}
                    </div>
                    <div className="flex items-center justify-end space-x-1">
                      <span>15</span>
                      <div className="w-1.5 h-[1px] bg-[#b8aca0]" />
                    </div>
                    <div className="flex items-center justify-end space-x-1">
                      <span>05</span>
                      <div className="w-1.5 h-[1px] bg-[#b8aca0]" />
                    </div>
                  </div>
                  <div className="text-[8px] text-center text-[#8c8074] font-semibold">M/S</div>
                </div>

                {/* Right Edge: Altitude Tape */}
                <div className="absolute right-3 top-16 bottom-16 w-14 bg-[#ffffff]/90 backdrop-blur-sm border border-[#ddd5c7] rounded-xl flex flex-col justify-between py-1.5 px-1 font-mono text-[9px] text-[#5c544d] shadow-xs">
                  <div className="text-[8px] text-center uppercase tracking-wider text-[#8c8074] font-bold border-b border-[#e5dfd3] pb-0.5">ALT</div>
                  <div className="flex-1 flex flex-col justify-around text-left pl-1">
                    <div className="flex items-center space-x-1">
                      <div className="w-1.5 h-[1px] bg-[#b8aca0]" />
                      <span>130</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-1.5 h-[1px] bg-[#b8aca0]" />
                      <span>110</span>
                    </div>
                    <div className="bg-[#d8533c] text-white rounded font-bold py-0.5 px-0.5 text-center text-[10px]">
                      {altitude.toFixed(1)}
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-1.5 h-[1px] bg-[#b8aca0]" />
                      <span>090</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-1.5 h-[1px] bg-[#b8aca0]" />
                      <span>070</span>
                    </div>
                  </div>
                  <div className="text-[8px] text-center text-[#8c8074] font-semibold">
                    V: {verticalSpeed >= 0 ? '+' : ''}{verticalSpeed.toFixed(1)}
                  </div>
                </div>

                {/* Bottom Edge: Compass Heading Ribbon */}
                <div className="flex items-end justify-center">
                  <div className="bg-[#ffffff]/90 backdrop-blur-sm border border-[#ddd5c7] px-4 py-1.5 rounded-full font-mono text-[10px] text-[#5c544d] flex items-center space-x-3 shadow-xs">
                    <span className="text-[8px] uppercase tracking-wider text-[#8c8074] font-bold">HDG:</span>
                    <span className="text-white font-bold text-[11px] bg-[#1c1917] px-2 py-0.5 rounded-full">
                      {heading.toString().padStart(3, '0')}°
                    </span>
                    <span className="text-[#1c1917] font-semibold text-[9px]">
                      {heading >= 337.5 || heading < 22.5 ? 'NORTH (N)' :
                       heading >= 22.5 && heading < 67.5 ? 'NORTHEAST (NE)' :
                       heading >= 67.5 && heading < 112.5 ? 'EAST (E)' :
                       heading >= 112.5 && heading < 157.5 ? 'SOUTHEAST (SE)' :
                       heading >= 157.5 && heading < 202.5 ? 'SOUTH (S)' :
                       heading >= 202.5 && heading < 247.5 ? 'SOUTHWEST (SW)' :
                       heading >= 247.5 && heading < 292.5 ? 'WEST (W)' : 'NORTHWEST (NW)'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* PHOTO SPECIMEN MODE (Uses the user's Drone image as the sample model!) */
          <div className="w-full h-full flex flex-col items-center justify-center p-6 relative">
            <div className="relative max-w-[420px] w-full bg-white rounded-3xl p-6 border border-[#ddd5c7] shadow-md flex flex-col items-center justify-center">
              <img
                src="/assets/drone-specimen.jpg"
                alt="AEROTWIN AI Sample Drone Model"
                className="w-full h-auto object-contain max-h-[260px] filter drop-shadow-md"
              />
              <div className="mt-4 w-full flex items-center justify-between pt-3 border-t border-slate-200 text-xs font-mono">
                <div>
                  <div className="font-bold text-[#0f172a]">AEROTWIN MALE-UAV V8</div>
                  <div className="text-[10px] text-slate-500">Sample Airframe Carrier · Rotax 914F Powerplant</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                  CALIBRATED
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
