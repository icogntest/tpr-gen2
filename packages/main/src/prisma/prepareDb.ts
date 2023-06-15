import fs from 'node:fs';
import path from 'node:path';
import type {Migration} from './prismaConstants';
import {dbPath, dbUrl, latestMigration} from './prismaConstants';
import {prisma, runPrismaCommand} from './prisma';
import {prismaSchemaPath} from '../paths';

async function prepareDb() {
  console.log(`process.env.NODE_ENV:${process.env.NODE_ENV}`);
  // if (process.env.NODE_ENV !== 'production') {
  //   return;
  // }
  // throw new Error('asdfhdsifo');

  let needsMigration = false;

  const dbExists = fs.existsSync(dbPath);
  console.log(`dbPath:${dbPath}`);
  console.log(`dbExists:${dbExists}`);

  if (!dbExists) {
    needsMigration = true;
    // prisma for whatever reason has trouble if the database file does not exist yet.
    // So just touch it here

    fs.mkdirSync(path.dirname(dbPath), {recursive: true}); // mkdirp
    fs.closeSync(fs.openSync(dbPath, 'w'));
  } else {
    try {
      const latest: Migration[] =
        await prisma.$queryRaw`select * from _prisma_migrations order by finished_at`;
      needsMigration = latest[latest.length - 1]?.migration_name !== latestMigration;
    } catch (e) {
      console.error(e);
      needsMigration = true;
    }
  }

  if (needsMigration) {
    try {
      // const schemaPath = path.join(
      //   app.getAppPath().replace('app.asar', 'app.asar.unpacked'),
      //   'prisma',
      //   'schema.prisma',
      // );

      // const schemaPath = path.join(app.getAppPath(), '../prisma/schema.prisma');
      const schemaPath = prismaSchemaPath;

      console.log(`Needs a migration. Running prisma migrate with schema path ${schemaPath}`);

      // first create or migrate the database! If you were deploying prisma to a cloud service, this migrate deploy
      // command you would run as part of your CI/CD deployment. Since this is an electron app, it just needs
      // to run every time the production app is started. That way if the user updates the app and the schema has
      // changed, it will transparently migrate their DB.
      await runPrismaCommand({
        command: ['migrate', 'deploy', '--schema', schemaPath],
        dbUrl,
      });
      console.log('Migration done.');

      // seed
      // log.info("Seeding...");
      // await seed(prisma);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  } else {
    console.log('Does not need migration');
  }
}

export default prepareDb;
