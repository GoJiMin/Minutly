import {Suspense} from 'react';
import {MeetingMemoPanel} from './MeetingMemoPanel';
import {MeetingMemoPanelSkeleton} from '../../MeetingHistorySkeleton';
import {QueryErrorBoundary, RetryErrorFallback, Text} from '@/shared/components';
import {cn} from '@/shared/utils';

type Props = {
  meetingId: string;
  showHeader?: boolean;
  className?: HTMLDivElement['className'];
};

export function MeetingMemoPanelBoundary(props: Props) {
  const {meetingId, showHeader = true, className} = props;

  return (
    <QueryErrorBoundary
      resetKeys={[meetingId]}
      fallback={({message, reset}) => (
        <div className={cn('flex h-full min-h-0 flex-col rounded-3xl border border-border bg-muted/30 py-4', className)}>
          {showHeader && (
            <header className="border-b border-border/70 px-4 pb-3">
              <Text className="font-semibold leading-6">메모</Text>
              <Text variant="muted" className="text-xs leading-5">
                이 회의에만 저장되는 내용이에요.
              </Text>
            </header>
          )}
          <RetryErrorFallback
            title="메모를 불러오지 못했어요."
            message={message}
            onRetry={reset}
            showIcon
            className="min-h-0 flex-1"
            contentClassName="min-h-0 h-full"
          />
        </div>
      )}
    >
      <Suspense fallback={<MeetingMemoPanelSkeleton showHeader={showHeader} className={className} />}>
        <MeetingMemoPanel {...props} />
      </Suspense>
    </QueryErrorBoundary>
  );
}
