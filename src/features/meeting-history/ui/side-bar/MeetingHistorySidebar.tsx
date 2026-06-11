'use client';

import {Suspense} from 'react';
import {MeetingCalendar} from './MeetingCalendar';
import {MeetingListBySelectedDate} from './MeetingListBySelectedDate';
import {MeetingListSkeleton} from '../MeetingHistorySkeleton';
import {useMeetingHistorySearchParams} from '../../lib/useMeetingHistorySearchParams';
import {QueryErrorBoundary, RetryErrorFallback, Separator} from '@/shared/components';
import {cn} from '@/shared/utils';

type Props = {
  className?: HTMLDivElement['className'];
};

export function MeetingHistorySidebar({className}: Props) {
  const {date, month, year} = useMeetingHistorySearchParams();

  return (
    <aside className={cn('w-90 h-full min-h-0 flex flex-col items-center gap-3', className)}>
      <QueryErrorBoundary
        fallback={({message, reset}) => (
          <RetryErrorFallback
            title="회의 날짜를 불러오지 못했어요"
            message={message}
            onRetry={reset}
            className="w-85 bg-transparent p-3"
            contentClassName="min-h-80"
          />
        )}
        resetKeys={[year, month]}
      >
        <MeetingCalendar />
      </QueryErrorBoundary>
      <Separator />
      <QueryErrorBoundary
        fallback={({message, reset}) => (
          <RetryErrorFallback
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
