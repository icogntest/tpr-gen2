// Note: it is important that `setEnv` be the very first import.
import './setEnv';
import {app, ipcMain} from 'electron';
import './security-restrictions';
import {restoreOrCreateWindow} from '/@/mainWindow';
import {platform} from 'node:process';
import fs from 'node:fs';
import path from 'node:path';
import forkWebsiteProcess from './website/forkWebsiteProcess';
import processManager from './processManager';
import prepareDb from './prisma/prepareDb';
import {autoUpdater} from 'electron-updater';
import setupEventsIpc from './setupEventsIpc';
// import {UpdateEndpoint, createCustomAppUpdater} from './updater/CustomAppUpdater';

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

// Need this so the CI linux e2e tests don't hang while trying to close
// Electron.
if (process.env.IS_TEST) {
  ipcMain.on('kill-child-processes', () => {
    processManager.killAll();
  });
}

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
  setupEventsIpc();

  // const customAppUpdater = createCustomAppUpdater(UpdateEndpoint.stable);
  // const a = await customAppUpdater.checkForUpdates();
  // console.log(a);

  // We want to specify what we want to target when we create the custom adapter.
  // We need to create the customAppUpdater on command.
  //

  if (process.env.NODE_ENV === 'production') {
    prepareDb();

    checkForUpdates();
  }

  forkWebsiteProcess();

  restoreOrCreateWindow();
}

function checkForUpdates() {
  if (process.env.NODE_ENV === 'production') {
    autoUpdater
      .checkForUpdates()
      .then(a => {
        console.log('Check for updates success:');
        console.log(a);
      })
      .catch(e => {
        console.log('Check for updates error:');
        console.log(e);
      });

    // autoUpdater.checkForUpdatesAndNotify().catch(e => {
    //   console.error('Failed check and install updates:', e);
    // });
  }
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
// if (import.meta.env.PROD) {
//   app
//     .whenReady()
//     .then(() => import('electron-updater'))
//     .then(module => {
//       const autoUpdater =
//         module.autoUpdater || (module.default.autoUpdater as (typeof module)['autoUpdater']);
//       return autoUpdater.checkForUpdatesAndNotify();
//     })
//     .catch(e => console.error('Failed check and install updates:', e));
// }

// Dynamic import of 'electron-updater' not working when bundled in asar.
// There is some discussion here:
// https://github.com/electron/asar/issues/249
// https://github.com/electron/electron/pull/37535
// Changed to be a static import so it would work. The only real difference is
// that we import it during development, but since we aren't using it, this
// doesn't really matter.
