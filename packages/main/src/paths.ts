import path from 'node:path';
import {app} from 'electron';

export const nodeModulesDir = process.env.IS_TEST
  ? path.resolve('./node_modules')
  : path.resolve(path.join(app.getAppPath(), 'node_modules'));

let volumeDirectory;
if (process.env.IS_TEST) {
  volumeDirectory = path.resolve('./volume-test');
} else if (process.env.NODE_ENV === 'development') {
  volumeDirectory = path.resolve('./volume');
} else {
  volumeDirectory = path.resolve(path.join(app.getPath('userData'), 'volume'));
}

export const volumeDir = volumeDirectory;

export const prismaSchemaPath =
  process.env.NODE_ENV === 'production'
    ? path.join(app.getAppPath(), '../prisma/schema.prisma')
    : path.resolve('website/prisma/schema.prisma');
