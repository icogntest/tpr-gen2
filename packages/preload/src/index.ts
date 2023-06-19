/**
 * @module preload
 */

console.log('in preloadddda');
import {ipcRenderer} from 'electron';

export function askWebsiteReady(): Promise<boolean> {
  return new Promise(resolve => {
    ipcRenderer.once('tpr:website-ready', (event, success: boolean) => {
      resolve(success);
    });

    console.log('ASKING IF WEBSITE IS READY');
    ipcRenderer.send('tpr:ask-website-ready');
  });
}

export {sha256sum} from './nodeCrypto';
export {versions} from './versions';
