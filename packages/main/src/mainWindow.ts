import {app, BrowserWindow, session} from 'electron';
import {join, resolve, dirname} from 'node:path';
import {fork} from 'node:child_process';
import prepareDb from './prisma/prepareDb';

async function createWindow() {
  await prepareDb();

  const browserWindow = new BrowserWindow({
    show: false, // Use the 'ready-to-show' event to show the instantiated BrowserWindow.
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false, // Sandbox disabled because the demo of preload script depend on the Node.js api
      webviewTag: false, // The webview tag is not recommended. Consider alternatives like an iframe or Electron's BrowserView. @see https://www.electronjs.org/docs/latest/api/webview-tag#warning
      preload: join(app.getAppPath(), 'packages/preload/dist/index.cjs'),
    },
  });

  /**
   * If the 'show' property of the BrowserWindow's constructor is omitted from the initialization options,
   * it then defaults to 'true'. This can cause flickering as the window loads the html content,
   * and it also has show problematic behaviour with the closing of the window.
   * Use `show: false` and listen to the  `ready-to-show` event to show the window.
   *
   * @see https://github.com/electron/electron/issues/25012 for the afford mentioned issue.
   */
  browserWindow.on('ready-to-show', () => {
    browserWindow?.show();

    if (import.meta.env.DEV) {
      browserWindow?.webContents.openDevTools();
    }
  });

  /**
   * Load the main page of the main window.
   */
  if (import.meta.env.DEV && import.meta.env.VITE_DEV_SERVER_URL !== undefined) {
    /**
     * Load from the Vite dev server for development.
     */
    // await browserWindow.loadURL(import.meta.env.VITE_DEV_SERVER_URL);

    const url = 'http://localhost:3000';

    // Set cookie during development so the server can know whether it is
    // serving a browser client or electron client. This is used during
    // development so we can develop for both environments at the same time with
    // a single Next server. If this becomes too hard to manage, we can always
    // change it such that you have to pick which one you want to develop for
    // when you start the server.
    const cookie = {url, name: 'electron-development', value: 'electron-development'};
    await session.defaultSession.cookies.set(cookie);

    await browserWindow.loadURL(url);
  } else {
    const volumePath = join(app.getPath('userData'), 'volume', 'app.db');
    // export const dbPath = path.join(app.getPath('userData'), 'volume', 'app.db');

    // console.log('appPath');
    // console.log(app.getAppPath());
    const appPathDirName = dirname(app.getAppPath());
    // console.log('appPathDirName');
    // console.log(appPathDirName);
    // console.log('');

    // const childProc = fork('server.js', [], {
    // eslint-disable-next-line
    if (false) {
      fork('server.js', [], {
        cwd: join(appPathDirName, 'standalone-website/website'),
        env: {
          ...process.env,
          IS_ELECTRON: 'true',
          VOLUME_PATH: volumePath,
        },
      });
    }

    // childProc.on('message', function (message) {
    //   console.log('Message from Child process : ' + message);
    // });

    /**
     * Load from the local file system for production and test.
     *
     * Use BrowserWindow.loadFile() instead of BrowserWindow.loadURL() for WhatWG URL API limitations
     * when path contains special characters like `#`.
     * Let electron handle the path quirks.
     * @see https://github.com/nodejs/node/issues/12682
     * @see https://github.com/electron/electron/issues/6869
     */
    await browserWindow.loadFile(resolve(__dirname, '../../renderer/dist/index.html'));
  }

  return browserWindow;
}

/**
 * Restore an existing BrowserWindow or Create a new BrowserWindow.
 */
export async function restoreOrCreateWindow() {
  let window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());

  if (window === undefined) {
    window = await createWindow();
  }

  if (window.isMinimized()) {
    window.restore();
  }

  window.focus();
}
