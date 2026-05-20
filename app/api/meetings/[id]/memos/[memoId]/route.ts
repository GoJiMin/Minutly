import {type NextRequest, NextResponse} from 'next/server';
import {NeonMeetingDb, meetingIdParamsSchema, meetingMemoIdParamsSchema} from '@/entities/meeting/server';
import type {ErrorResponse} from '@/shared/api';
import {createErrorJsonResponse, validateRouteParams} from '@/shared/server';
import {requireAuth} from '@/shared/server/auth';

type RouteParams = {
  params: Promise<{id: string; memoId: string}>;
};

function meetingIdValidationError(): ErrorResponse {
  return {
    title: 'INVALID_MEETING_ID',
    detail: '회의 식별자는 UUID 형식이어야 합니다.',
    status: 400,
  };
}

function meetingMemoIdValidationError(): ErrorResponse {
  return {
    title: 'INVALID_MEETING_MEMO_ID',
    detail: '메모 식별자는 양의 정수여야 합니다.',
    status: 400,
  };
}

export async function DELETE(_req: NextRequest, {params}: RouteParams): Promise<NextResponse<ErrorResponse | null>> {
  const requireAuthResult = await requireAuth();

  if (!requireAuthResult.ok) {
    return requireAuthResult.error;
  }

  const routeParams = await params;
  const meetingIdValidationResult = validateRouteParams(routeParams, meetingIdParamsSchema, meetingIdValidationError);

  if (!meetingIdValidationResult.ok) {
    return meetingIdValidationResult.error;
  }

  const memoIdValidationResult = validateRouteParams(
    routeParams,
    meetingMemoIdParamsSchema,
    meetingMemoIdValidationError,
  );

  if (!memoIdValidationResult.ok) {
    return memoIdValidationResult.error;
  }

  const {id} = meetingIdValidationResult.value;
  const {memoId} = memoIdValidationResult.value;
  const db = new NeonMeetingDb();

  try {
    const deleteResult = await db.deleteMeetingMemo(id, memoId);

    if (!deleteResult.deleted) {
      if (deleteResult.reason === 'MEETING_NOT_FOUND') {
        return createErrorJsonResponse({
          title: 'MEETING_NOT_FOUND',
          detail: '회의 기록을 찾을 수 없습니다.',
          status: 404,
        });
      }

      return createErrorJsonResponse({
        title: 'MEETING_MEMO_NOT_FOUND',
        detail: '메모를 찾을 수 없습니다.',
        status: 404,
      });
    }

    return new NextResponse(null, {status: 204});
  } catch (error) {
    console.error('[meeting-memos] failed to delete meeting memo', {
      message: error instanceof Error ? error.message : 'Unknown error',
      id,
      memoId,
    });

    return createErrorJsonResponse({
      title: 'MEETING_MEMO_DELETE_FAILED',
      detail: '메모 삭제에 실패했습니다.',
      status: 500,
    });
  }
}
