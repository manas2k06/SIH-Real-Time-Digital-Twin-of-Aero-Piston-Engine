// Global Application and Custom Domain Configuration

export interface AppConfig {
  droneId: string;
  projectName: string;
  version: string;
  telemetrySource: 'SIMULATION' | 'WEBSOCKET' | 'REST';
  apiBaseUrl: string;
  wsBaseUrl: string;
  defaultUpdateHz: number;
  environment: 'development' | 'production' | 'staging';
  enableFaultInjection: boolean;
  baseCoordinates: {
    lat: number;
    lng: number;
    altMsl: number;
  };
}

export const APP_CONFIG: AppConfig = {
  droneId: import.meta.env.VITE_DRONE_ID || 'MALE-UAV-01',
  projectName: 'AEROTWIN AI',
  version: '2.5.0-AEROPİSTON',
  telemetrySource: (import.meta.env.VITE_TELEMETRY_SOURCE as 'SIMULATION' | 'WEBSOCKET' | 'REST') || 'SIMULATION',
  apiBaseUrl: import.meta.env.VITE_API_URL || 'https://api.aerotwin.local/v1',
  wsBaseUrl: import.meta.env.VITE_WS_URL || 'wss://telemetry.aerotwin.local/stream',
  defaultUpdateHz: 20,
  environment: (import.meta.env.MODE as 'development' | 'production' | 'staging') || 'development',
  enableFaultInjection: true,
  baseCoordinates: {
    lat: 37.774929,
    lng: -122.419416,
    altMsl: 100.0,
  },
};
