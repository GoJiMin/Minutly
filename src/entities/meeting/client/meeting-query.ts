import {keepPreviousData} from '@tanstack/react-query';
import {getMeetingDatesByMonth, getMeetingsByDate} from '../api/meetingApi';
import type {MeetingDatesQuery, MeetingsByDateQuery} from '../model/schema';

export const meetingQueryKeys = {
  all: () => ['meeting'] as const,

  dates: {
    all: () => [...meetingQueryKeys.all(), 'dates'] as const,
    month: (year: string, month: string) => [...meetingQueryKeys.dates.all(), year, month] as const,
  },

  list: {
    all: () => [...meetingQueryKeys.all(), 'list'] as const,
    byDate: (date: string) => [...meetingQueryKeys.list.all(), 'date', date] as const,
  },
};

export const meetingQueryOptions = {
  datesByMonth: ({year, month}: MeetingDatesQuery) => ({
    queryKey: meetingQueryKeys.dates.month(year, month),
    queryFn: () => getMeetingDatesByMonth({year, month}),
    placeholderData: keepPreviousData,
    staleTime: Infinity,
    gcTime: Infinity,
  }),
  meetingsByDate: ({date}: MeetingsByDateQuery) => ({
    queryKey: meetingQueryKeys.list.byDate(date),
    queryFn: () => getMeetingsByDate({date}),
    staleTime: Infinity,
    gcTime: Infinity,
  }),
};
