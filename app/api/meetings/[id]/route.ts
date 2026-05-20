import {type NextRequest, NextResponse} from 'next/server';
import type {ZodError} from 'zod';
import {
  meetingIdParamsSchema,
  type MeetingDetail,
  NeonMeetingDb,
  updateMeetingRequestSchema,
} from '@/entities/meeting/server';
import type {ErrorResponse} from '@/shared/api';
import {createErrorJsonResponse, validateRequestBody, validateRouteParams} from '@/shared/server';
import {requireAuth} from '@/shared/server/auth';

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

function createUpdateMeetingValidationError(error: ZodError): ErrorResponse {
  const [firstIssue] = error.issues;
  const [issuePath] = firstIssue?.path ?? [];

  switch (issuePath) {
    case 'title':
      if (firstIssue?.code === 'too_big') {
        return {
          title: 'TITLE_TOO_LONG',
          detail: '회의 제목은 최대 100자 이하로 입력해주세요.',
          status: 400,
        };
      }

      return {
        title: 'TITLE_REQUIRED',
        detail: '회의 제목을 입력해주세요.',
        status: 400,
      };

    case 'summary':
      return {
        title: 'SUMMARY_REQUIRED',
        detail: '회의 요약을 입력해주세요.',
        status: 400,
      };

    case 'keyPoints':
      if (firstIssue?.code === 'too_big') {
        return {
          title: 'KEY_POINTS_TOO_MANY',
          detail: '주요 사항은 최대 20개까지 저장할 수 있습니다.',
          status: 400,
        };
      }

      return {
        title: 'KEY_POINTS_REQUIRED',
        detail: '주요 사항을 1개 이상 입력해주세요.',
        status: 400,
      };

    default:
      return {
        title: 'INVALID_MEETING_UPDATE_REQUEST',
        detail: '회의 수정 요청이 올바르지 않습니다. 다시 확인해주세요.',
        status: 400,
      };
  }
}

export async function GET(
  _req: NextRequest,
  {params}: RouteParams,
): Promise<NextResponse<MeetingDetail | ErrorResponse>> {
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
    const meeting = await db.getMeetingById(id);

    if (!meeting) {
      return createErrorJsonResponse({
        title: 'MEETING_NOT_FOUND',
        detail: '회의 기록을 찾을 수 없습니다.',
        status: 404,
      });
    }

    return NextResponse.json(meeting, {status: 200});
  } catch (error) {
    console.error('[meetings] failed to get meeting detail', {
      message: error instanceof Error ? error.message : 'Unknown error',
      id,
    });

    return createErrorJsonResponse({
      title: 'MEETING_READ_FAILED',
      detail: '회의 상세를 불러오지 못했습니다.',
      status: 500,
    });
  }
}

export async function PUT(req: NextRequest, {params}: RouteParams): Promise<NextResponse<ErrorResponse | null>> {
  const requireAuthResult = await requireAuth();

  if (!requireAuthResult.ok) {
    return requireAuthResult.error;
  }

  const routeParams = await params;
  const routeParamsValidationResult = validateRouteParams(
    routeParams,
    meetingIdParamsSchema,
    createMeetingIdValidationError,
  );

  if (!routeParamsValidationResult.ok) {
    return routeParamsValidationResult.error;
  }

  const requestBodyValidationResult = await validateRequestBody(
    req,
    updateMeetingRequestSchema,
    createUpdateMeetingValidationError,
  );

  if (!requestBodyValidationResult.ok) {
    return requestBodyValidationResult.error;
  }

  const {id} = routeParamsValidationResult.value;
  const db = new NeonMeetingDb();

  try {
    const {updated} = await db.updateMeeting(id, requestBodyValidationResult.value);

    if (!updated) {
      return createErrorJsonResponse({
        title: 'MEETING_NOT_FOUND',
        detail: '회의 기록을 찾을 수 없습니다.',
        status: 404,
      });
    }

    return new NextResponse(null, {status: 204});
  } catch (error) {
    console.error('[meetings] failed to update meeting', {
      message: error instanceof Error ? error.message : 'Unknown error',
      id,
      titleLength: requestBodyValidationResult.value.title.length,
      summaryLength: requestBodyValidationResult.value.summary.length,
      keyPointCount: requestBodyValidationResult.value.keyPoints.length,
    });

    return createErrorJsonResponse({
      title: 'MEETING_UPDATE_FAILED',
      detail: '회의 수정 저장에 실패했습니다.',
      status: 500,
    });
  }
}

export async function DELETE(_req: NextRequest, {params}: RouteParams): Promise<NextResponse<ErrorResponse | null>> {
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
    const {deleted} = await db.deleteMeeting(id);

    if (!deleted) {
      return createErrorJsonResponse({
        title: 'MEETING_NOT_FOUND',
        detail: '회의 기록을 찾을 수 없습니다.',
        status: 404,
      });
    }

    return new NextResponse(null, {status: 204});
  } catch (error) {
    console.error('[meetings] failed to delete meeting', {
      message: error instanceof Error ? error.message : 'Unknown error',
      id,
    });

    return createErrorJsonResponse({
      title: 'MEETING_DELETE_FAILED',
      detail: '회의 삭제에 실패했습니다.',
      status: 500,
    });
  }
}
