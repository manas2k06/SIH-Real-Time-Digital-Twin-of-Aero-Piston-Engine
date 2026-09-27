import { DroneTelemetryData } from '../types/telemetry';
import { ActiveFault, EventLogEntry, SyncStatus } from '../types/simulation';
import { AIPredictionState } from '../types/prediction';
import { simulationEngine } from './simulationEngine';
import { computeAIPredictions } from './aiPredictor';
import { APP_CONFIG } from './config';

export type TelemetryListener = (payload: {
  telemetry: DroneTelemetryData;
  predictions: AIPredictionState;
  activeFaults: ActiveFault[];
  eventLogs: EventLogEntry[];
  syncStatus: SyncStatus;
}) => void;

class TelemetryStreamService {
  private listeners: Set<TelemetryListener> = new Set();
  private ws: WebSocket | null = null;
  private currentMode: 'SIMULATION' | 'WEBSOCKET' | 'REST' = APP_CONFIG.telemetrySource;
  private unsubscribeEngine: (() => void) | null = null;

  constructor() {
    this.initMode(this.currentMode);
  }

  public setMode(mode: 'SIMULATION' | 'WEBSOCKET' | 'REST') {
    if (this.currentMode === mode) return;
    this.currentMode = mode;
    this.cleanup();
    this.initMode(mode);
  }

  public getMode() {
    return this.currentMode;
  }

  private initMode(mode: 'SIMULATION' | 'WEBSOCKET' | 'REST') {
    if (mode === 'SIMULATION') {
      this.unsubscribeEngine = simulationEngine.subscribe((telemetry, faults, logs, sync) => {
        const predictions = computeAIPredictions(telemetry, faults);
        this.emit({
          telemetry,
          predictions,
          activeFaults: faults,
          eventLogs: logs,
          syncStatus: sync,
        });
      });
    } else if (mode === 'WEBSOCKET') {
      this.connectWebSocket();
    }
  }

  private connectWebSocket() {
    try {
      this.ws = new WebSocket(APP_CONFIG.wsBaseUrl);
      this.ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          this.emit(payload);
        } catch {
          // Parse error fallback
        }
      };
      this.ws.onerror = () => {
        // Fallback or reconnect
      };
    } catch {
      // WS connection fallback
    }
  }

  private cleanup() {
    if (this.unsubscribeEngine) {
      this.unsubscribeEngine();
      this.unsubscribeEngine = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  public subscribe(listener: TelemetryListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(payload: {
    telemetry: DroneTelemetryData;
    predictions: AIPredictionState;
    activeFaults: ActiveFault[];
    eventLogs: EventLogEntry[];
    syncStatus: SyncStatus;
  }) {
    for (const listener of this.listeners) {
      listener(payload);
    }
  }
}

export const telemetryStreamService = new TelemetryStreamService();
