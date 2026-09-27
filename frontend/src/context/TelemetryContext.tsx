import React, { createContext, useContext, useEffect, useState } from 'react';
import { DroneTelemetryData } from '../types/telemetry';
import { AIPredictionState } from '../types/prediction';
import { ActiveFault, EventLogEntry, SyncStatus, FaultType } from '../types/simulation';
import { telemetryStreamService } from '../services/telemetryStream';
import { simulationEngine } from '../services/simulationEngine';

interface TelemetryContextType {
  telemetry: DroneTelemetryData | null;
  predictions: AIPredictionState | null;
  activeFaults: ActiveFault[];
  eventLogs: EventLogEntry[];
  syncStatus: SyncStatus | null;
  
  // Simulation control handles
  isRunning: boolean;
  simSpeed: 0.5 | 1 | 2 | 5;
  startSimulation: () => void;
  pauseSimulation: () => void;
  resetSimulation: () => void;
  setSimulationSpeed: (speed: 0.5 | 1 | 2 | 5) => void;
  setWind: (speed: number, dir: number) => void;
  injectFault: (type: FaultType, severity?: number) => void;
  clearFault: (type: FaultType) => void;
  clearAllFaults: () => void;
  
  // Telemetry Source
  telemetrySource: 'SIMULATION' | 'WEBSOCKET' | 'REST';
  setTelemetrySource: (source: 'SIMULATION' | 'WEBSOCKET' | 'REST') => void;
  setThrottle: (pct: number) => void;
}

const TelemetryContext = createContext<TelemetryContextType | null>(null);

export const TelemetryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [telemetry, setTelemetry] = useState<DroneTelemetryData | null>(null);
  const [predictions, setPredictions] = useState<AIPredictionState | null>(null);
  const [activeFaults, setActiveFaults] = useState<ActiveFault[]>([]);
  const [eventLogs, setEventLogs] = useState<EventLogEntry[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [simSpeed, setSimSpeedState] = useState<0.5 | 1 | 2 | 5>(1);
  const [telemetrySource, setTelemetrySourceState] = useState<'SIMULATION' | 'WEBSOCKET' | 'REST'>(
    telemetryStreamService.getMode()
  );

  useEffect(() => {
    const unsubscribe = telemetryStreamService.subscribe((payload) => {
      setTelemetry(payload.telemetry);
      setPredictions(payload.predictions);
      setActiveFaults(payload.activeFaults);
      setEventLogs(payload.eventLogs);
      setSyncStatus(payload.syncStatus);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const startSimulation = () => {
    simulationEngine.start();
    setIsRunning(true);
  };

  const pauseSimulation = () => {
    simulationEngine.pause();
    setIsRunning(false);
  };

  const resetSimulation = () => {
    simulationEngine.reset();
  };

  const setSimulationSpeed = (speed: 0.5 | 1 | 2 | 5) => {
    simulationEngine.setSpeed(speed);
    setSimSpeedState(speed);
  };

  const setWind = (speed: number, dir: number) => {
    simulationEngine.setWind(speed, dir);
  };

  const injectFault = (type: FaultType, severity: number = 1.0) => {
    simulationEngine.injectFault(type, severity);
  };

  const clearFault = (type: FaultType) => {
    simulationEngine.clearFault(type);
  };

  const clearAllFaults = () => {
    simulationEngine.clearAllFaults();
  };

  const setTelemetrySource = (source: 'SIMULATION' | 'WEBSOCKET' | 'REST') => {
    telemetryStreamService.setMode(source);
    setTelemetrySourceState(source);
  };

  const setThrottle = (pct: number) => {
    simulationEngine.setThrottle(pct);
  };

  return (
    <TelemetryContext.Provider
      value={{
        telemetry,
        predictions,
        activeFaults,
        eventLogs,
        syncStatus,
        isRunning,
        simSpeed,
        startSimulation,
        pauseSimulation,
        resetSimulation,
        setSimulationSpeed,
        setWind,
        injectFault,
        clearFault,
        clearAllFaults,
        telemetrySource,
        setTelemetrySource,
        setThrottle,
      }}
    >
      {children}
    </TelemetryContext.Provider>
  );
};

export const useTelemetry = () => {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error('useTelemetry must be used within a TelemetryProvider');
  }
  return context;
};
