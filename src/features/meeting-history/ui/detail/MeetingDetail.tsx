import {Suspense} from 'react';
import {MeetingDetailContent} from './MeetingDetailContent';
import {MeetingDetailContentSkeleton} from '../MeetingHistorySkeleton';
import {MeetingMemoPanelBoundary} from './memo/MeetingMemoPanelBoundary';
import {MeetingMemoDrawer} from './memo/MeetingMemoDrawer';
import {QueryErrorBoundary, RetryErrorFallback} from '@/shared/components';

type Props = {
  meetingId: string;
};

export function MeetingDetail({meetingId}: Props) {
  return (
    <section className="min-h-0 flex-1 md:grid md:grid-cols-[minmax(0,1fr)_21rem] md:gap-6 overflow-y-auto">
      <QueryErrorBoundary
        resetKeys={[meetingId]}
        fallback={({message, reset}) => (
          <RetryErrorFallback
            title="회의록을 불러오지 못했어요."
            showIcon
            message={message}
            onRetry={reset}
            className="min-h-0 w-full h-full flex-1 flex flex-col items-center px-1"
            contentClassName="min-h-0 w-full flex-1"
          />
        )}
      >
        <Suspense fallback={<MeetingDetailContentSkeleton />}>
          <MeetingDetailContent meetingId={meetingId} />
        </Suspense>
      </QueryErrorBoundary>

      <aside className="hidden min-h-0 md:block">
        <MeetingMemoPanelBoundary meetingId={meetingId} />
      </aside>

      <div className="fixed bottom-20 right-4 z-20 md:hidden">
        <MeetingMemoDrawer meetingId={meetingId} />
      </div>
    </section>
  );
}
