import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { StatusBadge } from '../ui/StatusBadge';

export const SyncStatusCard: React.FC = () => {
  const { syncStatus, isRunning } = useTelemetry();

  return (
    <div className="bg-[#faf8f5] border border-[#ddd5c7] rounded-2xl p-4 flex flex-col justify-between select-none shadow-xs font-mono">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#e5dfd3] text-[11px]">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-[#1c1917] tracking-wide">
            Digital Twin Synchronization
          </span>
        </div>
        <StatusBadge status="SYNCED" size="sm" />
      </div>

      {/* Sync Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 text-[10px]">
        <div className="bg-[#efeae2] p-2.5 rounded-xl border border-[#ded5c7]">
          <div className="text-[8px] text-[#786c5f] uppercase font-bold">Telemetry Link</div>
          <div className="text-[12px] font-bold text-[#1c1917] mt-0.5">Live Stream</div>
          <div className="text-[8px] text-[#8c8074]">HARDWARE BUS</div>
        </div>

        <div className="bg-[#efeae2] p-2.5 rounded-xl border border-[#ded5c7]">
          <div className="text-[8px] text-[#786c5f] uppercase font-bold">Physics Engine</div>
          <div className="text-[12px] font-bold text-[#1c1917] mt-0.5">{isRunning ? 'Running' : 'Paused'}</div>
          <div className="text-[8px] text-[#8c8074]">6-DOF REALTIME</div>
        </div>

        <div className="bg-[#efeae2] p-2.5 rounded-xl border border-[#ded5c7]">
          <div className="text-[8px] text-[#786c5f] uppercase font-bold">Sample Rate</div>
          <div className="text-[12px] font-bold text-[#d8533c] mt-0.5">{syncStatus?.updateRateHz || 20} Hz</div>
          <div className="text-[8px] text-[#8c8074]">50 MS INTERVAL</div>
        </div>

        <div className="bg-[#efeae2] p-2.5 rounded-xl border border-[#ded5c7]">
          <div className="text-[8px] text-[#786c5f] uppercase font-bold">Latency / Jitter</div>
          <div className="text-[12px] font-bold text-[#1c1917] mt-0.5">{syncStatus?.latencyMs || 38} ms</div>
          <div className="text-[8px] text-[#8c8074]">0.00% LOSS</div>
        </div>
      </div>
    </div>
  );
};
