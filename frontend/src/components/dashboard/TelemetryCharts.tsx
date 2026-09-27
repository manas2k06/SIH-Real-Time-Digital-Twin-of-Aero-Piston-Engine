import React, { useEffect, useState, useRef } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';

interface DataPoint {
  timeSec: number;
  // Avionics
  altitudeTarget: number;
  altitudeActual: number;
  groundSpeed: number;
  airSpeed: number;
  verticalSpeed: number;
  batteryPct: number;
  powerW: number;
  m1Rpm: number;
  m3Rpm: number;
  avgMotorTemp: number;
  // Aero-Piston Engine
  engineRpm: number;
  engineLoadPct: number;
  throttlePct: number;
  chtAvg: number;
  egtAvg: number;
  oilPressBar: number;
  oilTempC: number;
  fuelFlowLph: number;
  mapInHg: number;
  vibrationRms: number;
}

export const TelemetryCharts: React.FC = () => {
  const { telemetry } = useTelemetry();
  const [streamMode, setStreamMode] = useState<'AERO_PISTON' | 'AVIONICS'>('AERO_PISTON');
  const [historyBuffer, setHistoryBuffer] = useState<DataPoint[]>([]);
  const [timeWindowSec, setTimeWindowSec] = useState<30 | 60 | 120>(60);
  const timeCounterRef = useRef<number>(0);

  useEffect(() => {
    if (!telemetry) return;

    timeCounterRef.current += 1;
    const eng = telemetry.engine;
    const newPoint: DataPoint = {
      timeSec: timeCounterRef.current,
      altitudeTarget: telemetry.flightControl.targetAltitude,
      altitudeActual: telemetry.flightControl.actualAltitude,
      groundSpeed: telemetry.movement.groundSpeed,
      airSpeed: telemetry.movement.airSpeed,
      verticalSpeed: telemetry.movement.verticalSpeed,
      batteryPct: telemetry.battery.percentage,
      powerW: telemetry.battery.power,
      m1Rpm: telemetry.propulsion.motors[0].rpm,
      m3Rpm: telemetry.propulsion.motors[2].rpm,
      avgMotorTemp: telemetry.propulsion.avgMotorTemp,
      // Engine dynamics
      engineRpm: eng ? eng.operating.rpm : 0,
      engineLoadPct: eng ? eng.operating.engineLoad : 0,
      throttlePct: eng ? eng.operating.throttlePosition : 0,
      chtAvg: eng ? eng.combustion.cht.average : 0,
      egtAvg: eng ? eng.combustion.egt.average : 0,
      oilPressBar: eng ? eng.lubrication.oilPressure : 0,
      oilTempC: eng ? eng.lubrication.oilTemperature : 0,
      fuelFlowLph: eng ? eng.fuel.fuelFlow : 0,
      mapInHg: eng ? eng.intake.map : 0,
      vibrationRms: eng ? eng.vibration.rmsVibration : 0,
    };

    setHistoryBuffer((prev) => {
      const next = [...prev, newPoint];
      if (next.length > 180) next.shift();
      return next;
    });
  }, [telemetry]);

  const renderSvgPlot = (
    title: string,
    unit: string,
    currentValue: string,
    series: Array<{ label: string; color: string; getValue: (d: DataPoint) => number; isDashed?: boolean }>,
    minY: number,
    maxY: number
  ) => {
    const width = 280;
    const height = 110;
    const padX = 32;
    const padY = 16;
    const plotW = width - padX - 8;
    const plotH = height - padY - 14;

    const visibleData = historyBuffer.slice(-timeWindowSec);
    const count = visibleData.length;

    const toSvgCoord = (idx: number, val: number) => {
      const x = padX + (count > 1 ? (idx / (count - 1)) * plotW : plotW);
      const clampedVal = Math.min(maxY, Math.max(minY, val));
      const y = height - 14 - ((clampedVal - minY) / (maxY - minY || 1)) * plotH;
      return { x, y };
    };

    return (
      <div className="bg-[#efeae2] border border-[#ded5c7] rounded-xl p-3 font-mono flex flex-col justify-between shadow-inner">
        {/* Title & Live Metric */}
        <div className="flex items-center justify-between text-[10px] mb-1.5 pb-1 border-b border-[#ded5c7]">
          <span className="font-bold text-[#1c1917] uppercase tracking-wider">{title}</span>
          <span className="font-bold text-[#d8533c] text-[11px]">{currentValue}</span>
        </div>

        {/* SVG Engineering Plot */}
        <div className="relative w-full h-[90px] bg-white rounded-lg border border-[#ded5c7] overflow-hidden">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
            {/* Horizontal Grid Datum Lines */}
            <line x1={padX} y1={padY} x2={width - 8} y2={padY} stroke="#ded5c7" strokeWidth="0.8" />
            <line x1={padX} y1={padY + plotH / 2} x2={width - 8} y2={padY + plotH / 2} stroke="#ded5c7" strokeWidth="0.8" />
            <line x1={padX} y1={height - 14} x2={width - 8} y2={height - 14} stroke="#c4baa9" strokeWidth="1" />

            {/* Y-Axis Monospace Labels */}
            <text x={padX - 4} y={padY + 4} fill="#8c8074" fontSize="7.5" textAnchor="end" fontWeight="bold">{maxY}</text>
            <text x={padX - 4} y={padY + plotH / 2 + 3} fill="#8c8074" fontSize="7.5" textAnchor="end" fontWeight="bold">{Math.round((minY + maxY) / 2)}</text>
            <text x={padX - 4} y={height - 14} fill="#8c8074" fontSize="7.5" textAnchor="end" fontWeight="bold">{minY}</text>

            {/* Render Series Traces */}
            {series.map((s, sIdx) => {
              if (count < 2) return null;
              const points = visibleData.map((d, i) => {
                const { x, y } = toSvgCoord(i, s.getValue(d));
                return `${x},${y}`;
              }).join(' ');

              return (
                <polyline
                  key={sIdx}
                  points={points}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={s.isDashed ? '1.2' : '1.8'}
                  strokeDasharray={s.isDashed ? '3 3' : undefined}
                />
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-2 text-[8px] text-[#786c5f] mt-1.5 pt-1 border-t border-[#ded5c7]">
          {series.map((s, sIdx) => (
            <div key={sIdx} className="flex items-center space-x-1">
              <span className="w-2.5 h-[2px] rounded" style={{ backgroundColor: s.color }} />
              <span className="text-[#1c1917] font-semibold">{s.label}</span>
            </div>
          ))}
          <span className="ml-auto text-[#8c8074] font-bold">[{unit}]</span>
        </div>
      </div>
    );
  };

  if (!telemetry) return null;

  return (
    <div className="bg-[#faf8f5] border border-[#ddd5c7] rounded-2xl p-4 flex flex-col justify-between select-none shadow-xs font-mono">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#e5dfd3] text-[11px]">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-[#1c1917] tracking-wide">
            Real-Time Oscillograms (4-Channel Telemetry Stream)
          </span>
          {/* Mode Switcher Tabs */}
          <div className="flex items-center bg-[#efeae2] p-0.5 rounded-lg border border-[#ded5c7]">
            <button
              onClick={() => setStreamMode('AERO_PISTON')}
              className={`px-2 py-0.5 text-[9px] font-bold rounded-md transition-all ${
                streamMode === 'AERO_PISTON'
                  ? 'bg-white text-[#d8533c] shadow-xs border border-[#ded5c7]'
                  : 'text-[#786c5f] hover:text-[#1c1917]'
              }`}
            >
              AERO-PISTON DYNAMICS
            </button>
            <button
              onClick={() => setStreamMode('AVIONICS')}
              className={`px-2 py-0.5 text-[9px] font-bold rounded-md transition-all ${
                streamMode === 'AVIONICS'
                  ? 'bg-white text-[#d8533c] shadow-xs border border-[#ded5c7]'
                  : 'text-[#786c5f] hover:text-[#1c1917]'
              }`}
            >
              AVIONICS & KINEMATICS
            </button>
          </div>
        </div>

        {/* Window Switcher */}
        <div className="flex items-center space-x-1.5">
          <span className="text-[9px] text-[#786c5f] mr-1">WINDOW:</span>
          {[30, 60, 120].map((t) => (
            <button
              key={t}
              onClick={() => setTimeWindowSec(t as 30 | 60 | 120)}
              className={`px-2 py-0.5 text-[9px] rounded-md font-bold transition-all border ${
                timeWindowSec === t
                  ? 'bg-white text-[#d8533c] border-[#d8d0c2] shadow-xs'
                  : 'bg-[#efeae2] text-[#786c5f] border-transparent hover:bg-white'
              }`}
            >
              {t}S
            </button>
          ))}
        </div>
      </div>

      {/* 4 Oscillogram Charts Grid (2x2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
        {streamMode === 'AERO_PISTON' ? (
          <>
            {/* Plot 1: Engine RPM & Throttle Load */}
            {renderSvgPlot(
              'Rotax 914F Core RPM',
              'RPM',
              `${(telemetry.engine?.operating.rpm ?? 0).toFixed(0)} RPM [${(telemetry.engine?.operating.engineLoad ?? 0).toFixed(0)}% LOAD]`,
              [
                { label: 'CRANK RPM', color: '#d8533c', getValue: (d) => d.engineRpm },
                { label: 'LOAD EQUIV', color: '#2d6a4f', getValue: (d) => (d.engineLoadPct / 100) * 5800, isDashed: true },
              ],
              0,
              6000
            )}

            {/* Plot 2: Combustion Core Temperatures */}
            {renderSvgPlot(
              'Combustion Core Thermal',
              '°C',
              `CHT ${telemetry.engine?.combustion.cht.average.toFixed(0)}°C / EGT ${telemetry.engine?.combustion.egt.average.toFixed(0)}°C`,
              [
                { label: 'EGT AVG', color: '#d8533c', getValue: (d) => d.egtAvg },
                { label: 'CHT AVG', color: '#2d6a4f', getValue: (d) => d.chtAvg },
              ],
              50,
              950
            )}

            {/* Plot 3: Lubrication System Hydraulics */}
            {renderSvgPlot(
              'Lubrication Oil Circuit',
              'BAR / °C',
              `${(telemetry.engine?.lubrication.oilPressure ?? 0).toFixed(2)} bar | ${(telemetry.engine?.lubrication.oilTemperature ?? 0).toFixed(0)}°C`,
              [
                { label: 'OIL P (x20)', color: '#d97706', getValue: (d) => d.oilPressBar * 20 },
                { label: 'OIL TEMP', color: '#d8533c', getValue: (d) => d.oilTempC },
              ],
              0,
              150
            )}

            {/* Plot 4: Turbo Induction & Fuel Burn */}
            {renderSvgPlot(
              'Induction MAP & Fuel Flow',
              'inHg / L/h',
              `MAP ${(telemetry.engine?.intake.map ?? 0).toFixed(1)} inHg | ${(telemetry.engine?.fuel.fuelFlow ?? 0).toFixed(1)} L/h`,
              [
                { label: 'MAP (inHg)', color: '#2d6a4f', getValue: (d) => d.mapInHg },
                { label: 'FUEL (L/h)', color: '#d8533c', getValue: (d) => d.fuelFlowLph, isDashed: true },
              ],
              0,
              50
            )}
          </>
        ) : (
          <>
            {/* Plot 1: Altitude & Command Tracking */}
            {renderSvgPlot(
              'Altitude Tracking',
              'METERS',
              `${telemetry.flightControl.actualAltitude.toFixed(1)} m`,
              [
                { label: 'ACTUAL', color: '#d8533c', getValue: (d) => d.altitudeActual },
                { label: 'TARGET', color: '#786c5f', getValue: (d) => d.altitudeTarget, isDashed: true },
              ],
              0,
              160
            )}

            {/* Plot 2: Velocity Vectors */}
            {renderSvgPlot(
              'Airspeed & Groundspeed',
              'M/S',
              `${telemetry.movement.airSpeed.toFixed(1)} m/s`,
              [
                { label: 'AIRSPEED', color: '#2d6a4f', getValue: (d) => d.airSpeed },
                { label: 'GND SPEED', color: '#d97706', getValue: (d) => d.groundSpeed, isDashed: true },
              ],
              0,
              30
            )}

            {/* Plot 3: Propulsion Motor RPM */}
            {renderSvgPlot(
              'Rotor Speeds (M1 / M3)',
              'RPM',
              `${telemetry.propulsion.motors[0].rpm} RPM`,
              [
                { label: 'M1 FRONT', color: '#d8533c', getValue: (d) => d.m1Rpm },
                { label: 'M3 REAR', color: '#2d6a4f', getValue: (d) => d.m3Rpm },
              ],
              6000,
              10500
            )}

            {/* Plot 4: Power Demand & Bus Drain */}
            {renderSvgPlot(
              'Electrical Bus Load',
              'WATTS',
              `${telemetry.battery.power.toFixed(0)} W`,
              [
                { label: 'BUS LOAD', color: '#d97706', getValue: (d) => d.powerW },
              ],
              200,
              950
            )}
          </>
        )}
      </div>
    </div>
  );
};
