import {keepPreviousData} from '@tanstack/react-query';
import {getMeetingById, getMeetingDatesByMonth, getMeetingsByDate} from '../api/meetingApi';
import type {MeetingDatesQuery, MeetingIdParams, MeetingsByDateQuery} from '../model/schema';
import {getMeetingMemos} from '../api/meetingMemoApi';

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

  detail: {
    all: () => [...meetingQueryKeys.all(), 'detail'] as const,
    byId: (id: string) => [...meetingQueryKeys.detail.all(), id] as const,
  },

  memos: {
    all: () => [...meetingQueryKeys.all(), 'memos'] as const,
    byMeetingId: (meetingId: string) => [...meetingQueryKeys.memos.all(), 'meeting', meetingId] as const,
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
  detail: ({id}: MeetingIdParams) => ({
    queryKey: meetingQueryKeys.detail.byId(id),
    queryFn: () => getMeetingById({id}),
    staleTime: Infinity,
    gcTime: Infinity,
  }),
  memosByMeetingId: ({id}: MeetingIdParams) => ({
    queryKey: meetingQueryKeys.memos.byMeetingId(id),
    queryFn: () => getMeetingMemos({meetingId: id}),
    staleTime: Infinity,
    gcTime: Infinity,
  }),
};
