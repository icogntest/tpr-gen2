'use client';

import {signIn} from 'next-auth/react';
import {useEffect} from 'react';

export default async function LoginPage() {
  useEffect(() => {
    signIn(undefined, {callbackUrl: '/'});
  }, []);

  return <div>Redirecting to sign in page...</div>;
}
