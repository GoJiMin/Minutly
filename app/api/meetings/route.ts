import {NextRequest, NextResponse} from 'next/server';
import type {ZodError} from 'zod';
import {createMeetingRequestSchema, type CreateMeetingResponse, NeonMeetingDb} from '@/entities/meeting/server';
import type {ErrorResponse} from '@/shared/api';
import {createErrorJsonResponse, validateRequestBody} from '@/shared/server';
import {requireAuth} from '@/shared/server/auth';

function createMeetingValidationError(error: ZodError): ErrorResponse {
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

    case 'originTranscript':
    case 'transcript':
      return {
        title: 'TRANSCRIPT_REQUIRED',
        detail: '회의 내용을 입력해주세요.',
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
        title: 'INVALID_MEETING_REQUEST',
        detail: '회의 저장 요청이 올바르지 않습니다. 다시 확인해주세요.',
        status: 400,
      };
  }
}

export async function POST(req: NextRequest): Promise<NextResponse<CreateMeetingResponse | ErrorResponse>> {
  const requireAuthResult = await requireAuth();

  if (!requireAuthResult.ok) {
    return requireAuthResult.error;
  }

  const validateResult = await validateRequestBody(req, createMeetingRequestSchema, createMeetingValidationError);

  if (!validateResult.ok) {
    return validateResult.error;
  }

  const db = new NeonMeetingDb();

  try {
    const {id, meetingDate} = await db.createMeeting(validateResult.value);

    return NextResponse.json({id, meetingDate}, {status: 200});
  } catch (error) {
    console.error('[meetings] failed to create meeting', {
      message: error instanceof Error ? error.message : 'Unknown error',
      titleLength: validateResult.value.title.length,
      originTranscriptLength: validateResult.value.originTranscript.length,
      transcriptLength: validateResult.value.transcript.length,
      summaryLength: validateResult.value.summary.length,
      keyPointCount: validateResult.value.keyPoints.length,
    });

    return createErrorJsonResponse({
      title: 'MEETING_SAVE_FAILED',
      detail: '회의 저장에 실패했습니다.',
      status: 500,
    });
  }
}
