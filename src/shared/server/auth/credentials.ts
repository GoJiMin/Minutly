import 'server-only';

import {timingSafeEqual} from 'node:crypto';
import {authConfig} from '../env';

type Credentials = {
  id: string;
  password: string;
};

function safeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return timingSafeEqual(aBuffer, bBuffer);
}

export function verifyCredentials(input: Credentials) {
  return safeEqual(input.id, authConfig.id) && safeEqual(input.password, authConfig.password);
}
