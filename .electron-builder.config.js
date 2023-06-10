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

  return {
    directories: {
      output: 'dist',
      buildResources: 'buildResources',
    },
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

    // Specify linux target just for disabling snap compilation
    linux: {
      target: 'deb',
    },
  };
};
