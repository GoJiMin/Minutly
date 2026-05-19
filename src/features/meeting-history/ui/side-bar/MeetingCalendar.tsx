'use client';

import {ko} from 'react-day-picker/locale';
import {useMeetingHistoryNavigation} from '../../lib/useMeetingHistoryNavigation';
import {useMeetingHistorySearchParams} from '../../lib/useMeetingHistorySearchParams';
import {Calendar} from '@/shared/components';
import {MEETING_HISTORY_START_DATE} from '@/entities/meeting/client';

export function MeetingCalendar() {
  const {calendarMonth, selectedDate} = useMeetingHistorySearchParams();
  const {moveMonth, selectDate} = useMeetingHistoryNavigation();

  const [startYear, startMonth, startDay] = MEETING_HISTORY_START_DATE.split('-').map(Number);
  const historyStartDate = new Date(startYear, startMonth - 1, startDay);

  return (
    <Calendar
      className="w-85"
      mode="single"
      month={calendarMonth}
      selected={selectedDate}
      onMonthChange={moveMonth}
      onSelect={selectDate}
      locale={ko}
      startMonth={historyStartDate}
      disabled={{before: historyStartDate}}
    />
  );
}
