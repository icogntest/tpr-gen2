import {execa} from 'execa';

const execaOptions = {
  cwd: process.cwd(),
  stdio: 'inherit',
  preferLocal: true,
};

function startNextServer() {
  const child = execa(
    'next',
    // ['-p', rendererPort, rendererSrcDir || 'renderer'],
    ['.'],
    execaOptions,
  );
  child.on('close', () => {
    process.exit(0);
  });
  return child;
}

async function dev() {
  let nextServerProcess = null;

  const killWholeProcess = () => {
    if (nextServerProcess) {
      nextServerProcess.kill();
    }
  };

  process.on('SIGINT', killWholeProcess);
  process.on('SIGTERM', killWholeProcess);
  process.on('exit', killWholeProcess);

  // nextServerProcess = startNextServer();
  startNextServer();
}

dev();
