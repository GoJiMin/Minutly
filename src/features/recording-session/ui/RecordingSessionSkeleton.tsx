import {Separator, Skeleton} from '@/shared/components';

function RecordingSessionControlsPanelSkeleton() {
  return (
    <section className="w-100 flex flex-col border-2 rounded-xl px-5 py-6 gap-3">
      <div className="flex flex-1 flex-col justify-center items-center">
        <Skeleton className="h-7 w-48 rounded-md" />
        <Skeleton className="mt-4 h-20 w-80 rounded-lg" />

        <div className="mt-6 flex w-full max-w-85 flex-col gap-3">
          <Skeleton className="h-14 w-full rounded-xl" />

          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-1">
        <Skeleton className="ml-2 h-6 w-20 rounded-sm" />
        <Skeleton className="h-9 w-full rounded-none border border-transparent bg-muted" />
      </div>
    </section>
  );
}

function RecordingSessionFeedbackPanelSkeleton() {
  const onboardingRowWidths = [
    'w-[31.5rem]',
    'w-[29rem]',
    'w-[32.5rem]',
    'w-[32.5rem]',
    'w-[41.5rem]',
    'w-[39.5rem]',
    'w-[29rem]',
    'w-[45rem]',
  ];

  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-xl border-2">
      <header className="px-5 py-4 border-b-2">
        <div className="flex items-center gap-2 mb-1">
          <Skeleton className="size-5.5 rounded-md" />
          <Skeleton className="h-7 w-16 rounded-md" />
        </div>
        <Skeleton className="h-5 w-70 rounded-md" />
      </header>

      <div className="flex min-h-0 flex-1 bg-white px-8 py-4">
        <ol className="grid w-full flex-1 grid-rows-8">
          {onboardingRowWidths.map((widthClassName, index) => (
            <li
              key={index}
              className="grid min-h-0 grid-cols-[3rem_1fr] items-center border-b border-border/60 last:border-b-0"
            >
              <Skeleton className="h-5 w-6 rounded-sm" />
              <Skeleton className={`h-6 max-w-full rounded-md ${widthClassName}`} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function RecordingSessionWorkspaceSkeleton() {
  return (
    <section aria-hidden className="w-full h-full flex gap-5 p-10">
      <RecordingSessionControlsPanelSkeleton />
      <RecordingSessionFeedbackPanelSkeleton />
    </section>
  );
}
