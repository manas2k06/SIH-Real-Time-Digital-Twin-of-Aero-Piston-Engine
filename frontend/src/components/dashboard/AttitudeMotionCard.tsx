import React, { useState } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';

export const AttitudeMotionCard: React.FC = () => {
  const { telemetry } = useTelemetry();
  const [showAdvanced, setShowAdvanced] = useState<boolean>(true);

  if (!telemetry) return null;
  const { attitude } = telemetry;

  return (
    <div className="bg-[#faf8f5] border border-[#ddd5c7] rounded-2xl p-4 flex flex-col justify-between select-none shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#e5dfd3] text-[11px]">
        <div className="flex items-center space-x-2">
          <span className="font-mono font-bold text-[#1c1917] tracking-wide">
            Inertial Dynamics & Attitude (IMU)
          </span>
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-[9px] text-[#d8533c] hover:text-[#b33d28] transition-colors font-mono font-bold uppercase tracking-wider"
        >
          {showAdvanced ? '[-] Compact' : '[+] Dynamics'}
        </button>
      </div>

      {/* Primary Euler Attitude Metrics */}
      <div className="grid grid-cols-3 gap-2.5 pt-3 text-center">
        {/* Roll */}
        <div className="bg-[#efeae2] p-2.5 rounded-xl border border-[#ded5c7]">
          <div className="text-[9px] uppercase tracking-wider text-[#786c5f] font-mono font-bold">Roll (Φ)</div>
          <div className="text-base font-mono font-bold text-[#1c1917] my-1">
            {attitude.roll >= 0 ? '+' : ''}{attitude.roll.toFixed(1)}°
          </div>
          {/* Miniature Roll Bipolar Line */}
          <div className="relative w-full bg-[#ded5c7] h-2 rounded-full overflow-hidden flex items-center justify-center">
            <div className="w-[1px] h-full bg-[#a89d8f]" />
            <div
              className="absolute h-full bg-[#d8533c] rounded-full transition-all duration-75"
              style={{
                left: attitude.roll >= 0 ? '50%' : `${50 + (attitude.roll / 45) * 50}%`,
                width: `${Math.min(50, Math.abs(attitude.roll / 45) * 50)}%`,
              }}
            />
          </div>
        </div>

        {/* Pitch */}
        <div className="bg-[#efeae2] p-2.5 rounded-xl border border-[#ded5c7]">
          <div className="text-[9px] uppercase tracking-wider text-[#786c5f] font-mono font-bold">Pitch (θ)</div>
          <div className="text-base font-mono font-bold text-[#1c1917] my-1">
            {attitude.pitch >= 0 ? '+' : ''}{attitude.pitch.toFixed(1)}°
          </div>
          {/* Miniature Pitch Bipolar Line */}
          <div className="relative w-full bg-[#ded5c7] h-2 rounded-full overflow-hidden flex items-center justify-center">
            <div className="w-[1px] h-full bg-[#a89d8f]" />
            <div
              className="absolute h-full bg-[#d8533c] rounded-full transition-all duration-75"
              style={{
                left: attitude.pitch >= 0 ? '50%' : `${50 + (attitude.pitch / 30) * 50}%`,
                width: `${Math.min(50, Math.abs(attitude.pitch / 30) * 50)}%`,
              }}
            />
          </div>
        </div>

        {/* Yaw */}
        <div className="bg-[#efeae2] p-2.5 rounded-xl border border-[#ded5c7]">
          <div className="text-[9px] uppercase tracking-wider text-[#786c5f] font-mono font-bold">Yaw (ψ)</div>
          <div className="text-base font-mono font-bold text-[#1c1917] my-1">
            {attitude.yaw.toFixed(1)}°
          </div>
          <div className="text-[8px] text-[#8c8074] font-mono font-semibold">TRUE HEADING</div>
        </div>
      </div>

      {/* Advanced Angular Rates & Accelerations */}
      {showAdvanced && (
        <div className="mt-3 pt-2 border-t border-[#e5dfd3] grid grid-cols-2 gap-3 text-[10px] bg-[#efeae2] p-3 rounded-xl border border-[#ded5c7] font-mono">
          {/* Angular Velocity */}
          <div>
            <div className="text-[9px] text-[#786c5f] font-bold uppercase tracking-wider mb-1">Body Rates (°/s)</div>
            <div className="space-y-0.5 text-[10px]">
              <div className="flex justify-between">
                <span className="text-[#8c8074]">P (Roll):</span>
                <span className="font-bold text-[#1c1917]">{attitude.angularVelocityX.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8c8074]">Q (Pitch):</span>
                <span className="font-bold text-[#1c1917]">{attitude.angularVelocityY.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8c8074]">R (Yaw):</span>
                <span className="font-bold text-[#1c1917]">{attitude.angularVelocityZ.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Accelerations */}
          <div>
            <div className="text-[9px] text-[#786c5f] font-bold uppercase tracking-wider mb-1">Acceleration (g)</div>
            <div className="space-y-0.5 text-[10px]">
              <div className="flex justify-between">
                <span className="text-[#8c8074]">Ax:</span>
                <span className="font-bold text-[#1c1917]">0.02</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8c8074]">Ay:</span>
                <span className="font-bold text-[#1c1917]">-0.01</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8c8074]">Az:</span>
                <span className="font-bold text-[#1c1917]">0.99</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
