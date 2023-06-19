import {fork} from 'node:child_process';
import processManager from './processManager';
import {prismaEnvVars} from './prisma/prismaConstants';
import {serverJsDir, volumeDir} from './paths';
import pingWebsiteProcess from './pingWebsiteProcess';

type SubscriptionCallback = (success: boolean) => void;

enum WebsiteStatus {
  PENDING,
  SUCCESS,
  FAILURE,
}

let listeners: SubscriptionCallback[] = [];
let websiteStatus: WebsiteStatus = WebsiteStatus.PENDING;
let listenersCalled = false;

export function subscribeWebsiteReady(listener: SubscriptionCallback) {
  if (listenersCalled) {
    listener(websiteStatus === WebsiteStatus.SUCCESS);
  } else {
    listeners.push(listener);
  }
}

function callListeners(newStatus: WebsiteStatus) {
  websiteStatus = newStatus;
  if (listenersCalled) {
    return;
  }
  listenersCalled = true;
  const listenersCopy = listeners.slice();
  listeners = [];
  listenersCopy.forEach(listener => {
    listener(websiteStatus === WebsiteStatus.SUCCESS);
  });
}

function forkWebsiteProcess() {
  if (process.env.NODE_ENV === 'development') {
    // Server is run separately during development.
    callListeners(WebsiteStatus.SUCCESS); // Act as if website is ready immediately
    return;
  }

  const serverProcess = fork('server.js', [], {
    cwd: serverJsDir,
    env: {
      ...process.env,
      ...prismaEnvVars,
      IS_ELECTRON: 'true',
      VOLUME_PATH: volumeDir,
    },
    // `silent` must be set to true for the stdio to be piped back to the parent
    // process.
    silent: true,
  });
  processManager.addChildProcess(serverProcess, 'next-server');

  serverProcess.on('exit', () => {
    callListeners(WebsiteStatus.FAILURE);
  });

  if (serverProcess.stdout) {
    serverProcess.stdout.on('data', (data: Buffer) => {
      process.stdout.write(data);

      const content = data.toString('utf8');
      if (content.toLowerCase().indexOf('listening on port') >= 0) {
        // ping website and wait until get response
        pingWebsiteProcess()
          .then(statusCode => {
            console.log(`Website returned status code:${statusCode}`);
            callListeners(WebsiteStatus.SUCCESS);
          })
          .catch(e => {
            console.log('Ping website failed.');
            console.log(e);
          });
      }
    });
  }
}

export default forkWebsiteProcess;
