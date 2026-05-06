import {requireAuth} from '@/shared/server/auth';
import {NextResponse} from 'next/server';

export async function GET() {
  const authResult = await requireAuth();

  if (!authResult.ok) {
    return authResult.error;
  }

  return new NextResponse(null, {status: 204});
}
