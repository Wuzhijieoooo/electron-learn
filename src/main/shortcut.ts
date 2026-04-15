import { BrowserWindow, globalShortcut, Notification } from 'electron';

export function registerShortcuts(): void {
  globalShortcut.register('CommandOrControl+y', () => {
    const notify = new Notification({
      title: '可以拖拽'
    });
    notify.show();
    BrowserWindow.getFocusedWindow()?.setMovable(true);
  });
  globalShortcut.register('CommandOrControl+n', () => {
    const notify = new Notification({
      title: '禁止拖拽'
    });
    notify.show();
    BrowserWindow.getFocusedWindow()?.setMovable(false);
  });
  console.log(123, globalShortcut.isRegistered('CommandOrControl+y'));
}

export function unregisterShortcuts(): void {
  globalShortcut.unregister('CommandOrControl+y');
  globalShortcut.unregister('CommandOrControl+n');
}

export function unregisterAllShortcuts(): void {
  globalShortcut.unregisterAll();
}
