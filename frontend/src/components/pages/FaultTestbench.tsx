import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { FaultType } from '../../types/simulation';

export const FaultTestbench: React.FC = () => {
  const { activeFaults, injectFault, clearFault, clearAllFaults } = useTelemetry();

  const faultCatalog: Array<{
    type: FaultType;
    name: string;
    subsystem: string;
    impact: string;
    expectedXgbDetection: string;
  }> = [
    {
      type: 'MOTOR_1_FAILURE',
      name: 'MOTOR 1 (FRONT-RIGHT) COMPLETE CUTOFF',
      subsystem: 'PROPULSION & ESC',
      impact: 'Zeroes M1 thrust, creates yaw/roll asymmetry, forces M2/M3/M4 to 95% compensation.',
      expectedXgbDetection: 'Propulsion anomaly score -> 0.94 (CRITICAL)',
    },
    {
      type: 'MOTOR_3_DEGRADATION',
      name: 'MOTOR 3 (REAR-RIGHT) THERMAL OVERHEAT & FLUTTER',
      subsystem: 'PROPULSION DYNAMICS',
      impact: 'Harmonic vibration spike to 6.2 mm/s and coil heating to 68.5°C.',
      expectedXgbDetection: 'Thermal & Propulsion warning -> 0.62 (WARNING)',
    },
    {
      type: 'BATTERY_SAG',
      name: 'BATTERY CELL 4 HIGH-IMPEDANCE VOLTAGE SAG',
      subsystem: 'POWER / SMART BMS',
      impact: 'Pack voltage drops to 20.8V under throttle, rapid SOC degradation.',
      expectedXgbDetection: 'Battery system anomaly -> 0.88 (CRITICAL)',
    },
    {
      type: 'GPS_SIGNAL_LOSS',
      name: 'GPS RECEIVER SATELLITE CONSTELLATION LOSS',
      subsystem: 'NAVIGATION & GNSS',
      impact: '0 Satellites tracked, HDOP jumps to 9.99, EKF transitions to dead reckoning.',
      expectedXgbDetection: 'Sensor integrity anomaly -> 0.95 (CRITICAL)',
    },
    {
      type: 'SEVERE_WIND_SHEAR',
      name: 'SEVERE 21.5 M/S ATMOSPHERIC CROSSWIND GUST',
      subsystem: 'AERODYNAMICS',
      impact: 'High roll torque disturbance, attitude compensation effort increases.',
      expectedXgbDetection: 'Aero & Vibration warning -> 0.74 (WARNING)',
    },
    {
      type: 'BAROMETER_DRIFT',
      name: 'STATIC PORT OBSTRUCTION DRIFT (+15M)',
      subsystem: 'ALTIMETRY SENSORS',
      impact: 'Discrepancy between barometric altitude and true simulation Z.',
      expectedXgbDetection: 'Sensor innovation residual warning -> 0.65 (WARNING)',
    },
    {
      type: 'IMU_SENSOR_NOISE',
      name: 'IMU SENSOR NOISE MULTIPLIER',
      subsystem: 'INERTIAL SENSORS',
      impact: 'Injects high-amplitude white noise into accelerometer and gyro channels.',
      expectedXgbDetection: 'Sensor noise anomaly -> 0.71 (WARNING)',
    },
    {
      type: 'ENGINE_OVERHEATING',
      name: 'ROTAX 914F THERMAL RUNAWAY (CHT > 135°C)',
      subsystem: 'COMBUSTION / COOLING',
      impact: 'Triggers CHT thermal runaway and coolant loop overheating beyond 115°C safety limit.',
      expectedXgbDetection: 'Thermodynamic Core anomaly -> 0.94 (CRITICAL)',
    },
    {
      type: 'OIL_PRESSURE_LOSS',
      name: 'LUBRICATION PUMP LOSS / PRESSURE DROP (< 1.5 BAR)',
      subsystem: 'LUBRICATION HYDRAULICS',
      impact: 'Simulates scavenge failure; oil pressure plunges below 1.5 bar with rapid bearing temperature rise.',
      expectedXgbDetection: 'Lubrication System anomaly -> 0.92 (CRITICAL)',
    },
    {
      type: 'VIBRATION_ANOMALY',
      name: 'CRANKSHAFT 1X-2X HARMONIC VIBRATION SPIKE (> 5.8 MM/S)',
      subsystem: 'MECHANICAL INTEGRITY',
      impact: 'Induces severe mechanical vibration anomaly across X/Y/Z tri-axial accelerometer.',
      expectedXgbDetection: 'Mechanical Vibration anomaly -> 0.78 (WARNING)',
    },
    {
      type: 'FUEL_SYSTEM_LEAK',
      name: 'FUEL RAIL PRESSURE DROP & LINE RUPTURE',
      subsystem: 'FUEL SYSTEM',
      impact: 'Rail pressure drops to 1.8 bar while fuel consumption rate spikes due to line rupture.',
      expectedXgbDetection: 'Fuel Injection anomaly -> 0.89 (CRITICAL)',
    },
    {
      type: 'TURBO_WASTEGATE_STUCK',
      name: 'TURBOCHARGER WASTEGATE ACTUATOR STUCK OPEN',
      subsystem: 'TURBO INDUCTION',
      impact: 'Loss of manifold boost pressure (MAP falls to ambient); unable to maintain climb/cruise power.',
      expectedXgbDetection: 'Turbo Induction anomaly -> 0.76 (WARNING)',
    },
    {
      type: 'CYLINDER_MISFIRE',
      name: 'CYLINDER 3 IGNITION MISFIRE / SPARK LOSS',
      subsystem: 'CDI IGNITION',
      impact: 'Dual CDI failure on cylinder 3; causes severe temperature drop on Cyl 3 and rotational speed flutter.',
      expectedXgbDetection: 'Combustion Misfire anomaly -> 0.75 (WARNING)',
    },
  ];

  const isFaultActive = (type: FaultType) => activeFaults.some((f) => f.type === type);

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1800px] mx-auto select-none font-mono">
      {/* Page Title */}
      <div className="flex items-center justify-between pb-3 border-b border-[#ddd5c7]">
        <div className="flex items-center space-x-2">
          <h1 className="text-sm font-bold text-[#1c1917] tracking-wide">
            Subsystem Fault Injection & Verification Testbench
          </h1>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <span>
            ACTIVE INJECTIONS: <strong className="text-[#1c1917]">{activeFaults.length}</strong>
          </span>
          {activeFaults.length > 0 && (
            <button
              onClick={clearAllFaults}
              className="text-[#dc2626] hover:underline uppercase font-bold"
            >
              [ RESET ALL ACTIVE FAULTS ]
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {faultCatalog.map((fault) => {
          const active = isFaultActive(fault.type);

          return (
            <div
              key={fault.type}
              className={`p-4 rounded-2xl border transition-all shadow-xs flex flex-col justify-between space-y-3 ${
                active
                  ? 'bg-[#fee2e2]/60 border-[#fca5a5]'
                  : 'bg-[#faf8f5] border-[#ddd5c7] hover:border-[#b8aca0]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between border-b border-[#e5dfd3] pb-2 text-[10px]">
                  <span className="font-bold text-[#786c5f]">{fault.subsystem}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                      active ? 'bg-[#dc2626] text-white' : 'bg-[#efeae2] text-[#5c544d]'
                    }`}
                  >
                    {active ? 'INJECTED / ARMED' : 'STANDBY'}
                  </span>
                </div>

                <div className="mt-2 font-bold text-[#1c1917] text-xs">
                  {fault.name}
                </div>

                <p className="text-[11px] text-[#5c544d] mt-1.5 leading-relaxed font-sans">
                  {fault.impact}
                </p>

                <div className="mt-2 text-[10px] text-[#786c5f] bg-[#efeae2]/70 p-2 rounded-xl border border-[#ded5c7]">
                  <strong className="text-[#1c1917]">EXPECTED ATTRIBUTION:</strong> {fault.expectedXgbDetection}
                </div>
              </div>

              <div className="pt-2 border-t border-[#e5dfd3] flex justify-end">
                {active ? (
                  <button
                    onClick={() => clearFault(fault.type)}
                    className="px-4 py-1.5 bg-[#dc2626] text-white rounded-full text-xs font-bold hover:bg-[#b91c1c] transition-all shadow-xs"
                  >
                    DISARM FAULT
                  </button>
                ) : (
                  <button
                    onClick={() => injectFault(fault.type, 1.0)}
                    className="px-4 py-1.5 bg-white text-[#1c1917] border border-[#ded5c7] rounded-full text-xs font-bold hover:bg-[#efeae2] transition-all shadow-xs"
                  >
                    INJECT FAULT
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
