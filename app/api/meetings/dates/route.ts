import {type NextRequest, NextResponse} from 'next/server';
import type {ZodError} from 'zod';
import {type GetMeetingDatesResponse, getMeetingDb, meetingDatesQuerySchema} from '@/entities/meeting/server';
import type {ErrorResponse} from '@/shared/api';
import {createErrorJsonResponse, validateQueryParams} from '@/shared/server';
import {requireAuth} from '@/shared/server/auth';

function createMeetingDatesValidationError(error: ZodError): ErrorResponse {
  const [firstIssue] = error.issues;
  const [issuePath] = firstIssue?.path ?? [];

  switch (issuePath) {
    case 'year':
      return {
        title: 'INVALID_YEAR',
        detail: '조회할 연도는 YYYY 형식으로 입력해주세요.',
        status: 400,
      };

    case 'month':
      return {
        title: 'INVALID_MONTH',
        detail: '조회할 월은 01부터 12까지의 MM 형식으로 입력해주세요.',
        status: 400,
      };

    default:
      return {
        title: 'UNSUPPORTED_YEAR_MONTH',
        detail: '2026년 5월 이후의 회의 날짜만 조회할 수 있습니다.',
        status: 400,
      };
  }
}

export async function GET(req: NextRequest): Promise<NextResponse<GetMeetingDatesResponse | ErrorResponse>> {
  const requireAuthResult = await requireAuth();

  if (!requireAuthResult.ok) {
    return requireAuthResult.error;
  }

  const validateResult = validateQueryParams(
    req.nextUrl.searchParams,
    meetingDatesQuerySchema,
    createMeetingDatesValidationError,
  );

  if (!validateResult.ok) {
    return validateResult.error;
  }

  const {year, month} = validateResult.value;
  const db = getMeetingDb();

  try {
    const dates = await db.listMeetingDates(year, month);

    return NextResponse.json({dates}, {status: 200});
  } catch (error) {
    console.error('[meetings] failed to list meeting dates', {
      message: error instanceof Error ? error.message : 'Unknown error',
      year: validateResult.value.year,
      month: validateResult.value.month,
    });

    return createErrorJsonResponse({
      title: 'MEETING_DATES_READ_FAILED',
      detail: '회의 날짜 목록을 불러오지 못했습니다.',
      status: 500,
    });
  }
}
