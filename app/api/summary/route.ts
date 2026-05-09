import {NextRequest, NextResponse} from 'next/server';
import type {ZodError} from 'zod';
import {
  createSummaryRequestSchema,
  type CreateSummaryResponse,
  GeminiSummaryProvider,
  SummaryService,
} from '@/entities/summary/server';
import {requireAuth} from '@/shared/server/auth';
import {createErrorJsonResponse, validateRequestBody} from '@/shared/server';
import type {ErrorResponse} from '@/shared/api';

function createSummaryValidationError(error: ZodError): ErrorResponse {
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
        title: 'TRANSCRIPT_TOO_SHORT',
        detail: '요약할 회의 내용이 충분하지 않습니다.',
        status: 400,
      };
    default:
      return {
        title: 'INVALID_SUMMARY_REQUEST',
        detail: '요약 요청이 올바르지 않습니다. 다시 확인해주세요.',
        status: 400,
      };
  }
}

export async function POST(req: NextRequest): Promise<NextResponse<CreateSummaryResponse | ErrorResponse>> {
  const requireAuthResult = await requireAuth();

  if (!requireAuthResult.ok) {
    return requireAuthResult.error;
  }

  const validateResult = await validateRequestBody(req, createSummaryRequestSchema, createSummaryValidationError);

  if (!validateResult.ok) {
    return validateResult.error;
  }

  const summaryService = new SummaryService(new GeminiSummaryProvider());
  const result = await summaryService.createSummary(validateResult.value);

  if (!result.ok) {
    return createErrorJsonResponse({
      title: 'SUMMARY_FAILED',
      detail: '요약 생성에 실패했습니다.',
      status: 500,
    });
  }

  return NextResponse.json(result.value, {status: 200});
}
