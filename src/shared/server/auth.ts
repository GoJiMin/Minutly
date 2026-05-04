import 'server-only';

import {timingSafeEqual} from 'node:crypto';
import {authConfig} from './env';

export const authSubject = 'minutly-owner' as const;

export type AuthTokenType = 'access' | 'refresh';

export type AuthTokenPayload = {
  sub: typeof authSubject;
  tokenType: AuthTokenType;
  iat: number;
  exp: number;
};

export type AccessTokenPayload = AuthTokenPayload & {
  tokenType: 'access';
};

export type RefreshTokenPayload = AuthTokenPayload & {
  tokenType: 'refresh';
};

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
