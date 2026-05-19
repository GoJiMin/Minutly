import {keepPreviousData} from '@tanstack/react-query';
import {getMeetingDatesByMonth} from '../api/meetingApi';
import type {MeetingDatesQuery} from '../model/schema';

export const meetingQueryKeys = {
  all: () => ['meeting'] as const,

  dates: {
    all: () => [...meetingQueryKeys.all(), 'dates'] as const,
    month: (year: string, month: string) => [...meetingQueryKeys.dates.all(), year, month] as const,
  },
};

export const meetingQueryOptions = {
  datesByMonth: ({year, month}: MeetingDatesQuery) => ({
    queryKey: meetingQueryKeys.dates.month(year, month),
    queryFn: () => getMeetingDatesByMonth({year, month}),
    placeholderData: keepPreviousData,
  }),
};
