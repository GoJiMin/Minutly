'use client';

import {SelectedDateMeetingList} from './SelectedDateMeetingList';
import {useMeetingHistorySearchParams} from '../../lib/useMeetingHistorySearchParams';

export function MeetingListBySelectedDate() {
  const {date} = useMeetingHistorySearchParams();

  if (!date) {
    return <div>날짜를 선택해주세요.</div>;
  }

  return <SelectedDateMeetingList date={date} />;
}
