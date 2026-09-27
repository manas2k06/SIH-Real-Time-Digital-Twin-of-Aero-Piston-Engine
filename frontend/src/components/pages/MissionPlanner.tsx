import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { FlightPathMap } from '../dashboard/FlightPathMap';

export const MissionPlanner: React.FC = () => {
  const { telemetry } = useTelemetry();

  if (!telemetry) return null;
  const { mission } = telemetry;

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1800px] mx-auto select-none font-mono">
      {/* Page Title */}
      <div className="flex items-center justify-between pb-3 border-b border-[#ddd5c7]">
        <div className="flex items-center space-x-2">
          <h1 className="text-sm font-bold text-[#1c1917] tracking-wide">
            Autonomous Mission Route & Waypoint Manifest
          </h1>
        </div>
        <span className="text-[10px] text-[#1c1917] font-bold px-3 py-1 rounded-full bg-[#efeae2] border border-[#ded5c7]">
          {mission.name} ({mission.progressPercent}% Executed)
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Tactical Map */}
        <div className="lg:col-span-6">
          <FlightPathMap />
        </div>

        {/* Waypoints Table */}
        <div className="lg:col-span-6 bg-[#faf8f5] border border-[#ddd5c7] rounded-2xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#e5dfd3] text-[10px]">
            <span className="font-bold text-[#1c1917] uppercase tracking-wider">WAYPOINT COORDINATE MANIFEST</span>
            <span className="text-[9px] text-[#786c5f]">15 NODES SEQUENCED</span>
          </div>

          <div className="mt-2 h-[260px] overflow-y-auto pr-1">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-[9px] text-[#786c5f] font-bold uppercase border-b border-[#ded5c7]">
                  <th className="pb-1.5 font-bold">NODE</th>
                  <th className="pb-1.5 font-bold">DESCRIPTION</th>
                  <th className="pb-1.5 font-bold text-right">SIM (X, Y)</th>
                  <th className="pb-1.5 font-bold text-right">TARGET ALT</th>
                  <th className="pb-1.5 font-bold text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efeae2]">
                {mission.waypoints.map((wp) => {
                  const isCurrent = wp.id === mission.currentWaypoint;
                  const isReached = wp.reached;

                  return (
                    <tr
                      key={wp.id}
                      className={`text-[10px] transition-colors ${
                        isCurrent
                          ? 'bg-[#efeae2] text-[#d8533c] font-bold'
                          : isReached
                          ? 'text-[#2d6a4f]'
                          : 'text-[#5c544d] hover:bg-[#efeae2]/40'
                      }`}
                    >
                      <td className="py-2 font-bold">WP{wp.id.toString().padStart(2, '0')}</td>
                      <td className="py-2 text-[#786c5f]">{wp.name || `Waypoint Corridor ${wp.id}`}</td>
                      <td className="py-2 text-right">
                        ({wp.x.toFixed(0)}, {wp.y.toFixed(0)})
                      </td>
                      <td className="py-2 text-right font-bold">{wp.altitude.toFixed(1)} m</td>
                      <td className="py-2 text-right">
                        {isCurrent ? (
                          <span className="px-2 py-0.5 rounded-full bg-[#d8533c] text-white font-bold text-[8px]">
                            ACTIVE
                          </span>
                        ) : isReached ? (
                          <span className="px-2 py-0.5 rounded-full bg-[#2d6a4f]/10 text-[#2d6a4f] font-bold text-[8px] border border-[#2d6a4f]/20">
                            DONE
                          </span>
                        ) : (
                          <span className="text-[#8c8074] text-[9px]">QUEUED</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="pt-3 border-t border-[#e5dfd3] flex justify-between text-[10px] text-[#786c5f]">
            <span>EKF ESTIMATED FLIGHT PATH PRECISION: ± 0.8M</span>
            <span>WAYPOINT RADIUS: 2.5M</span>
          </div>
        </div>
      </div>
    </div>
  );
};
