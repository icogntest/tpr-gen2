import path from 'node:path';
import {app} from 'electron';

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.IS_TEST === 'true';

// TODO: these will need to be updated to handle the Docker image version.

export const nodeModulesDir =
  isProduction && !isTest
    ? path.resolve(path.join(app.getAppPath(), '../node_modules'))
    : path.resolve('./node_modules');

let volumeDirectory;
if (isTest) {
  volumeDirectory = path.resolve('./volume-test');
} else if (isProduction) {
  volumeDirectory = path.resolve(path.join(app.getPath('userData'), 'volume'));
} else {
  volumeDirectory = path.resolve('./volume');
}

export const volumeDir = volumeDirectory;

export const prismaSchemaPath =
  isProduction && !isTest
    ? path.join(app.getAppPath(), '../prisma/schema.prisma')
    : path.resolve('./website/prisma/schema.prisma');

const appPathDirName = path.dirname(app.getAppPath());

export const serverJsDir =
  isProduction && !isTest
    ? path.join(appPathDirName, 'standalone-website/website')
    : path.resolve('./website/.next/standalone/website');

console.log(`serverJsDir:${serverJsDir}`);
