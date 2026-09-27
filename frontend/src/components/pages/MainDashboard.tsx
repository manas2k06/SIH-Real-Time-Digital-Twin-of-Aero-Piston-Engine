import React, { useState } from 'react';
import { DigitalTwinView } from '../digital-twin/DigitalTwinView';
import { PositionTelemetryCard } from '../dashboard/PositionTelemetryCard';
import { AttitudeMotionCard } from '../dashboard/AttitudeMotionCard';
import { BatteryCard } from '../dashboard/BatteryCard';
import { PropulsionCard } from '../dashboard/PropulsionCard';
import { FlightControlCard } from '../dashboard/FlightControlCard';
import { MissionCard } from '../dashboard/MissionCard';
import { FlightPathMap } from '../dashboard/FlightPathMap';
import { EnvironmentCard } from '../dashboard/EnvironmentCard';
import { TelemetryCharts } from '../dashboard/TelemetryCharts';
import { AIPredictionCard } from '../dashboard/AIPredictionCard';
import { AlertEventLog } from '../dashboard/AlertEventLog';
import { SyncStatusCard } from '../dashboard/SyncStatusCard';
import { SimulationControls } from '../dashboard/SimulationControls';
import { RemainingUsefulLifeCard } from '../dashboard/RemainingUsefulLifeCard';

export const MainDashboard: React.FC = () => {
  const [is3DExpanded, setIs3DExpanded] = useState<boolean>(false);

  return (
    <div className="p-3 sm:p-5 space-y-4 max-w-[1800px] mx-auto select-none">
      {/* Bento Spotlight Banner (Exact Image 2 Reference) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl overflow-hidden border border-sky-600/40 shadow-xs bg-slate-950 flex-shrink-0 flex items-center justify-center">
            <img 
              src="/assets/drone-specimen.jpg" 
              alt="MALE-UAV Specimen" 
              className="w-full h-full object-contain p-0.5"
            />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-display font-extrabold text-base text-[#0c1524]">
                AEROTWIN AI · ROTAX 914F DIGITAL TWIN
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-mono font-extrabold border border-sky-300">
                SIH26054 COCKPIT
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5 font-bold">
              Real-Time MALE-UAV Aero-Piston Telemetry & Prognostics · 20 Hz Synchronized
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-600 font-bold hidden sm:inline">
            Press <strong className="text-sky-700 font-bold">[F0]</strong> for Main Engine Studio
          </span>
        </div>
      </div>

      {/* Asymmetric 2-Column GCS Console Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* ======================================================== */}
        {/* LEFT / CENTER: Primary Flight Canvas & Avionics (~67%)  */}
        {/* ======================================================== */}
        <div className={`flex flex-col gap-4 ${is3DExpanded ? 'lg:col-span-12' : 'lg:col-span-8'}`}>
          {/* 1. Dominant Primary Flight Display (PFD) 3D Twin Viewport */}
          <div>
            <DigitalTwinView
              isExpanded={is3DExpanded}
              onToggleExpand={() => setIs3DExpanded(!is3DExpanded)}
            />
          </div>

          {!is3DExpanded && (
            <>
              {/* 2. Tactical Situation Radar & Closed-Loop Flight Control Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 2A. 2D Tactical Situation Radar */}
                <div className="flex flex-col gap-4">
                  <FlightPathMap />
                  <PositionTelemetryCard />
                </div>

                {/* 2B. Flight Control Computer & Inertial Dynamics */}
                <div className="flex flex-col gap-4">
                  <FlightControlCard />
                  <AttitudeMotionCard />
                </div>
              </div>

              {/* 3. Real-Time Oscillograms (4-Channel Telemetry Stream) */}
              <div>
                <TelemetryCharts />
              </div>

              {/* 4. AI Predictive Inference & Anomaly Classifier */}
              <div>
                <AIPredictionCard />
              </div>

              {/* 5. Simulation Bench & Kinematics Control Console */}
              <div>
                <SimulationControls />
              </div>

              {/* 6. Chronological Flight Recorder Log */}
              <div>
                <AlertEventLog />
              </div>
            </>
          )}
        </div>

        {/* ======================================================== */}
        {/* RIGHT: Airworthiness & Prognostics Rack (~33% Sidebar)  */}
        {/* ======================================================== */}
        {!is3DExpanded && (
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* 1. Dedicated Remaining Useful Life (RUL) & Prognostics */}
            <RemainingUsefulLifeCard />

            {/* 2. Propulsion & Motor Bus (2x2 Quadrotor Airframe Layout) */}
            <PropulsionCard />

            {/* 3. Power Bus (6S LiPo BMS) */}
            <BatteryCard />

            {/* 4. Atmospheric Environment (Wind Azimuth Rose & Density) */}
            <EnvironmentCard />

            {/* 5. Mission Route Manifest & Datalink Synchronization */}
            <MissionCard />
            <SyncStatusCard />
          </div>
        )}
      </div>
    </div>
  );
};
