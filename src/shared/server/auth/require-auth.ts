import 'server-only';

import type {NextResponse} from 'next/server';
import {createErrorJsonResponse} from '../response';
import {verifyAccessToken} from './token';
import {getAuthCookieValues} from './cookie';
import type {ErrorResponse} from '@/shared/api';

type AuthFailureTitle = 'TOKEN_EXPIRED' | 'UNAUTHORIZED';
type RequireAuthResult = {ok: true} | {ok: false; error: NextResponse<ErrorResponse>};

function createAuthFailureResult(title: AuthFailureTitle): RequireAuthResult {
  const detailByTitle: Record<AuthFailureTitle, string> = {
    TOKEN_EXPIRED: '인증 정보가 만료되었습니다.',
    UNAUTHORIZED: '인증이 필요합니다.',
  };

  return {
    ok: false,
    error: createErrorJsonResponse({
      title,
      detail: detailByTitle[title],
      status: 401,
    }),
  };
}

function createRefreshableAuthFailureResult(hasRefreshToken: boolean): RequireAuthResult {
  if (hasRefreshToken) {
    return createAuthFailureResult('TOKEN_EXPIRED');
  }

  return createAuthFailureResult('UNAUTHORIZED');
}

export async function requireAuth(): Promise<RequireAuthResult> {
  const {accessToken, refreshToken} = await getAuthCookieValues();
  const hasRefreshToken = Boolean(refreshToken);

  if (!accessToken) {
    return createRefreshableAuthFailureResult(hasRefreshToken);
  }

  const verifyResult = await verifyAccessToken(accessToken);

  if (verifyResult.ok) {
    return {ok: true};
  }

  if (verifyResult.reason === 'expired') {
    return createRefreshableAuthFailureResult(hasRefreshToken);
  }

  return createAuthFailureResult('UNAUTHORIZED');
}
