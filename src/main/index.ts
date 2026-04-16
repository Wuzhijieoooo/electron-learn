import {
  app,
  shell,
  BrowserWindow,
  ipcMain,
  IpcMainEvent,
  dialog,
  nativeTheme,
  Menu,
  // MenuItemConstructorOptions,
  Tray,
  // Notification,
  // NotificationConstructorOptions,
  BrowserWindowConstructorOptions,
  systemPreferences,
  nativeImage,
  globalShortcut,
  clipboard
} from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import type { WinState } from '../preload/index.d';
import { Theme } from '../renderer/src/views/ipc/type';
import { registerShortcuts, unregisterShortcuts } from './shortcut';
// import type { Theme } from '@renderer/views/ipc/type';
// function createAppMenu(): void {
//   const template: MenuItemConstructorOptions[] = [];

//   // macOS 应用菜单
//   if (process.platform === 'darwin') {
//     template.push({
//       label: app.name,
//       submenu: [
//         {
//           role: 'about'
//         },
//         {
//           type: 'separator'
//         },
//         {
//           role: 'services',
//           submenu: []
//         },
//         {
//           type: 'separator'
//         },
//         {
//           role: 'hide'
//         },
//         {
//           role: 'hideOthers'
//         },
//         {
//           role: 'unhide'
//         },
//         {
//           type: 'separator'
//         },
//         {
//           role: 'quit'
//         }
//       ]
//     });
//   }

//   // 菜单
//   template.push({
//     label: '可乐',
//     submenu: [
//       {
//         label: '可口'
//       },
//       {
//         label: '百事'
//       }
//     ]
//   });

//   const menu = Menu.buildFromTemplate(template);
//   Menu.setApplicationMenu(menu);
// }
let tray: Tray | null = null;
function createTray(): void {
  const iconPath = join(app.getAppPath(), 'src/main/assets/duckTemplate2.png');
  console.log('Tray icon path:', nativeImage.createFromPath(iconPath));
  tray = new Tray(nativeImage.createFromPath(iconPath));
  tray.setTitle('鸭子App');
  tray.setToolTip('这是鸭子app');
}

// function updateCheck(): void {
//   const options: NotificationConstructorOptions = {
//     icon: 'src/main/assets/duckTemplate.png',
//     title: '更新提示',
//     subtitle: '丑鸭子app版本1.2.1发布啦',
//     body: '本次更新包括系统通知',
//     actions: [
//       { type: 'button', text: 'Action 1' },
//       { type: 'button', text: 'Action 2' }
//     ],
//     hasReply: true
//   };
//   const notify = new Notification(options);
//   notify.show();
//   notify.on('click', () => console.log('you click duck notification'));
//   notify.on('reply', (e, reply) => console.log(`User replied: ${reply}`));
//   notify.on('action', (e) => {
//     console.log(`User triggered action at index: ${e.actionIndex}`);
//   });
// }

// 创建loading窗口
let loadingWin: BrowserWindow | null = null;
let mainWindow: BrowserWindow | null = null;

function loadRendererPage(win: BrowserWindow, page: string): Promise<void> {
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    const pageUrl = new URL(`${page}.html`, `${process.env['ELECTRON_RENDERER_URL']}/`).toString();
    return win.loadURL(pageUrl);
  }

  return win.loadFile(join(__dirname, `../renderer/${page}.html`));
}
function createWin(page: string, options: BrowserWindowConstructorOptions = {}): BrowserWindow {
  const windowOptions: BrowserWindowConstructorOptions = {
    width: 900,
    height: 600,
    show: false,
    autoHideMenuBar: false,
    frame: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      ...options.webPreferences
    },
    ...options
  };
  const win = new BrowserWindow(windowOptions);
  loadRendererPage(win, page);
  return win;
}
// function createLoadingWindow(): void {
//   loadingWin = new BrowserWindow({
//     width: 300,
//     height: 200,
//     frame: false,
//     resizable: false,
//     alwaysOnTop: true,
//     webPreferences: {
//       preload: join(__dirname, '../preload/index.js'),
//       sandbox: false
//     }
//   });
//   const currentLoadingWindow = loadingWin;
//   void loadRendererPage(currentLoadingWindow, 'loading');
// }

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: false,
    frame: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  });

  mainWindow.on('ready-to-show', () => {
    if (!loadingWin || loadingWin.isDestroyed()) {
      mainWindow?.show();
    }
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  const currentMainWindow = mainWindow;
  void loadRendererPage(currentMainWindow, 'index');
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // IPC test
  ipcMain.on('ping', () => console.log('pong'));

  // createAppMenu();
  createTray();
  // createLoadingWindow();
  createWindow();
  // updateCheck();
  registerShortcuts();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  unregisterShortcuts();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on('set-title', (_e: IpcMainEvent, title: string) => {
  BrowserWindow.getFocusedWindow()?.setTitle(title);
});
ipcMain.on('set-state', (_e: IpcMainEvent, action: WinState): void => {
  const win = BrowserWindow.getFocusedWindow();
  switch (action) {
    case 'min':
      win?.minimize();
      break;
    case 'max':
      win?.maximize();
      break;
    case 'fullScreen': {
      const isFullScreen = win?.isFullScreen();
      win?.setFullScreen(!isFullScreen);
      break;
    }
    case 'restore': {
      win?.unmaximize();
      break;
    }
    case 'close':
      win?.close();
  }
});

ipcMain.handle('openDialog', async () => {
  const { filePaths, canceled } = await dialog.showOpenDialog({
    properties: ['openFile']
  });
  if (canceled) return;
  return filePaths;
});
ipcMain.handle('toggleTheme', (_e, theme: Theme) => {
  console.log(theme);
  nativeTheme.themeSource = theme;
});

ipcMain.on('contextMenu', (e, template = []) => {
  const menu = Menu.buildFromTemplate([
    ...template,
    {
      label: '刷新'
    }
  ]);
  console.log(e.sender);
  const win = BrowserWindow.fromWebContents(e.sender) || undefined;
  menu.popup({
    window: win
  });
});

ipcMain.handle('electron:messageBox', (e, options) => {
  const win = BrowserWindow.fromWebContents(e.sender);
  return dialog.showMessageBox(win!, options);
});

ipcMain.handle('electron:errorMessageBox', (_e, title, content) => {
  return dialog.showErrorBox(title, content);
});

ipcMain.handle('electron:showOpenDialog', (e, options) => {
  const win = BrowserWindow.fromWebContents(e.sender);
  return dialog.showOpenDialog(win!, options);
});

ipcMain.on('loadingEnd', () => {
  if (loadingWin && !loadingWin.isDestroyed()) {
    loadingWin.close();
    loadingWin = null;
  }

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.show();
  }
});

ipcMain.on('openChildWin', (e, { page, options }) => {
  const parent = BrowserWindow.fromWebContents(e.sender);
  options.parent = parent;
  createWin(page, options);
});
let captureWin: BrowserWindow | null = null;
async function createCaptureWin(): Promise<void> {
  const { screen, desktopCapturer } = await import('electron');
  const {
    bounds: { width, height },
    scaleFactor
  } = screen.getPrimaryDisplay();
  try {
    if (process.platform === 'darwin') {
      const accessStatus = systemPreferences.getMediaAccessStatus('screen');
      if (accessStatus !== 'granted') {
        await dialog.showMessageBox({
          type: 'warning',
          title: '缺少屏幕录制权限',
          message: '当前没有屏幕录制权限，无法获取截图源。',
          detail:
            '请前往“系统设置 > 隐私与安全性 > 屏幕录制”，勾选当前应用或启动它的终端/IDE，然后完全重启应用。'
        });
        return;
      }
    }

    const sources = await desktopCapturer.getSources({
      types: ['screen', 'window'],
      thumbnailSize: { width: width * scaleFactor, height: height * scaleFactor }
    });
    const base64 = sources[0].thumbnail.toDataURL();
    captureWin = createWin('capture', {
      fullscreen: true,
      transparent: true,
      frame: false,
      skipTaskbar: true,
      autoHideMenuBar: true,
      movable: false,
      resizable: false,
      enableLargerThanScreen: true,
      hasShadow: false
    });
    captureWin.on('show', () => {
      captureWin?.webContents.send('captureBase64', base64);
      globalShortcut.register('Esc', () => {
        captureWin?.close();
      });
    });
    captureWin.on('closed', () => {
      // mainWindow?.show();
      globalShortcut.unregister('Esc');
    });
  } catch (error) {
    console.error('desktopCapturer.getSources failed:', error);
    await dialog.showMessageBox({
      type: 'error',
      title: '获取截图源失败',
      message: 'desktopCapturer.getSources 调用失败。',
      detail: error instanceof Error ? error.message : String(error)
    });
    return;
  }
}
ipcMain.on('win:capture', async () => {
  // mainWindow?.hide();
  createCaptureWin();
});
ipcMain.on('capture:save', (_e, base64) => {
  const img = nativeImage.createFromDataURL(base64);
  clipboard.writeImage(img);
});
