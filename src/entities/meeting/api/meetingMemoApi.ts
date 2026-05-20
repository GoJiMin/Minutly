import type {CreateMeetingMemoRequest} from '../model/schema';
import type {GetMeetingMemosResponse} from '../model/types';
import {fetchDelete, fetchGet, fetchPost} from '@/shared/api';

export async function getMeetingMemos({meetingId}: {meetingId: string}) {
  return await fetchGet<GetMeetingMemosResponse>({
    endpoint: `/api/meetings/${meetingId}/memos`,
  });
}

export async function fetchCreateMeetingMemo({
  meetingId,
  payload,
}: {
  meetingId: string;
  payload: CreateMeetingMemoRequest;
}) {
  await fetchPost({
    endpoint: `/api/meetings/${meetingId}/memos`,
    body: payload,
  });
}

export async function fetchDeleteMeetingMemo({meetingId, memoId}: {meetingId: string; memoId: number}) {
  await fetchDelete({
    endpoint: `/api/meetings/${meetingId}/memos/${memoId}`,
  });
}
