import {CreateMeetingRequest} from '../model/schema';
import {CreateMeetingResponse} from '../model/types';
import {fetchPost} from '@/shared/api';

export async function fetchCreateMeeting(payload: CreateMeetingRequest) {
  return await fetchPost<CreateMeetingResponse>({
    endpoint: '/api/meetings',
    withResponse: true,
    body: payload,
  });
}
