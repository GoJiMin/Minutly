import {Separator, Skeleton} from '@/shared/components';
import {cn} from '@/shared/utils';

type MemoPanelSkeletonProps = {
  showHeader?: boolean;
  className?: string;
};

export function MeetingCalendarSkeleton() {
  return (
    <div aria-hidden className="w-80 bg-transparent p-3 [--cell-radius:var(--radius-4xl)] [--cell-size:--spacing(8)]">
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
                <Skeleton className="size-full rounded-(--cell-radius)" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function MeetingDetailContentSkeleton() {
  return (
    <div aria-hidden className="flex min-h-0 flex-col">
      <header className="px-4 pb-3">
        <Skeleton className="h-8 w-2/5 max-w-96 rounded-md" />
        <div className="mt-3 flex gap-3">
          <Skeleton className="h-5 w-64 rounded-md" />
          <Skeleton className="h-5 w-64 rounded-md" />
        </div>
      </header>

      <Separator />

      <div className="flex-1 flex flex-col gap-6 overflow-hidden px-4 py-6">
        <section className="space-y-3">
          <Skeleton className="h-6 w-20 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-full rounded-md" />
            <Skeleton className="h-5 w-11/12 rounded-md" />
            <Skeleton className="h-5 w-4/5 rounded-md" />
          </div>
        </section>

        <Separator />

        <section className="space-y-3">
          <Skeleton className="h-6 w-20 rounded-md" />
          <div className="flex flex-col gap-2">
            {Array.from({length: 3}).map((_, index) => (
              <Skeleton key={index} className="h-13 w-full rounded-md" />
            ))}
          </div>
        </section>

        <Separator />

        <section className="space-y-3">
          <Skeleton className="h-6 w-20 rounded-md" />
          <Skeleton className="h-52 w-full rounded-lg" />
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
        {[
          'h-16 w-4/5',
          'h-20 w-5/6',
          'h-14 w-3/4',
        ].map((className, index) => (
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

function MeetingHistorySidebarSkeleton() {
  return (
    <aside className="w-90 h-full min-h-0 flex flex-col items-center gap-3">
      <MeetingCalendarSkeleton />
      <Separator />
      <MeetingListSkeleton />
    </aside>
  );
}

export function MeetingHistoryWorkspaceSkeleton() {
  return (
    <section className="w-full h-full min-h-0 flex overflow-hidden py-7 pl-1 pr-4">
      <MeetingHistorySidebarSkeleton />
      <Separator orientation="vertical" />
      <MeetingDetailSkeleton />
    </section>
  );
}
