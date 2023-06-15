import path from 'node:path';
// import {app} from 'electron';
import {nodeModulesDir, volumeDir} from '../paths';

export const isDev = process.env.NODE_ENV === 'development';
// export const dbPath = path.join(app.getPath('userData'), 'app.db');

export const dbPath = path.join(volumeDir, 'db/app.db');

// export const dbUrl = isDev ? process.env.DATABASE_URL : 'file:' + dbPath;
export const dbUrl =
  process.env.NODE_ENV === 'development' && process.env.DATABASE_URL
    ? process.env.DATABASE_URL
    : 'file:' + dbPath;

// Hacky, but putting this here because otherwise at query time the Prisma client
// gives an error "Environment variable not found: DATABASE_URL" despite us passing
// the dbUrl into the prisma client constructor in datasources.db.url
process.env.DATABASE_URL = dbUrl;

// This needs to be updated every time you create a migration!
export const latestMigration = '20230511161150_user_adjustments';
// export const latestMigration = '20221005221528_init';
export const platformToExecutables: {
  [platform: string]: {
    migrationEngine: string;
    queryEngine: string;
  };
} = {
  win32: {
    migrationEngine: '@prisma/engines/migration-engine-windows.exe',
    queryEngine: '@prisma/engines/query_engine-windows.dll.node',
  },
  linux: {
    migrationEngine: '@prisma/engines/migration-engine-debian-openssl-1.1.x',
    queryEngine: '@prisma/engines/libquery_engine-debian-openssl-1.1.x.so.node',
  },
  darwin: {
    migrationEngine: '@prisma/engines/migration-engine-darwin',
    queryEngine: '@prisma/engines/libquery_engine-darwin.dylib.node',
  },
  darwinArm64: {
    migrationEngine: '@prisma/engines/migration-engine-darwin-arm64',
    queryEngine: '@prisma/engines/libquery_engine-darwin-arm64.dylib.node',
  },
};

function getPlatformName(): string {
  const isDarwin = process.platform === 'darwin';
  if (isDarwin && process.arch === 'arm64') {
    return process.platform + 'Arm64';
  }

  return process.platform;
}

const platformName = getPlatformName();

export const mePath = path.join(
  nodeModulesDir,
  platformToExecutables[platformName].migrationEngine,
);
export const qePath = path.join(nodeModulesDir, platformToExecutables[platformName].queryEngine);

export const prismaEnvVars = {
  DATABASE_URL: dbUrl,
  PRISMA_MIGRATION_ENGINE_BINARY: mePath,
  PRISMA_QUERY_ENGINE_LIBRARY: qePath,

  // Prisma apparently needs a valid path for the format and introspection binaries, even though
  // we don't use them. So we just point them to the query engine binary. Otherwise, we get
  // prisma:  Error: ENOTDIR: not a directory, unlink '/some/path/electron-prisma-trpc-example/packed/mac-arm64/ElectronPrismaTrpcExample.app/Contents/Resources/app.asar/node_modules/@prisma/engines/prisma-fmt-darwin-arm64'
  PRISMA_FMT_BINARY: qePath,
  PRISMA_INTROSPECTION_ENGINE_BINARY: qePath,
};

export const prismaPath = path.join(nodeModulesDir, 'prisma/build/index.js');

export interface Migration {
  id: string;
  checksum: string;
  finished_at: string;
  migration_name: string;
  logs: string;
  rolled_back_at: string;
  started_at: string;
  applied_steps_count: string;
}
