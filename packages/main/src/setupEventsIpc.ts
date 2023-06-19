import {ipcMain} from 'electron';
import {websiteReadyEmitter} from './website/forkWebsiteProcess';

function setupEventsIpc() {
  // ipcMain.on('tpr:ask-database-ready', event => {
  //   subscribeWebsiteReady((success: boolean) => {
  //     if (!event.sender.isDestroyed()) {
  //       event.sender.send('tpr:database-ready', success);
  //     }
  //   });
  // });

  ipcMain.on('tpr:ask-website-ready', event => {
    websiteReadyEmitter.onceOrPrev((success: boolean | undefined) => {
      if (success != null && !event.sender.isDestroyed()) {
        event.sender.send('tpr:website-ready', success);
      }
    });
  });
}

export default setupEventsIpc;
