import {type NextRequest, NextResponse} from 'next/server';
import {NeonMeetingDb, meetingIdParamsSchema, type GetMeetingMemosResponse} from '@/entities/meeting/server';
import type {ErrorResponse} from '@/shared/api';
import {requireAuth} from '@/shared/server/auth';
import {createErrorJsonResponse, validateRouteParams} from '@/shared/server';

type RouteParams = {
  params: Promise<{id: string}>;
};

function createMeetingIdValidationError(): ErrorResponse {
  return {
    title: 'INVALID_MEETING_ID',
    detail: '회의 식별자는 UUID 형식이어야 합니다.',
    status: 400,
  };
}

export async function GET(
  _req: NextRequest,
  {params}: RouteParams,
): Promise<NextResponse<GetMeetingMemosResponse | ErrorResponse>> {
  const requireAuthResult = await requireAuth();

  if (!requireAuthResult.ok) {
    return requireAuthResult.error;
  }

  const routeParams = await params;
  const validateResult = validateRouteParams(routeParams, meetingIdParamsSchema, createMeetingIdValidationError);

  if (!validateResult.ok) {
    return validateResult.error;
  }

  const {id} = validateResult.value;
  const db = new NeonMeetingDb();

  try {
    const memos = await db.listMeetingMemos(id);

    if (!memos) {
      return createErrorJsonResponse({
        title: 'MEETING_NOT_FOUND',
        detail: '회의 기록을 찾을 수 없습니다.',
        status: 404,
      });
    }

    return NextResponse.json({memos}, {status: 200});
  } catch (error) {
    console.error('[meeting-memos] failed to get meeting memos', {
      message: error instanceof Error ? error.message : 'Unknown error',
      id,
    });

    return createErrorJsonResponse({
      title: 'MEETING_MEMOS_READ_FAILED',
      detail: '메모를 불러오지 못했습니다.',
      status: 500,
    });
  }
}
