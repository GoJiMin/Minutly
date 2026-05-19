'use client';

import {ko} from 'react-day-picker/locale';
import {useMeetingHistoryNavigation} from '../../lib/useMeetingHistoryNavigation';
import {useMeetingHistorySearchParams} from '../../lib/useMeetingHistorySearchParams';
import {Calendar} from '@/shared/components';

export function MeetingCalendar() {
  const {calendarMonth, selectedDate} = useMeetingHistorySearchParams();
  const {moveMonth, selectDate} = useMeetingHistoryNavigation();

  return (
    <Calendar
      mode="single"
      month={calendarMonth}
      selected={selectedDate}
      onMonthChange={moveMonth}
      onSelect={selectDate}
      locale={ko}
    />
  );
}
