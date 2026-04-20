import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import { autoUpdater, type ProgressInfo, type UpdateInfo } from 'electron-updater';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

type UpdaterStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'not-available'
  | 'downloading'
  | 'downloaded'
  | 'error';

interface UpdaterStatusPayload {
  status: UpdaterStatus;
  message: string;
  version?: string;
  progress?: number;
  bytesPerSecond?: number;
  transferred?: number;
  total?: number;
  releaseNotes?: string;
}

interface CheckForUpdatesResult {
  ok: boolean;
  message: string;
  status: UpdaterStatus;
}

interface SetupAutoUpdaterOptions {
  getMainWindow: () => BrowserWindow | null;
  checkIntervalMs?: number;
}

const UPDATER_STATUS_EVENT = 'updater:status';
const DEFAULT_CHECK_INTERVAL_MS = 30 * 60 * 1000;

let isInitialized = false;
let isChecking = false;
let latestStatus: UpdaterStatusPayload = {
  status: 'idle',
  message: '尚未检查更新'
};

function publishStatus(
  payload: UpdaterStatusPayload,
  getMainWindow: SetupAutoUpdaterOptions['getMainWindow']
): void {
  latestStatus = payload;
  const win = getMainWindow();
  if (!win || win.isDestroyed()) return;
  win.webContents.send(UPDATER_STATUS_EVENT, payload);
}

function normalizeReleaseNotes(info: UpdateInfo): string {
  if (!info.releaseNotes) return '';

  if (typeof info.releaseNotes === 'string') return info.releaseNotes;

  return info.releaseNotes
    .map((item) => (typeof item === 'string' ? item : item.note))
    .filter(Boolean)
    .join('\n');
}

async function promptInstallNow(
  info: UpdateInfo,
  getMainWindow: SetupAutoUpdaterOptions['getMainWindow']
): Promise<void> {
  const options = {
    type: 'info' as const,
    title: '发现新版本',
    message: `新版本 ${info.version} 已下载完成`,
    detail: '现在重启将自动安装更新。',
    buttons: ['立即重启', '稍后'],
    cancelId: 1,
    defaultId: 0
  };
  const win = getMainWindow();
  const result =
    win && !win.isDestroyed()
      ? await dialog.showMessageBox(win, options)
      : await dialog.showMessageBox(options);

  if (result.response === 0) {
    autoUpdater.quitAndInstall();
  }
}

function getDevAppUpdateConfigPath(): string {
  return join(app.getAppPath(), 'dev-app-update.yml');
}

async function checkForUpdatesSafely(
  getMainWindow: SetupAutoUpdaterOptions['getMainWindow']
): Promise<CheckForUpdatesResult> {
  if (isChecking) {
    return {
      ok: false,
      status: latestStatus.status,
      message: '正在检查更新，请稍后再试'
    };
  }

  if (!app.isPackaged && !existsSync(getDevAppUpdateConfigPath())) {
    const message = '开发环境缺少 dev-app-update.yml，跳过更新检查';
    publishStatus({ status: 'idle', message }, getMainWindow);
    return { ok: false, status: 'idle', message };
  }

  try {
    isChecking = true;
    await autoUpdater.checkForUpdates();
    return { ok: true, status: 'checking', message: '已触发更新检查' };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    publishStatus(
      {
        status: 'error',
        message: `更新检查失败：${message}`
      },
      getMainWindow
    );
    return { ok: false, status: 'error', message };
  } finally {
    isChecking = false;
  }
}

export function setupAutoUpdater(options: SetupAutoUpdaterOptions): void {
  if (isInitialized) return;
  isInitialized = true;

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  if (!app.isPackaged) {
    autoUpdater.forceDevUpdateConfig = true;
  }

  const customFeedUrl = process.env.AUTO_UPDATE_URL?.trim();
  if (customFeedUrl) {
    autoUpdater.setFeedURL({
      provider: 'generic',
      url: customFeedUrl
    });
  }

  autoUpdater.on('checking-for-update', () => {
    publishStatus(
      {
        status: 'checking',
        message: '正在检查新版本...'
      },
      options.getMainWindow
    );
  });

  autoUpdater.on('update-available', (info) => {
    publishStatus(
      {
        status: 'available',
        message: `发现新版本 ${info.version}，开始下载增量包...`,
        version: info.version,
        releaseNotes: normalizeReleaseNotes(info)
      },
      options.getMainWindow
    );
  });

  autoUpdater.on('update-not-available', (info) => {
    publishStatus(
      {
        status: 'not-available',
        message: `当前已是最新版本 ${info.version}`,
        version: info.version
      },
      options.getMainWindow
    );
  });

  autoUpdater.on('download-progress', (progress: ProgressInfo) => {
    publishStatus(
      {
        status: 'downloading',
        message: `更新下载中 ${progress.percent.toFixed(1)}%`,
        progress: progress.percent,
        bytesPerSecond: progress.bytesPerSecond,
        transferred: progress.transferred,
        total: progress.total
      },
      options.getMainWindow
    );
  });

  autoUpdater.on('update-downloaded', (info) => {
    publishStatus(
      {
        status: 'downloaded',
        message: `新版本 ${info.version} 已下载完成`,
        version: info.version,
        releaseNotes: normalizeReleaseNotes(info)
      },
      options.getMainWindow
    );
    void promptInstallNow(info, options.getMainWindow);
  });

  autoUpdater.on('error', (error) => {
    const message = error?.message ?? '未知错误';
    publishStatus(
      {
        status: 'error',
        message: `自动更新失败：${message}`
      },
      options.getMainWindow
    );
  });

  ipcMain.handle('updater:check-for-updates', async () => {
    return await checkForUpdatesSafely(options.getMainWindow);
  });

  ipcMain.handle('updater:get-status', () => {
    return latestStatus;
  });

  ipcMain.on('updater:quit-and-install', () => {
    autoUpdater.quitAndInstall();
  });

  setTimeout(() => {
    void checkForUpdatesSafely(options.getMainWindow);
  }, 5_000);

  const timer = setInterval(() => {
    void checkForUpdatesSafely(options.getMainWindow);
  }, options.checkIntervalMs ?? DEFAULT_CHECK_INTERVAL_MS);
  timer.unref();
}
