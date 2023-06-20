import {ipcMain} from 'electron';
import {websiteReadyEmitter} from './website/forkWebsiteProcess';
import {dbPreparedEmitter} from './prisma/prepareDb';
import {autoUpdater} from 'electron-updater';

function setupEventsIpc() {
  ipcMain.on('tpr:ask-database-ready', event => {
    dbPreparedEmitter.onceOrPrev((success: boolean | undefined) => {
      if (success != null && !event.sender.isDestroyed()) {
        event.sender.send('tpr:database-ready', success);
      }
    });
  });

  ipcMain.on('tpr:ask-website-ready', event => {
    websiteReadyEmitter.onceOrPrev((success: boolean | undefined) => {
      if (success != null && !event.sender.isDestroyed()) {
        event.sender.send('tpr:website-ready', success);
      }
    });
  });

  ipcMain.on('tpr:cancel-autoinstall', () => {
    console.log('Setting autoUpdater.autoInstallOnAppQuit to false');
    autoUpdater.autoInstallOnAppQuit = false;
  });
}

export default setupEventsIpc;
