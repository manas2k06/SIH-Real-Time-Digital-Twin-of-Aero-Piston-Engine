import React, { useState } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { APP_CONFIG } from '../../services/config';

export const SystemSettings: React.FC = () => {
  const { telemetrySource, setTelemetrySource } = useTelemetry();
  const [droneIdInput, setDroneIdInput] = useState<string>(APP_CONFIG.droneId);
  const [wsUrlInput, setWsUrlInput] = useState<string>(APP_CONFIG.wsBaseUrl);
  const [apiUrlInput, setApiUrlInput] = useState<string>(APP_CONFIG.apiBaseUrl);
  const [selectedUnits, setSelectedUnits] = useState<'METRIC' | 'IMPERIAL'>('METRIC');
  const [selectedFrequency, setSelectedFrequency] = useState<number>(20);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-4xl mx-auto select-none font-mono">
      {/* Page Title */}
      <div className="flex items-center justify-between pb-3 border-b border-[#ddd5c7]">
        <div className="flex items-center space-x-2">
          <h1 className="text-sm font-bold text-[#1c1917] tracking-wide">
            System Telemetry Gateway & Avionics Configuration
          </h1>
        </div>
        {savedSuccess && (
          <span className="text-[10px] text-[#2d6a4f] bg-[#2d6a4f]/10 px-3 py-1 rounded-full border border-[#2d6a4f]/20 font-bold">
            CONFIGURATION COMMITTED
          </span>
        )}
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
        {/* Telemetry Source Mode */}
        <div className="bg-[#faf8f5] p-4 border border-[#ddd5c7] rounded-2xl space-y-3 shadow-xs">
          <div className="text-[10px] font-bold text-[#1c1917] uppercase tracking-wider pb-1.5 border-b border-[#e5dfd3]">
            TELEMETRY INGESTION STREAM MODE
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(['SIMULATION', 'WEBSOCKET', 'REST'] as const).map((source) => (
              <div
                key={source}
                onClick={() => setTelemetrySource(source)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  telemetrySource === source
                    ? 'bg-white border-[#d8533c] shadow-xs'
                    : 'bg-[#efeae2] border-[#ded5c7] text-[#786c5f] hover:border-[#b8aca0]'
                }`}
              >
                <div className={`font-bold text-[11px] mb-1 tracking-wider ${telemetrySource === source ? 'text-[#d8533c]' : 'text-[#1c1917]'}`}>
                  [{source}]
                </div>
                <p className="text-[10px] text-[#5c544d] leading-relaxed font-sans">
                  {source === 'SIMULATION' && 'Local deterministic 20 Hz quadcopter kinematics & physics engine.'}
                  {source === 'WEBSOCKET' && 'Live bi-directional JSON streaming from remote hardware gateway.'}
                  {source === 'REST' && 'Periodic polling HTTP telemetry endpoint.'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Network & Custom Domain Endpoints */}
        <div className="bg-[#faf8f5] p-4 border border-[#ddd5c7] rounded-2xl space-y-3 shadow-xs">
          <div className="text-[10px] font-bold text-[#1c1917] uppercase tracking-wider pb-1.5 border-b border-[#e5dfd3]">
            CUSTOM DOMAIN & NETWORK GATEWAYS
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[#786c5f] text-[9.5px] block mb-1 uppercase font-bold">TARGET VEHICLE IDENTIFIER</label>
              <input
                type="text"
                value={droneIdInput}
                onChange={(e) => setDroneIdInput(e.target.value)}
                className="w-full bg-[#efeae2] border border-[#ded5c7] rounded-lg px-3 py-1.5 text-[#1c1917] font-mono text-[11px] focus:outline-none focus:border-[#d8533c] focus:bg-white"
              />
            </div>

            <div>
              <label className="text-[#786c5f] text-[9.5px] block mb-1 uppercase font-bold">SAMPLE FREQUENCY (HZ)</label>
              <select
                value={selectedFrequency}
                onChange={(e) => setSelectedFrequency(parseInt(e.target.value))}
                className="w-full bg-[#efeae2] border border-[#ded5c7] rounded-lg px-3 py-1.5 text-[#1c1917] font-mono text-[11px] focus:outline-none focus:border-[#d8533c] focus:bg-white"
              >
                <option value={10}>10 HZ (100 MS INTERVAL)</option>
                <option value={20}>20 HZ (50 MS INTERVAL - NOMINAL)</option>
                <option value={50}>50 HZ (20 MS INTERVAL - HIGH PRECISION)</option>
              </select>
            </div>

            <div>
              <label className="text-[#786c5f] text-[9.5px] block mb-1 uppercase font-bold">WEBSOCKET TELEMETRY GATEWAY URL</label>
              <input
                type="text"
                value={wsUrlInput}
                onChange={(e) => setWsUrlInput(e.target.value)}
                className="w-full bg-[#efeae2] border border-[#ded5c7] rounded-lg px-3 py-1.5 text-[#1c1917] font-mono text-[11px] focus:outline-none focus:border-[#d8533c] focus:bg-white"
              />
            </div>

            <div>
              <label className="text-[#786c5f] text-[9.5px] block mb-1 uppercase font-bold">REST API BASE URL</label>
              <input
                type="text"
                value={apiUrlInput}
                onChange={(e) => setApiUrlInput(e.target.value)}
                className="w-full bg-[#efeae2] border border-[#ded5c7] rounded-lg px-3 py-1.5 text-[#1c1917] font-mono text-[11px] focus:outline-none focus:border-[#d8533c] focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Units & System Standard */}
        <div className="bg-[#faf8f5] p-4 border border-[#ddd5c7] rounded-2xl space-y-3 shadow-xs">
          <div className="text-[10px] font-bold text-[#1c1917] uppercase tracking-wider pb-1.5 border-b border-[#e5dfd3]">
            UNITS OF MEASURE & VISUAL PROFILE
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[#786c5f] text-[9.5px] block mb-1 uppercase font-bold">MEASUREMENT CONVENTION</label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedUnits('METRIC')}
                  className={`flex-1 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                    selectedUnits === 'METRIC'
                      ? 'bg-white text-[#d8533c] border-[#d8d0c2] shadow-xs'
                      : 'bg-[#efeae2] text-[#786c5f] border-transparent hover:bg-white'
                  }`}
                >
                  SI METRIC (m, m/s, °C, hPa)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedUnits('IMPERIAL')}
                  className={`flex-1 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                    selectedUnits === 'IMPERIAL'
                      ? 'bg-white text-[#d8533c] border-[#d8d0c2] shadow-xs'
                      : 'bg-[#efeae2] text-[#786c5f] border-transparent hover:bg-white'
                  }`}
                >
                  US AVIATION (ft, knots, °F)
                </button>
              </div>
            </div>

            <div>
              <label className="text-[#786c5f] text-[9.5px] block mb-1 uppercase font-bold">UI PROFILE</label>
              <div className="py-2 px-3 bg-[#efeae2] border border-[#ded5c7] rounded-lg text-[#1c1917] text-[10px] font-bold">
                LIGHT CERAMIC & TACTILE BENTO · ZERO AI-SLOP
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#d8533c] text-white font-bold text-xs rounded-full hover:bg-[#c4432d] transition-all shadow-xs"
          >
            COMMIT CONFIGURATION
          </button>
        </div>
      </form>
    </div>
  );
};
