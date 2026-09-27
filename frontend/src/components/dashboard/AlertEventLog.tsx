import React, { useState } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { EventLogEntry } from '../../types/simulation';

export const AlertEventLog: React.FC = () => {
  const { eventLogs } = useTelemetry();
  const [filter, setFilter] = useState<'ALL' | 'WARN' | 'CRITICAL'>('ALL');

  const filteredLogs = eventLogs.filter((entry) => {
    if (filter === 'ALL') return true;
    if (filter === 'WARN') return entry.level === 'WARN' || entry.level === 'CRITICAL';
    if (filter === 'CRITICAL') return entry.level === 'CRITICAL';
    return true;
  });

  const getLevelBadge = (level: EventLogEntry['level']) => {
    if (level === 'CRITICAL') {
      return <span className="px-2 py-0.5 text-[9px] font-mono font-extrabold bg-red-100 text-red-700 rounded-full border border-red-300">CRIT</span>;
    }
    if (level === 'WARN') {
      return <span className="px-2 py-0.5 text-[9px] font-mono font-extrabold bg-amber-100 text-amber-800 rounded-full border border-amber-300">WARN</span>;
    }
    return <span className="px-2 py-0.5 text-[9px] font-mono font-extrabold bg-slate-100 text-slate-700 rounded-full border border-slate-300">INFO</span>;
  };

  return (
    <div className="card-surface-pop rounded-3xl p-5 flex flex-col justify-between select-none shadow-sm font-mono">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-display font-extrabold text-[#0c1524] text-sm tracking-wide">
            Flight Recorder Log
          </span>
        </div>
        {/* Filters */}
        <div className="flex items-center space-x-1.5 text-[10px]">
          {(['ALL', 'WARN', 'CRITICAL'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilter(lvl)}
              className={`px-2.5 py-1 rounded-full border font-bold transition-all ${
                filter === lvl
                  ? 'bg-[#0c1524] text-sky-400 border-slate-700 shadow-sm font-extrabold'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Log Feed */}
      <div className="mt-3.5 h-[145px] overflow-y-auto space-y-2 pr-1 text-xs">
        {filteredLogs.length === 0 ? (
          <div className="text-center text-slate-400 py-10 text-xs font-bold">NO EVENTS LOGGED FOR CURRENT FILTER</div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-2 rounded-xl bg-slate-50/90 border border-slate-200/90 flex items-center justify-between gap-2.5 hover:bg-slate-100/80 transition-colors"
            >
              <div className="flex items-center space-x-2.5 truncate">
                {getLevelBadge(log.level)}
                <span className="text-slate-500 text-[10px] font-bold font-mono">{log.timestamp}</span>
                <span className="text-[#0c1524] font-semibold truncate text-[11px]">{log.message}</span>
              </div>
              <span className="text-[9px] text-slate-600 font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-white border border-slate-200 shadow-2xs flex-shrink-0">
                {log.source}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
