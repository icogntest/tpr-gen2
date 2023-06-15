// `import.meta.env` provided by Vite. Set to `process.env.NODE_ENV` since we
// expect it to be there.
process.env.NODE_ENV = import.meta.env.MODE;
console.log(`process.env.NODE_ENV:${process.env.NODE_ENV}`);

import {app} from 'electron';
import './security-restrictions';
import {restoreOrCreateWindow} from '/@/mainWindow';
import {platform} from 'node:process';
import fs from 'node:fs';
import path from 'node:path';
import forkWebsiteProcess from './forkWebsiteProcess';
import processManager from './processManager';
import prepareDb from './prisma/prepareDb';

const volumePath = path.join(app.getPath('userData'), 'volume');
console.log(`volumePath:${volumePath}`);

if (!fs.existsSync(volumePath)) {
  fs.mkdirSync(volumePath);
}

/**
 * Prevent electron from running multiple instances.
 */
const isSingleInstance = app.requestSingleInstanceLock();
console.log(`isSingleInstance:${isSingleInstance}`);

if (!isSingleInstance) {
  app.quit();
  process.exit(0);
}
app.on('second-instance', restoreOrCreateWindow);

/**
 * Disable Hardware Acceleration to save more system resources.
 */
app.disableHardwareAcceleration();

/**
 * Shout down background process if all windows was closed
 */
app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    processManager.killAll();
    app.quit();
  }
});

/**
 * @see https://www.electronjs.org/docs/latest/api/app#event-activate-macos Event: 'activate'.
 */
app.on('activate', restoreOrCreateWindow);

async function onAppReady() {
  await prepareDb();

  // Remove once forks are working for testing.
  // eslint-disable-next-line
  if (false) {
    // TODO: maybe show a loading window if actually need to run migrations?
    forkWebsiteProcess();
  }

  restoreOrCreateWindow();
}

/**
 * Create the application window when the background process is ready.
 */
app
  .whenReady()
  // .then(restoreOrCreateWindow)
  .then(onAppReady)
  .catch(e => console.error('Failed create window:', e));

/**
 * Install Vue.js or any other extension in development mode only.
 * Note: You must install `electron-devtools-installer` manually
 */
// if (import.meta.env.DEV) {
//   app
//     .whenReady()
//     .then(() => import('electron-devtools-installer'))
//     .then(module => {
//       const {default: installExtension, VUEJS3_DEVTOOLS} =
//         // @ts-expect-error Hotfix for https://github.com/cawa-93/vite-electron-builder/issues/915
//         typeof module.default === 'function' ? module : (module.default as typeof module);
//
//       return installExtension(VUEJS3_DEVTOOLS, {
//         loadExtensionOptions: {
//           allowFileAccess: true,
//         },
//       });
//     })
//     .catch(e => console.error('Failed install extension:', e));
// }

/**
 * Check for app updates, install it in background and notify user that new version was installed.
 * No reason run this in non-production build.
 * @see https://www.electron.build/auto-update.html#quick-setup-guide
 *
 * Note: It may throw "ENOENT: no such file app-update.yml"
 * if you compile production app without publishing it to distribution server.
 * Like `npm run compile` does. It's ok 😅
 */
if (import.meta.env.PROD) {
  app
    .whenReady()
    .then(() => import('electron-updater'))
    .then(module => {
      const autoUpdater =
        module.autoUpdater || (module.default.autoUpdater as (typeof module)['autoUpdater']);
      return autoUpdater.checkForUpdatesAndNotify();
    })
    .catch(e => console.error('Failed check and install updates:', e));
}
