/**
 * @module preload
 */

console.log('in preloadddda');
import {ipcRenderer} from 'electron';

export function askDbReady(): Promise<boolean> {
  return new Promise(resolve => {
    ipcRenderer.once('tpr:database-ready', (event, success: boolean) => {
      resolve(success);
    });

    console.log('ASKING IF DB IS READY');
    ipcRenderer.send('tpr:ask-database-ready');
  });
}

export function askWebsiteReady(): Promise<boolean> {
  return new Promise(resolve => {
    ipcRenderer.once('tpr:website-ready', (event, success: boolean) => {
      resolve(success);
    });

    console.log('ASKING IF WEBSITE IS READY');
    ipcRenderer.send('tpr:ask-website-ready');
  });
}

export function cancelAutoInstall() {
  ipcRenderer.send('tpr:cancel-autoinstall');
}

export {sha256sum} from './nodeCrypto';
export {versions} from './versions';
