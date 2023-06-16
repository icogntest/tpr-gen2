import path from 'node:path';
import fs from 'fs-extra';
import getRootDir from '../scripts/util/getRootDir.mjs';

const rootDir = getRootDir();
const {version} = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json')));

/**
 * Entry function for get app version.
 * In current implementation, it returns `version` from `package.json`, but you can implement any logic here.
 * Runs several times for each vite configs and electron-builder config.
 * @return {string}
 */
export function getVersion() {
  return version;
}
