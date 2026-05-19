'use client';

import {Suspense} from 'react';
import {MeetingCalendar} from './MeetingCalendar';
import {MeetingListBySelectedDate} from './MeetingListBySelectDate';
import {MeetingCalendarSkeleton, MeetingListSkeleton} from '../MeetingHistorySkeleton';
import {useMeetingHistorySearchParams} from '../../lib/useMeetingHistorySearchParams';
import {QueryErrorBoundary, QueryErrorFallback, Separator} from '@/shared/components';

export function MeetingHistorySidebar() {
  const {date, month, year} = useMeetingHistorySearchParams();

  return (
    <aside className="w-105 h-full min-h-0 flex flex-col items-center gap-3">
      <QueryErrorBoundary
        fallback={({message, reset}) => (
          <QueryErrorFallback
            title="회의 날짜를 불러오지 못했어요"
            message={message}
            onRetry={reset}
            className="w-85 bg-transparent p-3"
            contentClassName="min-h-80"
          />
        )}
        resetKeys={[year, month]}
      >
        <Suspense fallback={<MeetingCalendarSkeleton />}>
          <MeetingCalendar />
        </Suspense>
      </QueryErrorBoundary>
      <Separator />
      <QueryErrorBoundary
        fallback={({message, reset}) => (
          <QueryErrorFallback
            title="회의 목록을 불러오지 못했어요"
            message={message}
            onRetry={reset}
            className="min-h-0 w-full flex-1 flex flex-col items-center px-1"
            contentClassName="min-h-0 w-full flex-1"
          />
        )}
        resetKeys={[date]}
      >
        <Suspense fallback={<MeetingListSkeleton />}>
          <MeetingListBySelectedDate />
        </Suspense>
      </QueryErrorBoundary>
    </aside>
  );
}
