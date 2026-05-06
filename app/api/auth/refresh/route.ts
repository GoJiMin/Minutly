import {NextResponse} from 'next/server';
import {createErrorJsonResponse} from '@/shared/server';
import {
  getRefreshTokenCookieValue,
  issueAccessToken,
  setAccessTokenCookie,
  verifyRefreshToken,
} from '@/shared/server/auth';

function createUnauthorizedErrorResponse() {
  return {
    title: 'UNAUTHORIZED',
    detail: '인증이 필요합니다.',
    status: 401,
  };
}

export async function POST() {
  const refreshToken = await getRefreshTokenCookieValue();

  if (!refreshToken) {
    return createErrorJsonResponse(createUnauthorizedErrorResponse());
  }

  const verifyResult = await verifyRefreshToken(refreshToken);

  if (!verifyResult.ok) {
    return createErrorJsonResponse(createUnauthorizedErrorResponse());
  }

  try {
    const accessToken = await issueAccessToken();
    await setAccessTokenCookie(accessToken);
  } catch {
    return createErrorJsonResponse({
      title: 'AUTH_REFRESH_FAILED',
      detail: '토큰 갱신 중 문제가 발생했습니다.',
      status: 500,
    });
  }

  return new NextResponse(null, {status: 204});
}
