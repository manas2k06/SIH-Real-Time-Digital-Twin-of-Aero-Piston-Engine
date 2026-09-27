import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';

export const MissionCard: React.FC = () => {
  const { telemetry } = useTelemetry();

  if (!telemetry) return null;
  const { mission } = telemetry;

  const formatEta = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="bg-[#faf8f5] border border-[#ddd5c7] rounded-2xl p-4 flex flex-col justify-between select-none shadow-xs font-mono">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#e5dfd3] text-[11px]">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-[#1c1917] tracking-wide">
            Mission Manifest & Route
          </span>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[9px] bg-[#d8533c]/10 text-[#d8533c] border border-[#d8533c]/20 uppercase font-bold">
          {mission.status}
        </span>
      </div>

      <div className="pt-3 space-y-3 text-xs">
        {/* Mission Identifier & Waypoint Progress Tally */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[9px] text-[#786c5f] uppercase font-bold">Plan Name</div>
            <div className="text-sm font-bold text-[#1c1917] tracking-wide">{mission.name}</div>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-[#786c5f] uppercase font-bold">Waypoint Step</div>
            <div className="text-sm font-bold text-[#1c1917]">
              {mission.currentWaypoint.toString().padStart(2, '0')}{' '}
              <span className="text-[#8c8074] text-[10px] font-normal">
                / {mission.totalWaypoints.toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Segment */}
        <div>
          <div className="flex justify-between text-[9px] text-[#786c5f] mb-1 font-bold">
            <span>Route Completion</span>
            <span className="font-bold text-[#1c1917]">{mission.progressPercent}%</span>
          </div>
          <div className="w-full bg-[#ded5c7] h-2 rounded-full overflow-hidden p-[1px]">
            <div
              className="h-full bg-[#d8533c] rounded-full transition-all duration-300"
              style={{ width: `${mission.progressPercent}%` }}
            />
          </div>
        </div>

        {/* Temporal Metrics Row */}
        <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
          <div className="bg-white p-2 rounded-xl border border-[#ded5c7]">
            <span className="text-[8px] text-[#8c8074] block uppercase font-bold">Distance</span>
            <span className="font-bold text-[#1c1917]">{mission.distanceTravelledKm.toFixed(1)} km</span>
          </div>
          <div className="bg-white p-2 rounded-xl border border-[#ded5c7]">
            <span className="text-[8px] text-[#8c8074] block uppercase font-bold">Est. Remaining</span>
            <span className="font-bold text-[#1c1917]">{formatEta(mission.estimatedCompletionTimeSeconds)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
