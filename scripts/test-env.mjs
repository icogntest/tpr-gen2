import path from 'node:path';
import fs from 'fs-extra';
import dotenv from 'dotenv';
import getRootDir from './util/getRootDir.mjs';

console.log('Running test-env.mjs...');

const rootDir = getRootDir();

const dotenvPath = path.resolve(path.join(rootDir, 'env/.env'));

const dotenvFiles = [`${dotenvPath}.testing`, dotenvPath];

dotenvFiles.forEach(dotenvFile => {
  if (fs.existsSync(dotenvFile)) {
    dotenv.config({
      path: dotenvFile,
    });
  }
});
