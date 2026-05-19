import {Separator, Skeleton} from '@/shared/components';

export function MeetingCalendarSkeleton() {
  return (
    <div aria-hidden className="w-85 bg-transparent p-3 [--cell-radius:var(--radius-4xl)] [--cell-size:--spacing(8)]">
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
    <aside className="w-96 h-full min-h-0 flex flex-col items-center gap-3">
      <MeetingCalendarSkeleton />
      <Separator />
      <MeetingListSkeleton />
    </aside>
  );
}

function MeetingHistoryDetailSkeleton() {
  return (
    <section aria-hidden className="flex min-h-0 flex-1 flex-col rounded-xl">
      <Skeleton className="h-full w-full rounded-xl" />
    </section>
  );
}

export function MeetingHistoryWorkspaceSkeleton() {
  return (
    <section className="w-full h-full min-h-0 flex overflow-hidden py-7 px-1">
      <MeetingHistorySidebarSkeleton />
      <Separator orientation="vertical" />
      <MeetingHistoryDetailSkeleton />
    </section>
  );
}
