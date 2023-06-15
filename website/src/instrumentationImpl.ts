import fs from 'node:fs';
import path from 'node:path';
import searchUpFileTree from './util/searchUpFileTree';
import {execSync} from 'node:child_process';

if (process.env.NODE_ENV === 'production') {
  if (!fs) {
    console.log('not fs');
  }
  process.env.DOG = 'DOG_VAL_PRODUCTION';
  // In production, the config is provided by docker swarm configs.
  // require('dotenv').config({path: '/env_config'});

  // TODO: need to handle for production electron.
} else {
  process.env.DOG = 'DOG_VAL_DEVELOPMENT';

  const rootDir = searchUpFileTree(__dirname, currPath =>
    fs.existsSync(path.join(currPath, '.git')),
  );
  if (!rootDir) {
    throw new Error('Failed to find rootDir');
  }

  const gitCommitHash = execSync('git rev-parse HEAD', {
    cwd: rootDir,
    encoding: 'utf8',
  });

  if (gitCommitHash) {
    process.env.GIT_COMMIT = gitCommitHash.substring(0, 12);
  } else {
    throw new Error('Failed to determine git commit hash.');
  }

  // Put in DATABASE_URL from here and not the website .env file.
  process.env.DATABASE_URL = 'file:' + path.join(rootDir, 'volume/db/app.db');

  const dotenvPath = path.resolve(path.join(rootDir, 'env/.env'));
  const dotenvFiles = [
    // `${dotenvPath}.development.local`,
    `${dotenvPath}.development`,
    dotenvPath,
  ];
  dotenvFiles.forEach((dotenvFile: string) => {
    if (fs.existsSync(dotenvFile)) {
      require('dotenv').config({
        path: dotenvFile,
      });
    }
  });
}
