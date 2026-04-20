import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import type { CheckForUpdatesResult, RendererAPI, UpdaterStatusPayload } from './index.d';
import fsp from 'fs/promises';
import fs from 'fs';

const UPDATER_STATUS_EVENT = 'updater:status';

// Custom APIs for renderer
const api: RendererAPI = {
  httpUtils: {
    get(path, ...params) {
      console.log('get', path, params);
    },
    post(path: string, ...params: unknown[]) {
      console.log('post', path, params);
    }
  },
  winApi: {
    send(type, action) {
      ipcRenderer.send(type, action);
    },
    async readFile(path) {
      return await fsp.readFile(path, 'utf-8');
    },
    readFileStream(path) {
      return new Promise((resolve, reject) => {
        const stream = fs.createReadStream(path, 'utf-8');
        let data = '';
        stream.on('data', (chunk) => {
          data += chunk;
        });

        stream.on('end', () => {
          resolve(data);
        });
        stream.on('error', (error) => {
          reject(error);
        });
      });
    },
    checkForUpdates() {
      return ipcRenderer.invoke('updater:check-for-updates') as Promise<CheckForUpdatesResult>;
    },
    getUpdaterStatus() {
      return ipcRenderer.invoke('updater:get-status') as Promise<UpdaterStatusPayload>;
    },
    quitAndInstall() {
      ipcRenderer.send('updater:quit-and-install');
    },
    onUpdaterStatus(listener) {
      const wrapped = (_event: IpcRendererEvent, payload: UpdaterStatusPayload): void => {
        listener(payload);
      };
      ipcRenderer.on(UPDATER_STATUS_EVENT, wrapped);
      return () => {
        ipcRenderer.removeListener(UPDATER_STATUS_EVENT, wrapped);
      };
    }
  }
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
