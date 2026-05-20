import {Separator, Skeleton} from '@/shared/components';

export function MeetingDetailSkeleton() {
  return (
    <section aria-hidden className="min-h-0 flex-1 grid grid-cols-[minmax(0,1fr)_21rem] gap-6">
      <div className="flex min-h-0 flex-col">
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

      <aside className="min-h-0">
        <div className="flex h-full min-h-0 flex-col rounded-3xl border border-border bg-muted/30 p-3">
          <header className="px-2 pb-3 pt-1">
            <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-foreground/20" />
            <Skeleton className="h-5 w-16 rounded-md" />
            <Skeleton className="mt-2 h-4 w-36 rounded-md" />
          </header>

          <div className="min-h-0 flex-1 px-1 py-2">
            <div className="flex flex-col gap-3">
              <Skeleton className="ml-auto h-16 w-4/5 rounded-2xl rounded-br-sm" />
              <Skeleton className="ml-auto h-20 w-5/6 rounded-2xl rounded-br-sm" />
              <Skeleton className="ml-auto h-14 w-3/4 rounded-2xl rounded-br-sm" />
            </div>
          </div>

          <div className="border-t border-border pt-3">
            <Skeleton className="h-10 w-full rounded-full" />
          </div>
        </div>
      </aside>
    </section>
  );
}
