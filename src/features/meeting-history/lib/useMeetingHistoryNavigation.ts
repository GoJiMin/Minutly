import {toMeetingDate} from '@/shared/utils';
import {useSearchParams} from 'next/navigation';

export function useMeetingHistoryNavigation() {
  const searchParams = useSearchParams();

  function updateUrl(nextValues: Record<string, string>) {
    const nextParams = new URLSearchParams(searchParams.toString());

    Object.entries(nextValues).forEach(([key, value]) => {
      nextParams.set(key, value);
    });

    const queryString = nextParams.toString();
    window.history.pushState(null, '', `?${queryString}`);
  }

  function moveMonth(monthDate: Date) {
    const [year, month] = toMeetingDate(monthDate).split('-');

    updateUrl({
      year,
      month,
    });
  }

  function selectDate(date: Date | undefined) {
    if (!date) return;

    const meetingDate = toMeetingDate(date);
    const [year, month] = meetingDate.split('-');

    updateUrl({
      year,
      month,
      date: meetingDate,
    });
  }

  function selectMeeting(meetingId: string) {
    updateUrl({meetingId});
  }

  return {
    moveMonth,
    selectDate,
    selectMeeting,
  };
}
