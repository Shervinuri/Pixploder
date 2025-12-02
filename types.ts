export interface MousePosition {
  x: number | null;
  y: number | null;
  radius: number;
}

export enum AppState {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  ERROR = 'ERROR'
}

export interface ProcessingError {
  message: string;
}
