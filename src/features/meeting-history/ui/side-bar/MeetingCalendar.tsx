'use client';

import {ko} from 'react-day-picker/locale';
import {useMeetingHistoryNavigation} from '../../lib/useMeetingHistoryNavigation';
import {useMeetingHistorySearchParams} from '../../lib/useMeetingHistorySearchParams';
import {MEETING_HISTORY_START_DATE, useMeetingDatesByMonthQuery} from '@/entities/meeting/client';
import {Calendar} from '@/shared/components';

export function MeetingCalendar() {
  const {calendarMonth, selectedDate, year, month} = useMeetingHistorySearchParams();
  const {moveMonth, selectDate} = useMeetingHistoryNavigation();

  const {dates, isFetching} = useMeetingDatesByMonthQuery({year, month});
  const meetingDays = dates.map(date => {
    const [year, month, day] = date.split('-').map(Number);
    return new Date(year, month - 1, day);
  });

  const [startYear, startMonth, startDay] = MEETING_HISTORY_START_DATE.split('-').map(Number);
  const historyStartDate = new Date(startYear, startMonth - 1, startDay);

  return (
    <div className="relative" aria-busy={isFetching}>
      <Calendar
        className="w-80 bg-transparent"
        mode="single"
        month={calendarMonth}
        selected={selectedDate}
        onMonthChange={moveMonth}
        onSelect={selectDate}
        locale={ko}
        startMonth={historyStartDate}
        disabled={{before: historyStartDate}}
        modifiers={{
          marked: meetingDays,
        }}
      />
      {isFetching && <MeetingCalendarLoadingOverlay />}
    </div>
  );
}

function MeetingCalendarLoadingOverlay() {
  return (
    <div
      aria-hidden
      data-testid="meeting-calendar-loading-overlay"
      className="absolute inset-0 z-20 bg-background/70"
    />
  );
}
