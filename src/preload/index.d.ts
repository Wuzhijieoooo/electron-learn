import type { ElectronAPI } from '@electron-toolkit/preload';

export type WinState = 'min' | 'max' | 'fullScreen' | 'restore' | 'close';
export type UpdaterStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'not-available'
  | 'downloading'
  | 'downloaded'
  | 'error';

export interface UpdaterStatusPayload {
  status: UpdaterStatus;
  message: string;
  version?: string;
  progress?: number;
  bytesPerSecond?: number;
  transferred?: number;
  total?: number;
  releaseNotes?: string;
}

export interface CheckForUpdatesResult {
  ok: boolean;
  message: string;
  status: UpdaterStatus;
}

export interface RendererAPI {
  httpUtils: {
    get(path: string, ...params: unknown[]): void;
    post(path: string, ...params: unknown[]): void;
  };
  winApi: {
    send(type: string, action: WinState): void;
    getAppVersion(): Promise<string>;
    readFile(path: string): Promise<string>;
    readFileStream(path: string): Promise<string>;
    checkForUpdates(): Promise<CheckForUpdatesResult>;
    getUpdaterStatus(): Promise<UpdaterStatusPayload>;
    quitAndInstall(): void;
    onUpdaterStatus(listener: (payload: UpdaterStatusPayload) => void): () => void;
  };
}

declare global {
  interface Window {
    electron: ElectronAPI;
    api: RendererAPI;
  }
}
