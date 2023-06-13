import fs from 'fs-extra';
import path from 'node:path';
import {globSync} from 'glob';
import {minify} from 'terser';

const standaloneDir = path.resolve('./website/.next/standalone');

function removeDevelopmentJsFiles() {
  console.log('Removing *.development.js files...');
  const devJsFileInput = path.join(standaloneDir, './**/*.development.js').replaceAll('\\', '/');
  // dot:true so we find the `.prisma` directory
  const devJsFiles = globSync(devJsFileInput, {dot: true});
  console.log(devJsFiles);
  devJsFiles.forEach(ff => {
    fs.rmSync(ff);
  });
  console.log('Removed *.development.js files.');
}

function findAllStandaloneFiles() {
  const b = path.join(standaloneDir, './**/*').replaceAll('\\', '/');
  // dot:true so we find the `.prisma` directory
  return globSync(b, {dot: true});
}

async function processFiles(filePaths) {
  for (let i = 0; i < filePaths.length; i++) {
    const filePath = filePaths[i];
    if (path.extname(filePath) === '.js') {
      await processJsFile(filePath);
    } else if (path.extname(filePath) === '.json') {
      await processJsonFile(filePath);
    }
  }
}

async function _processFile(filePath, cb) {
  const relative = path.relative(standaloneDir, filePath);
  console.log(relative);

  const content = fs.readFileSync(filePath, 'utf8');
  const minifiedContent = await cb(content);

  fs.writeFileSync(filePath, minifiedContent);
}

async function processJsFile(filePath) {
  await _processFile(filePath, async content => {
    const minifiedContent = await minify(content, {mangle: false});
    return minifiedContent.code;
  });
}

async function processJsonFile(filePath) {
  await _processFile(filePath, async content => {
    return JSON.stringify(JSON.parse(content));
  });
}

async function main() {
  removeDevelopmentJsFiles();

  const allFiles = findAllStandaloneFiles();
  console.log('Minifying files...');
  await processFiles(allFiles);
  console.log('Finished minifying files.');
}

main();
