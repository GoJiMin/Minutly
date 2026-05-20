import type {
  CreateMeetingRequest,
  MeetingDatesQuery,
  MeetingIdParams,
  MeetingsByDateQuery,
  UpdateMeetingRequest,
} from '../model/schema';
import type {
  CreateMeetingResponse,
  GetMeetingDatesResponse,
  GetMeetingsByDateResponse,
  MeetingDetail,
} from '../model/types';
import {fetchDelete, fetchGet, fetchPost, fetchPut} from '@/shared/api';

export async function fetchCreateMeeting(payload: CreateMeetingRequest) {
  return await fetchPost<CreateMeetingResponse>({
    endpoint: '/api/meetings',
    withResponse: true,
    body: payload,
  });
}

export async function fetchUpdateMeeting({id, payload}: {id: string; payload: UpdateMeetingRequest}) {
  await fetchPut({
    endpoint: `/api/meetings/${id}`,
    body: payload,
  });
}

export async function fetchDeleteMeeting({id}: MeetingIdParams) {
  await fetchDelete({
    endpoint: `/api/meetings/${id}`,
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

export async function getMeetingById({id}: MeetingIdParams) {
  return await fetchGet<MeetingDetail>({
    endpoint: `/api/meetings/${id}`,
  });
}
