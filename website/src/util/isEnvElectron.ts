import {cookies} from 'next/headers';

function isEnvElectron() {
  if (process.env.NODE_ENV === 'production') {
    return process.env.IS_ELECTRON === 'true';
  } else {
    // If development, get from the cookie.
    return Boolean(cookies().get('electron-development')?.value);
  }
}

export default isEnvElectron;
