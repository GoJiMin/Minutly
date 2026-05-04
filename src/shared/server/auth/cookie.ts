import 'server-only';

import {cookies} from 'next/headers';
import {accessTokenMaxAgeSeconds, authCookieNames, refreshTokenMaxAgeSeconds} from './constants';

const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
} as const;

export async function setAccessTokenCookie(accessToken: string) {
  const cookieStore = await cookies();

  cookieStore.set(authCookieNames.accessToken, accessToken, {
    ...authCookieOptions,
    maxAge: accessTokenMaxAgeSeconds,
  });
}

export async function deleteAccessTokenCookie() {
  const cookieStore = await cookies();

  cookieStore.delete(authCookieNames.accessToken);
}

export async function setAuthCookies(input: {accessToken: string; refreshToken: string}) {
  const cookieStore = await cookies();

  cookieStore.set(authCookieNames.accessToken, input.accessToken, {
    ...authCookieOptions,
    maxAge: accessTokenMaxAgeSeconds,
  });

  cookieStore.set(authCookieNames.refreshToken, input.refreshToken, {
    ...authCookieOptions,
    maxAge: refreshTokenMaxAgeSeconds,
  });
}

export async function deleteAuthCookies() {
  const cookieStore = await cookies();

  cookieStore.delete(authCookieNames.accessToken);
  cookieStore.delete(authCookieNames.refreshToken);
}
