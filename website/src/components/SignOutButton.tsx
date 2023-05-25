'use client';

import {signIn, signOut} from 'next-auth/react';

type SignOutButtonProps = {
  user?: {
    name?: string | null;
  };
};

function SignOutButton({user}: SignOutButtonProps) {
  if (user) {
    return (
      <div style={{display: 'flex'}}>
        <div style={{marginRight: '16px'}}>{user.name}</div>
        <button
          onClick={() => {
            signOut();
          }}
        >
          Sign Out
        </button>
      </div>
    );
  }

  // TODO: only display button during dev
  return <button onClick={() => signIn()}>Sign In</button>;
}

export default SignOutButton;
