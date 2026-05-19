'use client';

import {useSearchParams} from 'next/navigation';
import {meetingDatesQuerySchema, meetingIdParamsSchema, meetingsByDateQuerySchema} from '@/entities/meeting/client';
import {toMeetingDate} from '@/shared/utils';

function getYearMonth(searchParams: URLSearchParams) {
  const result = meetingDatesQuerySchema.safeParse({
    year: searchParams.get('year') ?? undefined,
    month: searchParams.get('month') ?? undefined,
  });

  if (result.success) {
    return result.data;
  }

  const [year, month] = toMeetingDate(new Date()).split('-');

  return {year, month};
}
function getDate(searchParams: URLSearchParams, year: string, month: string) {
  const dateResult = meetingsByDateQuerySchema.safeParse({
    date: searchParams.get('date') ?? undefined,
  });

  let date: string | undefined;
  let selectedDate: Date | undefined;

  if (dateResult.success) {
    const safeDate = dateResult.data.date;
    const [safeDateYear, safeDateMonth] = safeDate.split('-');

    if (safeDateYear === year && safeDateMonth === month) {
      date = safeDate;
    }
  }

  if (date) {
    const [year, month, day] = date.split('-').map(Number);

    selectedDate = new Date(year, month - 1, day);
  }

  return {date, selectedDate};
}

function getMeetingId(searchParams: URLSearchParams) {
  const result = meetingIdParamsSchema.safeParse({
    id: searchParams.get('meetingId') ?? undefined,
  });

  if (result.success) {
    return result.data.id;
  }

  return undefined;
}

export function useMeetingHistorySearchParams() {
  const searchParams = useSearchParams();

  const {year, month} = getYearMonth(searchParams);
  const {date, selectedDate} = getDate(searchParams, year, month);
  const meetingId = getMeetingId(searchParams);

  const calendarMonth = new Date(Number(year), Number(month) - 1, 1);

  return {
    year,
    month,
    date,
    meetingId,
    calendarMonth,
    selectedDate,
  };
}
