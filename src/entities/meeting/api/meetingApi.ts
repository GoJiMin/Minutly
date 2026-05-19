import type {CreateMeetingRequest, MeetingDatesQuery, MeetingsByDateQuery} from '../model/schema';
import type {CreateMeetingResponse, GetMeetingDatesResponse, GetMeetingsByDateResponse} from '../model/types';
import {fetchGet, fetchPost} from '@/shared/api';

export async function fetchCreateMeeting(payload: CreateMeetingRequest) {
  return await fetchPost<CreateMeetingResponse>({
    endpoint: '/api/meetings',
    withResponse: true,
    body: payload,
  });
}

export async function getMeetingDatesByMonth({year, month}: MeetingDatesQuery) {
  return await fetchGet<GetMeetingDatesResponse>({
    endpoint: '/api/meetings/dates',
    queryParams: {
      year,
      month,
    },
  });
}

export async function getMeetingsByDate({date}: MeetingsByDateQuery) {
  return await fetchGet<GetMeetingsByDateResponse>({
    endpoint: '/api/meetings',
    queryParams: {
      date,
    },
  });
}
