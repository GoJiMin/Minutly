import {NextResponse} from 'next/server';
import {createErrorJsonResponse} from '@/shared/server';
import {deleteAuthCookies} from '@/shared/server/auth';

export async function POST() {
  try {
    await deleteAuthCookies();

    return new NextResponse(null, {status: 204});
  } catch {
    return createErrorJsonResponse({
      title: 'AUTH_LOGOUT_FAILED',
      detail: '로그아웃 처리 중 문제가 발생했습니다.',
      status: 500,
    });
  }
}
