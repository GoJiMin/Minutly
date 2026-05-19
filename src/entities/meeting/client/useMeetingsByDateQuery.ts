import {useSuspenseQuery} from '@tanstack/react-query';
import {meetingQueryOptions} from './meeting-query';
import type {MeetingsByDateQuery} from '../model/schema';

export function useMeetingsByDateQuery(query: MeetingsByDateQuery) {
  const {data} = useSuspenseQuery(meetingQueryOptions.meetingsByDate(query));

  return data.meetings;
}
