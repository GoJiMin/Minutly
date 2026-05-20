'use client';

import {Suspense} from 'react';
import {MeetingDetail} from './MeetingDetail';
import {MeetingDetailSkeleton} from '../MeetingHistorySkeleton';
import {SelectMeetingEmptyState} from './SelectMeetingEmptyState';
import {useMeetingHistorySearchParams} from '../../lib/useMeetingHistorySearchParams';
import {QueryErrorBoundary, QueryErrorFallback} from '@/shared/components';

export function MeetingHistoryDetailPanel() {
  const {meetingId} = useMeetingHistorySearchParams();

  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-xl">
      {!meetingId && <SelectMeetingEmptyState />}
      {meetingId && (
        <QueryErrorBoundary
          resetKeys={[meetingId]}
          fallback={({message, reset}) => (
            <QueryErrorFallback
              title="회의록을 불러오지 못했어요."
              message={message}
              onRetry={reset}
              className="min-h-0 w-full flex-1 flex flex-col items-center px-1"
              contentClassName="min-h-0 w-full flex-1"
            />
          )}
        >
          <Suspense fallback={<MeetingDetailSkeleton />}>
            <MeetingDetail meetingId={meetingId} />
          </Suspense>
        </QueryErrorBoundary>
      )}
    </section>
  );
}
