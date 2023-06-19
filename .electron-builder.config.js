const fs = require('fs-extra');
const path = require('node:path');

// Note: swapped to v24 of electron-builder so that there is an option to
// exclude langauges other than en-US. This saves 20+ MB. However, v24 is not
// considered the stable version, so if there is ever a problem for some reason,
// can swap back to v23 and add code to manually delete the other langauge
// `.pak` files.

/**
 * TODO: Rewrite this config to ESM
 * But currently electron-builder doesn't support ESM configs
 * @see https://github.com/develar/read-config-file/issues/10
 */

/**
 * @type {() => import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
module.exports = async function () {
  const {getVersion} = await import('./version/getVersion.mjs');

  // Note: the "name" in the root package.json seems to be used when creating
  // the "updaterCacheDirName" in the app-update.yml (for example,
  // "vite-electron-builder-updater"; seems to be the "name" + "-updater";
  // location is "...AppData\Local\vite-electron-builder-updater"). It also
  // controls the install location. For example,
  // "...AppData\Local\Programs\vite-electron-builder" when the "name" is
  // "vite-electron-builder".
  return {
    appId: 'com.tprandomizer.generator',
    productName: 'Twilight Princess Randomizer',
    directories: {
      output: 'dist',
      buildResources: 'buildResources',
    },
    electronLanguages: 'en-US',
    files: ['packages/**/dist/**'],
    extraResources: [
      // Have to put this in extraResources and lead with `app/` so we can have
      // the `node_modules` folder get copied over as well. Electron builder
      // will not copy that folder based on its name when this is put in the
      // `files` option.

      // See: https://nextjs.org/docs/pages/api-reference/next-config-js/output
      // TODO: need to handle copying the public folder correctly once making
      // use of it.
      {
        from: 'website/.next/standalone',
        to: 'standalone-website',
      },
      {
        from: 'website/.next/static',
        to: 'standalone-website/website/.next/static',
      },

      // have to keep this outside of the ASAR. Really really does not want to
      // fork when the file is in the ASAR.
      'packages/server-starter/**',

      // For prisma
      'node_modules/@prisma/engines/migration-engine*',
      'node_modules/@prisma/engines/query*',
      'node_modules/@prisma/engines/libquery*',

      // start prisma/build
      // {
      //   from: 'website/node_modules/prisma/package.json',
      //   to: 'node_modules/prisma/package.json',
      // },
      // {
      //   from: 'website/node_modules/prisma/build',
      //   to: 'node_modules/prisma/build',
      // },
      'node_modules/prisma/package.json',
      'node_modules/prisma/build/index.js',
      'node_modules/prisma/build/prisma_fmt_build_bg.wasm',

      // {
      //   from: 'website/node_modules/prisma/build/index.js',
      //   to: 'node_modules/prisma/build/index.js',
      // },
      // {
      //   from: 'website/node_modules/prisma/build/prisma_fmt_build_bg.wasm',
      //   to: 'node_modules/prisma/build/prisma_fmt_build_bg.wasm',
      // },
      // end prisma/build

      {
        from: 'website/.next/standalone/node_modules/.prisma',
        to: 'node_modules/.prisma',
      },
      {
        from: 'website/.next/standalone/node_modules/@prisma/client',
        to: 'node_modules/@prisma/client',
      },

      // start prisma schema and migrations
      {
        from: 'website/prisma/schema.prisma',
        to: 'prisma/schema.prisma',
      },
      {
        from: 'website/prisma/migrations',
        to: 'prisma/migrations',
      },
      // end prisma schema and migrations

      // {
      //   from: 'website/node_modules/.prisma',
      //   to: 'node_modules/.prisma',
      // },
    ],
    extraMetadata: {
      version: getVersion(),
    },
    afterPack: async function (context) {
      // At the very least, extraResources are not available in the beforePack
      // hook.
      console.log('\nafterPack, removing certain files...');
      // TODO: probably need to revisit this, especially when packing or for
      // different operating systems.
      const filesToDelete = [
        'resources/node_modules/.prisma/client/query_engine-windows.dll.node',
        'resources/standalone-website/node_modules/.prisma/client/query_engine-windows.dll.node',
      ];

      filesToDelete.forEach(file => {
        const resolvedFile = path.join(context.appOutDir, file);
        if (fs.existsSync(resolvedFile)) {
          console.log(`Removing "${resolvedFile}"...`);
          fs.rmSync(resolvedFile);
        } else {
          console.log(`Did not find "${resolvedFile}" to remove...`);
        }
      });

      console.log('');
    },

    // Specify linux target just for disabling snap compilation
    linux: {
      target: 'deb',
    },
  };
};
