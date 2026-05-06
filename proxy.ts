import {NextRequest, NextResponse} from 'next/server';
import {verifyRefreshToken} from '@/shared/server/auth';
import {authCookieNames} from '@/shared/server/auth/constants';

const protectedPagePaths = ['/', '/history'];

export async function proxy(request: NextRequest) {
  const {pathname} = request.nextUrl;

  if (!protectedPagePaths.includes(pathname)) {
    return NextResponse.next();
  }

  const refreshToken = request.cookies.get(authCookieNames.refreshToken)?.value;

  if (!refreshToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const refreshTokenResult = await verifyRefreshToken(refreshToken);

  if (!refreshTokenResult.ok) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}
