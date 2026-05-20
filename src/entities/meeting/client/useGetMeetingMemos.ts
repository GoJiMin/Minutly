import {useSuspenseQuery} from '@tanstack/react-query';
import {meetingQueryOptions} from './meeting-query';

export function useGetMeetingMemos(id: string) {
  const {data} = useSuspenseQuery(meetingQueryOptions.memosByMeetingId({id}));

  return data.memos;
}
