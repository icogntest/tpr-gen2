#!/usr/bin/env node

process.env.MODE = 'production';
process.env.NODE_ENV = 'production';

import {execa} from 'execa';
import path from 'node:path';
import fs, {readFileSync, writeFileSync} from 'node:fs';
import searchUpFileTree from './util/searchUpFileTree.mjs';
import {fileURLToPath} from 'node:url';
import {execSync} from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const rootDir = searchUpFileTree(__dirname, currPath => fs.existsSync(path.join(currPath, '.git')));
if (!rootDir) {
  throw new Error('Failed to find rootDir');
}

async function buildNext() {
  const execaOptions = {
    // cwd: process.cwd(),
    cwd: path.join(process.cwd(), 'website'),
    stdio: 'inherit',
    preferLocal: true,
  };

  // '.' dir is referring to 'website' dir based on execaOptions cwd
  await execa('next', ['build', '.'], execaOptions);
}

// Then run yarn command build.

// Then run: electron-builder build --config .electron-builder.config.js --dir --config.asar=false

function getGitCommitEnvStr() {
  const gitCommitHash = execSync('git rev-parse HEAD', {
    cwd: rootDir,
    encoding: 'utf8',
  });

  if (!gitCommitHash) {
    throw new Error('Failed to determine git commit hash.');
  }

  return `GIT_COMMIT=${gitCommitHash.substring(0, 12)}`;
}

function updateWebsiteEnv() {
  const websiteEnvFilePath = path.join(rootDir, 'website/.next/standalone/website/.env');
  const websiteEnvStr = readFileSync(websiteEnvFilePath, 'utf8');

  const envDirEnvFilePath = path.join(rootDir, 'env/.env');
  const envDirEnvStr = readFileSync(envDirEnvFilePath, 'utf8');

  const newEnv = [websiteEnvStr, envDirEnvStr, getGitCommitEnvStr()].join('\n\n');
  writeFileSync(websiteEnvFilePath, newEnv, 'utf8');
}

async function runBuild() {
  // First run Next build.
  console.log('BUILDING NEXT...');
  await buildNext();
  console.log('AFTER BUILD NEXT');

  // Manually edit the .env file which gets generated?
  updateWebsiteEnv();
}

runBuild();
