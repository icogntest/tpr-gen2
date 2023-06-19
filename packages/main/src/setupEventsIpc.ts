import {ipcMain} from 'electron';
import {subscribeWebsiteReady} from './forkWebsiteProcess';

function setupEventsIpc() {
  ipcMain.on('tpr:ask-website-ready', event => {
    subscribeWebsiteReady((success: boolean) => {
      event.sender.send('tpr:website-ready', success);
    });
  });
}

export default setupEventsIpc;
