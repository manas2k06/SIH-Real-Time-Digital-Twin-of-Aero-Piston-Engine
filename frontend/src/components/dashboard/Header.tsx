import React, { useState, useEffect } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { StatusBadge } from '../ui/StatusBadge';
import { Compass, Battery, Radio, AlertOctagon, Cpu } from 'lucide-react';

interface HeaderProps {
  onOpenFaultModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenFaultModal }) => {
  const { telemetry, syncStatus, activeFaults, isRunning } = useTelemetry();
  const [zuluTime, setZuluTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getUTCHours().toString().padStart(2, '0');
      const mins = now.getUTCMinutes().toString().padStart(2, '0');
      const secs = now.getUTCSeconds().toString().padStart(2, '0');
      setZuluTime(`${hours}:${mins}:${secs}Z`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const flightMode = telemetry?.flightMode || 'CRUISE';
  const systemStatus = telemetry?.systemStatus || 'NORMAL';
  const droneId = telemetry?.droneId || 'MALE-UAV-01';
  const updateHz = syncStatus?.updateRateHz || 20;
  const batteryPct = telemetry?.battery?.percentage ?? 94;
  const busVolts = '28.4';
  const sats = telemetry?.sensors?.gps?.satelliteCount ?? 21;

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 text-[#0f172a] px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 select-none z-30 sticky top-0 shadow-xs">
      {/* Left: Vehicle Callsign & Brand Emblem */}
      <div className="flex items-center space-x-3.5">
        {/* Drone Avatar Thumbnail with Luminous Accent */}
        <div className="w-10 h-10 rounded-2xl overflow-hidden border border-sky-600/30 shadow-xs bg-slate-900 flex-shrink-0 flex items-center justify-center">
          <img 
            src="/assets/drone-specimen.jpg" 
            alt="MALE-UAV AeroTwin Model" 
            className="w-full h-full object-contain p-0.5"
          />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <span className="font-display font-extrabold text-[15px] sm:text-[16px] tracking-tight text-[#0f172a]">
              AEROTWIN AI
            </span>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300 font-bold">
              SIH26054 · ROTAX-914F
            </span>
          </div>
          <div className="text-[10px] text-slate-500 flex items-center space-x-2 font-mono">
            <span>SPECIMEN: <strong className="text-[#0f172a]">{droneId}</strong></span>
            <span>·</span>
            <span>UTC: <strong className="text-[#0f172a] font-mono">{zuluTime || '00:00:00Z'}</strong></span>
          </div>
        </div>
      </div>

      {/* Center: Flight Ops Annunciator Bank */}
      <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
        {/* Arming Status */}
        <div className="flex items-center space-x-2 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className="text-[10px] text-slate-700 font-bold uppercase tracking-wider">
            {isRunning ? 'POWERPLANT ARMED' : 'STANDBY IDLE'}
          </span>
        </div>

        {/* Flight Mode */}
        <div className="flex items-center space-x-2 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          <span className="text-slate-500 text-[10px] font-medium uppercase">MODE</span>
          <span className="px-2 py-0.2 rounded-full font-bold text-[10px] bg-white text-sky-700 border border-slate-200 shadow-2xs font-mono">
            {flightMode}
          </span>
        </div>

        {/* GNSS Constellation */}
        <div className="hidden sm:flex items-center space-x-1.5 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          <Compass className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[#0f172a] font-bold text-[10px]">
            RTK FIX ({sats})
          </span>
        </div>

        {/* 28V DC Electrical Bus */}
        <div className="hidden md:flex items-center space-x-1.5 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          <Battery className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-[#0f172a] font-bold text-[10px]">
            {busVolts}V ({batteryPct}%)
          </span>
        </div>

        {/* AI Diagnostics State */}
        <div className="hidden lg:flex items-center space-x-1.5 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          <Cpu className="w-3.5 h-3.5 text-sky-600" />
          <span className="text-[#0f172a] font-bold text-[10px]">
            LSTM ANOMALY: NOMINAL
          </span>
        </div>

        {/* Telemetry Stream Health */}
        <div className="hidden lg:flex items-center space-x-1.5 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          <Radio className="w-3.5 h-3.5 text-sky-600" />
          <span className="text-[#0f172a] font-bold text-[10px]">
            {updateHz} HZ ({syncStatus?.latencyMs || 28}ms)
          </span>
        </div>
      </div>

      {/* Right: Master Status & Fault Bench Action */}
      <div className="flex items-center space-x-3">
        {/* System Health Badge */}
        <StatusBadge status={systemStatus} size="sm" pulse />

        {/* Controlled Fault Testbench Trigger */}
        <button
          onClick={onOpenFaultModal}
          className={`btn-dynamic-light px-4 py-1.5 rounded-full font-mono text-[11px] font-bold flex items-center space-x-2 border ${
            activeFaults.length > 0
              ? 'bg-red-50 text-red-700 border-red-300 animate-pulse'
              : 'bg-white text-slate-700 border-slate-300 hover:border-sky-600 hover:text-sky-700'
          }`}
        >
          <AlertOctagon className="w-3.5 h-3.5 text-red-500" />
          <span>
            {activeFaults.length > 0 ? `FAULTS (${activeFaults.length})` : 'FAULT INJECTION'}
          </span>
        </button>
      </div>
    </header>
  );
};
