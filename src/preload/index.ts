import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import type { RendererAPI } from './index.d';
import fsp from 'fs/promises';
import fs from 'fs';
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
      return new Promise((resolve) => {
        const stream = fs.createReadStream(path, 'utf-8');
        let data = '';
        stream.on('data', (chunk) => {
          data += chunk;
        });

        stream.on('end', () => {
          resolve(data);
        });
      });
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
