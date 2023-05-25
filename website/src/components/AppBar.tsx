import SignOutButton from './SignOutButton';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import asSyncComponent from './asSyncComponent';

const AppBar = asSyncComponent(async function AppBar() {
  const session = await getServerSession(authOptions);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: '56px',
        boxSizing: 'border-box',
        backgroundColor: 'green',
        padding: '16px',
      }}
    >
      <div style={{ marginRight: 'auto' }}>AppBar</div>
      <SignOutButton user={session?.user} />
    </div>
  );
});

export default AppBar;
