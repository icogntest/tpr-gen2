import isEnvElectron from '@/util/isEnvElectron';

export default function Home() {
  return (
    <main>
      <div>{process.env.TPRGEN_VOLUME_ROOT}</div>
      <div>{process.env.DOG}</div>
      <div>In home</div>
      <div>{'isEnvElectron: ' + isEnvElectron()}</div>
      <div>{'gitCommit: ' + process.env.GIT_COMMIT}</div>
    </main>
  );
}
