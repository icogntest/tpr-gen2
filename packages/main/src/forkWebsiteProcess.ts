import {fork} from 'node:child_process';
import processManager from './processManager';
import {prismaEnvVars} from './prisma/prismaConstants';
import {serverJsDir, volumeDir} from './paths';
// import path from 'node:path';
// import fs from 'node:fs';

function forkWebsiteProcess() {
  if (process.env.NODE_ENV === 'development') {
    // Server is run separately during development.
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
  });

  processManager.addChildProcess(serverProcess, 'next-server');
}

export default forkWebsiteProcess;
