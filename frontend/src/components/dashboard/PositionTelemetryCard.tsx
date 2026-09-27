import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';

export const PositionTelemetryCard: React.FC = () => {
  const { telemetry } = useTelemetry();

  if (!telemetry) return null;
  const { geoPosition, simCoordinates, movement, sensors } = telemetry;

  return (
    <div className="bg-[#faf8f5] border border-[#ddd5c7] rounded-2xl p-4 flex flex-col justify-between select-none shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#e5dfd3] text-[11px]">
        <div className="flex items-center space-x-2">
          <span className="font-mono font-bold text-[#1c1917] tracking-wide">
            Position & Kinematics
          </span>
        </div>
        <div className="flex items-center space-x-1.5 text-[10px] font-mono">
          <span className="text-[#8c8074]">GNSS:</span>
          <span className="text-[#1c1917] font-semibold">{sensors.gps.fixType}</span>
          <span className="text-[#8c8074]">({sensors.gps.satelliteCount} Sats)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 text-xs">
        {/* Left: Geodetic WGS84 Datum */}
        <div className="bg-[#efeae2] p-3 rounded-xl border border-[#ded5c7] space-y-1.5 font-mono">
          <div className="flex items-center justify-between text-[9px] text-[#786c5f] uppercase tracking-wider border-b border-[#ded5c7] pb-1 mb-1 font-bold">
            <span>Geodetic Datum (WGS84)</span>
            <span>HDOP {sensors.gps.hdop.toFixed(2)}</span>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between items-baseline">
              <span className="text-[#786c5f] text-[10px]">Latitude:</span>
              <span className="font-bold text-[#1c1917] tracking-wide">
                {geoPosition.latitude.toFixed(6)}° N
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-[#786c5f] text-[10px]">Longitude:</span>
              <span className="font-bold text-[#1c1917] tracking-wide">
                {geoPosition.longitude.toFixed(6)}° W
              </span>
            </div>
            <div className="flex justify-between items-baseline pt-1 border-t border-[#ded5c7]">
              <span className="text-[#786c5f] text-[10px]">Alt (MSL):</span>
              <span className="font-bold text-[#1c1917]">
                {geoPosition.altitudeMsl.toFixed(1)} m
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-[#786c5f] text-[10px]">Alt (AGL):</span>
              <span className="font-bold text-[#d8533c]">
                {geoPosition.altitudeAgl.toFixed(1)} m
              </span>
            </div>
          </div>
        </div>

        {/* Right: Local Cartesian & Speeds */}
        <div className="bg-[#efeae2] p-3 rounded-xl border border-[#ded5c7] space-y-1.5 font-mono">
          <div className="flex items-center justify-between text-[9px] text-[#786c5f] uppercase tracking-wider border-b border-[#ded5c7] pb-1 mb-1 font-bold">
            <span>Cartesian Frame (NED)</span>
            <span>Velocity</span>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between items-baseline">
              <span className="text-[#786c5f] text-[10px]">Frame X (E):</span>
              <span className="font-bold text-[#1c1917]">
                {simCoordinates.x.toFixed(1)} m
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-[#786c5f] text-[10px]">Frame Y (N):</span>
              <span className="font-bold text-[#1c1917]">
                {simCoordinates.y.toFixed(1)} m
              </span>
            </div>
            <div className="flex justify-between items-baseline pt-1 border-t border-[#ded5c7]">
              <span className="text-[#786c5f] text-[10px]">Air / Gnd Spd:</span>
              <span className="font-bold text-[#1c1917]">
                {movement.airSpeed.toFixed(1)} / {movement.groundSpeed.toFixed(1)}{' '}
                <span className="text-[9px] font-normal text-[#8c8074]">m/s</span>
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-[#786c5f] text-[10px]">Vert Climb:</span>
              <span
                className={`font-bold ${
                  movement.verticalSpeed >= 0 ? 'text-[#2d6a4f]' : 'text-[#d97706]'
                }`}
              >
                {movement.verticalSpeed >= 0 ? '+' : ''}
                {movement.verticalSpeed.toFixed(1)}{' '}
                <span className="text-[9px] font-normal text-[#8c8074]">m/s</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
