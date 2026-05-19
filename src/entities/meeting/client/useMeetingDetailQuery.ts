import {useSuspenseQuery} from '@tanstack/react-query';
import {meetingQueryOptions} from './meeting-query';
import type {MeetingIdParams} from '../model/schema';

export function useMeetingDetailQuery(params: MeetingIdParams) {
  const {data} = useSuspenseQuery(meetingQueryOptions.detail(params));

  return data;
}
