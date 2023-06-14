import {app} from 'electron';
import {fork} from 'node:child_process';
import {join, dirname} from 'node:path';
import processManager from './processManager';
import {prismaEnvVars} from './prisma/prismaConstants';

function forkWebsiteProcess() {
  // Remove once forks are working for testing.
  // eslint-disable-next-line
  if (true) {
    return;
  }
  const appPathDirName = dirname(app.getAppPath());
  const volumePath = join(app.getPath('userData'), 'volume');

  const serverProcess = fork('server.js', [], {
    cwd: join(appPathDirName, 'standalone-website/website'),
    env: {
      ...process.env,
      ...prismaEnvVars,
      IS_ELECTRON: 'true',
      VOLUME_PATH: volumePath,
    },
  });

  processManager.addChildProcess(serverProcess, 'next-server');
}

export default forkWebsiteProcess;
