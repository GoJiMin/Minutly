import {type NextRequest, NextResponse} from 'next/server';
import type {ZodError} from 'zod';
import {
  createMeetingMemoRequestSchema,
  getMeetingDb,
  meetingIdParamsSchema,
  type GetMeetingMemosResponse,
} from '@/entities/meeting/server';
import type {ErrorResponse} from '@/shared/api';
import {requireAuth} from '@/shared/server/auth';
import {createErrorJsonResponse, validateRequestBody, validateRouteParams} from '@/shared/server';

type RouteParams = {
  params: Promise<{id: string}>;
};

function meetingIdValidationError(): ErrorResponse {
  return {
    title: 'INVALID_MEETING_ID',
    detail: '회의 식별자는 UUID 형식이어야 합니다.',
    status: 400,
  };
}

function createMeetingMemoValidationError(error: ZodError): ErrorResponse {
  const [firstIssue] = error.issues;
  const [issuePath] = firstIssue?.path ?? [];

  switch (issuePath) {
    case 'content':
      if (firstIssue?.code === 'too_big') {
        return {
          title: 'MEMO_CONTENT_TOO_LONG',
          detail: '메모 내용은 최대 500자 이하로 입력해주세요.',
          status: 400,
        };
      }

      return {
        title: 'MEMO_CONTENT_REQUIRED',
        detail: '메모 내용을 입력해주세요.',
        status: 400,
      };

    default:
      return {
        title: 'INVALID_MEETING_MEMO_REQUEST',
        detail: '메모 저장 요청이 올바르지 않습니다. 다시 확인해주세요.',
        status: 400,
      };
  }
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
  const validateResult = validateRouteParams(routeParams, meetingIdParamsSchema, meetingIdValidationError);

  if (!validateResult.ok) {
    return validateResult.error;
  }

  const {id} = validateResult.value;
  const db = getMeetingDb();

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

export async function POST(req: NextRequest, {params}: RouteParams): Promise<NextResponse<ErrorResponse | null>> {
  const requireAuthResult = await requireAuth();

  if (!requireAuthResult.ok) {
    return requireAuthResult.error;
  }

  const routeParams = await params;
  const routeParamsValidationResult = validateRouteParams(routeParams, meetingIdParamsSchema, meetingIdValidationError);

  if (!routeParamsValidationResult.ok) {
    return routeParamsValidationResult.error;
  }

  const requestBodyValidationResult = await validateRequestBody(
    req,
    createMeetingMemoRequestSchema,
    createMeetingMemoValidationError,
  );

  if (!requestBodyValidationResult.ok) {
    return requestBodyValidationResult.error;
  }

  const {id} = routeParamsValidationResult.value;
  const {content} = requestBodyValidationResult.value;

  const db = getMeetingDb();

  try {
    const createResult = await db.createMeetingMemo(id, content);

    if (!createResult.created) {
      if (createResult.reason === 'MEETING_NOT_FOUND') {
        return createErrorJsonResponse({
          title: 'MEETING_NOT_FOUND',
          detail: '회의 기록을 찾을 수 없습니다.',
          status: 404,
        });
      }

      if (createResult.reason === 'MEETING_MEMOS_TOO_MANY') {
        return createErrorJsonResponse({
          title: 'MEETING_MEMOS_TOO_MANY',
          detail: '메모는 회의당 최대 50개까지 저장할 수 있습니다.',
          status: 400,
        });
      }
    }

    return new NextResponse(null, {status: 204});
  } catch (error) {
    console.error('[meeting-memos] failed to create meeting memo', {
      message: error instanceof Error ? error.message : 'Unknown error',
      id,
    });

    return createErrorJsonResponse({
      title: 'MEETING_MEMO_SAVE_FAILED',
      detail: '메모 저장에 실패했습니다.',
      status: 500,
    });
  }
}
