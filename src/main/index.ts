import {
  app,
  shell,
  BrowserWindow,
  ipcMain,
  IpcMainEvent,
  dialog,
  nativeTheme,
  Menu,
  MenuItemConstructorOptions,
  Tray,
  Notification,
  NotificationConstructorOptions,
  BaseWindow
} from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import type { WinState } from '../preload/index.d';
import { Theme } from '../renderer/src/views/ipc/type';
import { registerShortcuts, unregisterShortcuts } from './shortcut';
// import type { Theme } from '@renderer/views/ipc/type';
function createAppMenu(): void {
  const template: MenuItemConstructorOptions[] = [];

  // macOS 应用菜单
  if (process.platform === 'darwin') {
    template.push({
      label: app.name,
      submenu: [
        {
          role: 'about'
        },
        {
          type: 'separator'
        },
        {
          role: 'services',
          submenu: []
        },
        {
          type: 'separator'
        },
        {
          role: 'hide'
        },
        {
          role: 'hideOthers'
        },
        {
          role: 'unhide'
        },
        {
          type: 'separator'
        },
        {
          role: 'quit'
        }
      ]
    });
  }

  // 菜单
  template.push({
    label: '可乐',
    submenu: [
      {
        label: '可口'
      },
      {
        label: '百事'
      }
    ]
  });

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
let tray;
function createTray(): void {
  const iconPath = join(app.getAppPath(), 'src/main/assets/duckTemplate.png');
  console.log('Tray icon path:', iconPath);
  tray = new Tray(iconPath);
  tray.setTitle('鸭子App');
  tray.setToolTip('这是鸭子app');
}

function updateCheck(): void {
  const options: NotificationConstructorOptions = {
    icon: 'src/main/assets/duckTemplate.png',
    title: '更新提示',
    subtitle: '丑鸭子app版本1.2.1发布啦',
    body: '本次更新包括系统通知',
    actions: [
      { type: 'button', text: 'Action 1' },
      { type: 'button', text: 'Action 2' }
    ],
    hasReply: true
  };
  const notify = new Notification(options);
  notify.show();
  notify.on('click', () => console.log('you click duck notification'));
  notify.on('reply', (e, reply) => console.log(`User replied: ${reply}`));
  notify.on('action', (e) => {
    console.log(`User triggered action at index: ${e.actionIndex}`);
  });
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
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
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
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

ipcMain.on('set-title', (e: IpcMainEvent, title: string) => {
  BrowserWindow.getFocusedWindow()?.setTitle(title);
});
ipcMain.on('set-state', (e, action: WinState): void => {
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
ipcMain.handle('toggleTheme', (e, theme: Theme) => {
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

ipcMain.handle('electron:errorMessageBox', (e, title, content) => {
  return dialog.showErrorBox(title, content);
});

ipcMain.handle('electron:showOpenDialog', (e, options) => {
  const win = BrowserWindow.fromWebContents(e.sender);
  return dialog.showOpenDialog(win!, options);
});
