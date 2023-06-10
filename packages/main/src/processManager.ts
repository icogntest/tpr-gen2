import type {ChildProcess} from 'node:child_process';

type ProcessManagerItem = {
  pid: number;
  name: string;
};

class ProcessManager {
  private _pidArr: ProcessManagerItem[] = [];

  private _removePid(pid: number) {
    this._pidArr = this._pidArr.filter(item => item.pid !== pid);
  }

  addChildProcess(childProcess: ChildProcess, name: string) {
    const {pid} = childProcess;
    if (typeof pid !== 'number') {
      return;
    }

    if (this._pidArr.find(item => item.pid === pid)) {
      // already in list; not expected to ever happen.
      return;
    }

    console.log(`procMgr: adding childProcess "${name}" with pid: ${pid}`);
    this._pidArr.push({pid, name});

    childProcess.on('exit', () => {
      console.log(`procMgr: removing childProcess "${name}" with pid: ${pid}`);
      this._removePid(pid);
    });
  }

  killAll() {
    this._pidArr.forEach(({name, pid}) => {
      console.log(`procMgr: killing process "${name}" with pid: ${pid}`);
      process.kill(pid);
    });
  }
}

const processManager = new ProcessManager();

export default processManager;
