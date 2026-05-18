import {meetingDatesQuerySchema, meetingIdParamsSchema} from '@/entities/meeting/server';
import {MeetingHistoryWorkspace} from '@/features/meeting-history';
import {toMeetingDate} from '@/shared/utils';

type HistorySearchParams = {
  year?: string | string[];
  month?: string | string[];
  meetingId?: string | string[];
};

type Props = {
  searchParams: Promise<HistorySearchParams>;
};

export async function HistoryPage({searchParams}: Props) {
  const params = await searchParams;
  const {year, month, meetingId} = normalizeHistoryParams(params);

  return <MeetingHistoryWorkspace year={year} month={month} meetingId={meetingId} />;
}

function getFallbackYearMonth() {
  const [year, month] = toMeetingDate(new Date()).split('-');

  return {year, month};
}

function normalizeHistoryParams(params: HistorySearchParams) {
  const fallback = getFallbackYearMonth();

  const yearMonthResult = meetingDatesQuerySchema.safeParse({
    year: params.year,
    month: params.month,
  });

  const meetingIdResult = meetingIdParamsSchema.safeParse({
    id: params.meetingId,
  });

  let year = fallback.year;
  let month = fallback.month;
  let meetingId: string | undefined;

  if (yearMonthResult.success) {
    const {year: safeYear, month: safeMonth} = yearMonthResult.data;

    year = safeYear;
    month = safeMonth;
  }

  if (meetingIdResult.success) {
    const {id: safeMeetingId} = meetingIdResult.data;

    meetingId = safeMeetingId;
  }

  return {year, month, meetingId};
}
