import {NextRequest, NextResponse} from 'next/server';
import {loginRequestSchema} from '@/entities/auth';
import {createErrorJsonResponse, validateRequestBody} from '@/shared/server';
import {issueAccessToken, issueRefreshToken, setAuthCookies, verifyCredentials} from '@/shared/server/auth';

function createInvalidCredentialsError() {
  return {
    title: 'INVALID_CREDENTIALS',
    detail: '로그인 정보가 올바르지 않습니다.',
    status: 401,
  };
}

export async function POST(req: NextRequest) {
  const validationResult = await validateRequestBody(req, loginRequestSchema, createInvalidCredentialsError);

  if (!validationResult.ok) {
    return validationResult.error;
  }

  if (!verifyCredentials(validationResult.value)) {
    return createErrorJsonResponse(createInvalidCredentialsError());
  }

  try {
    const [accessToken, refreshToken] = await Promise.all([issueAccessToken(), issueRefreshToken()]);

    await setAuthCookies({accessToken, refreshToken});
  } catch {
    return createErrorJsonResponse({
      title: 'AUTH_LOGIN_FAILED',
      detail: '로그인 처리 중 문제가 발생했습니다.',
      status: 500,
    });
  }

  return new NextResponse(null, {status: 204});
}
