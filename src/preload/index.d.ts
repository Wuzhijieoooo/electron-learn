import type { ElectronAPI } from '@electron-toolkit/preload';

export type WinState = 'min' | 'max' | 'fullScreen' | 'restore' | 'close';

export interface RendererAPI {
  httpUtils: {
    get(path: string, ...params: unknown[]): void;
    post(path: string, ...params: unknown[]): void;
  };
  winApi: {
    send(type: string, action: WinState): void;
    readFile(path: string): Promise<string>;
    readFileStream(path: string): Promise<string>;
  };
}

declare global {
  interface Window {
    electron: ElectronAPI;
    api: RendererAPI;
  }
}
