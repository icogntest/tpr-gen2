import {ipcMain} from 'electron';
import {websiteReadyEmitter} from './website/forkWebsiteProcess';
import {dbPreparedEmitter} from './prisma/prepareDb';

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
}

export default setupEventsIpc;
