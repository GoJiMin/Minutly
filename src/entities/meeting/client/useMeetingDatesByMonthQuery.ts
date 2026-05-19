import {useSuspenseQuery} from '@tanstack/react-query';
import {meetingQueryOptions} from './meeting-query';
import {MeetingDatesQuery} from '../model/schema';

export function useMeetingDatesByMonthQuery(query: MeetingDatesQuery) {
  const {data} = useSuspenseQuery(meetingQueryOptions.datesByMonth(query));

  return data.dates;
}
