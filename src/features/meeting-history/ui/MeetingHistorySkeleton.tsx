import {Separator, Skeleton} from '@/shared/components';
import {cn} from '@/shared/utils';

type MemoPanelSkeletonProps = {
  showHeader?: boolean;
  className?: string;
};

export function MeetingCalendarSkeleton() {
  return (
    <div aria-hidden className="relative px-2 md:px-0">
      <div className="w-full bg-transparent p-3 [--cell-radius:var(--radius-4xl)] [--cell-size:--spacing(10)] md:w-80">
        <div className="relative flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)">
          <Skeleton className="absolute left-0 size-(--cell-size) rounded-(--cell-radius)" />
          <Skeleton className="h-4 w-20 rounded-md" />
          <Skeleton className="absolute right-0 size-(--cell-size) rounded-(--cell-radius)" />
        </div>

        <div className="mt-4">
          <div className="flex">
            {Array.from({length: 7}).map((_, index) => (
              <div key={index} className="flex h-5 flex-1 items-center justify-center">
                <Skeleton className="h-3 w-3 rounded-sm" />
              </div>
            ))}
          </div>

          {Array.from({length: 6}).map((_, weekIndex) => (
            <div key={weekIndex} className="mt-2 flex w-full">
              {Array.from({length: 7}).map((_, dayIndex) => (
                <div key={dayIndex} className="relative aspect-square h-full w-full p-0">
                  <Skeleton className="mx-auto size-(--cell-size) rounded-(--cell-radius) md:size-full" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MeetingDetailContentSkeleton() {
  return (
    <div aria-hidden className="flex min-h-0 flex-col @container/detail-main">
      <header className="flex flex-col gap-3 md:gap-2 px-4 pb-3 @4xl/detail-main:flex-row @4xl/detail-main:items-start @4xl/detail-main:justify-between @4xl/detail-main:gap-4">
        <div className="min-w-0">
          <Skeleton className="h-7 w-3/5 max-w-72 rounded-md md:h-8 md:w-2/5 md:max-w-96" />
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            <Skeleton className="h-5 w-52 max-w-full rounded-md md:w-64" />
            <Skeleton className="h-5 w-48 max-w-full rounded-md md:w-64" />
          </div>
        </div>
        <div className="mb-1 flex shrink-0 justify-end gap-2">
          <Skeleton className="h-8 w-18 rounded-lg" />
          <Skeleton className="h-8 w-18 rounded-lg" />
        </div>
      </header>

      <Separator />

      <div className="flex-1 flex flex-col gap-6 overflow-y-auto px-4 py-6">
        <section className="space-y-3">
          <Skeleton className="h-5 w-18 rounded-md md:h-6 md:w-20" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-full rounded-md" />
            <Skeleton className="h-5 w-11/12 rounded-md" />
            <Skeleton className="h-5 w-4/5 rounded-md" />
          </div>
        </section>

        <Separator />

        <section className="space-y-3">
          <Skeleton className="h-5 w-18 rounded-md md:h-6 md:w-20" />
          <div className="flex flex-col gap-2">
            {Array.from({length: 3}).map((_, index) => (
              <Skeleton key={index} className="h-13 w-full rounded-md" />
            ))}
          </div>
        </section>

        <Separator />

        <section className="space-y-3">
          <Skeleton className="h-5 w-24 rounded-md md:h-6 md:w-20" />
          <Skeleton className="h-44 w-full rounded-lg md:h-52" />
        </section>
      </div>
    </div>
  );
}

export function MeetingMemoPanelSkeleton({showHeader = true, className}: MemoPanelSkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn('flex h-full min-h-0 flex-col rounded-3xl border border-border bg-muted/30 py-4', className)}
    >
      {showHeader && (
        <header className="border-b border-border/70 px-4 pb-3">
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="mt-2 h-4 w-36 rounded-md" />
        </header>
      )}

      <ul className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-3 py-5">
        {['h-16 w-4/5', 'h-20 w-5/6', 'h-14 w-3/4'].map((className, index) => (
          <li key={index} className="flex items-end justify-end gap-1.5">
            <Skeleton className={`${className} max-w-[90%] rounded-2xl rounded-br-sm`} />
            <Skeleton className="mb-0.5 size-6 shrink-0 rounded-md" />
          </li>
        ))}
      </ul>

      <div className="border-t border-border px-3 pt-4">
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function MeetingDetailSkeleton() {
  return (
    <section aria-hidden className="min-h-0 flex-1 md:grid md:grid-cols-[minmax(0,1fr)_21rem] md:gap-6 overflow-y-auto">
      <MeetingDetailContentSkeleton />

      <aside className="hidden min-h-0 md:block">
        <MeetingMemoPanelSkeleton />
      </aside>

      <div className="fixed bottom-25 right-4 z-20 md:hidden">
        <Skeleton className="size-9 rounded-full" />
      </div>
    </section>
  );
}

export function MeetingListSkeleton() {
  return (
    <div aria-hidden className="min-h-0 w-full flex-1 flex flex-col items-center px-1">
      <div className="w-full min-h-0 flex-1 overflow-hidden flex flex-col gap-4 py-2 px-2">
        {Array.from({length: 6}).map((_, index) => (
          <Skeleton key={index} className="min-h-14 w-full rounded-md" />
        ))}
      </div>
    </div>
  );
}

function MeetingHistorySidebarSkeleton({className}: {className?: string} = {}) {
  return (
    <aside className={cn('w-90 h-full min-h-0 flex flex-col items-center gap-3', className)}>
      <MeetingCalendarSkeleton />
      <Separator />
      <MeetingListSkeleton />
    </aside>
  );
}

export function MeetingHistoryWorkspaceSkeleton() {
  return (
    <section className="w-full h-full min-h-0 flex overflow-hidden pt-6 pb-3 px-1 md:py-7 md:pl-1 md:pr-4">
      <MeetingHistorySidebarSkeleton className="hidden md:flex" />
      <Separator orientation="vertical" className="hidden md:block" />
      <div className="fixed bottom-8 right-4 z-20 md:hidden">
        <Skeleton className="size-9 rounded-full" />
      </div>
      <MeetingDetailSkeleton />
    </section>
  );
}
