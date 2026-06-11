import {Separator, Skeleton} from '@/shared/components';
import {cn} from '@/shared/utils';

type SkeletonPanelProps = {
  className?: string;
};

function RecordingSessionControlsPanelSkeleton({className}: SkeletonPanelProps) {
  return (
    <section
      className={cn(
        'flex w-full shrink-0 flex-col gap-3 bg-background px-4 py-3',
        'md:w-100 md:rounded-xl md:border-2 md:px-5 md:py-6',
        className,
      )}
    >
      <div className="flex flex-col gap-3 md:flex-1 md:items-center md:justify-center">
        <Skeleton className="hidden h-7 w-60 rounded-md md:block" />

        <div className="flex items-center justify-between gap-3 px-1 md:flex-col">
          <Skeleton className="h-9 w-32 rounded-lg md:mt-4 md:h-18 md:w-80" />

          <div className="flex w-auto max-w-none flex-row items-center gap-2 md:mt-6 md:w-full md:max-w-85 md:flex-col md:gap-3">
            <Skeleton className="size-12 w-12 rounded-full md:h-14 md:w-full md:rounded-xl" />

            <div className="flex gap-2 md:grid md:w-full md:grid-cols-2 md:gap-3">
              <Skeleton className="size-12 rounded-full md:h-14 md:w-full md:rounded-xl" />
              <Skeleton className="size-12 rounded-full md:h-14 md:w-full md:rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 px-5 pb-1 md:px-0">
        <Separator className="hidden md:block" />

        <div className="flex flex-col gap-2">
          <Skeleton className="hidden h-5 w-16 rounded-sm md:block" />
          <Skeleton className="h-9 w-full rounded-none border border-transparent bg-muted" />
        </div>
      </div>
    </section>
  );
}

function RecordingSessionFeedbackPanelSkeleton({className}: SkeletonPanelProps) {
  const onboardingRowWidths = [
    'w-52 md:w-[31.5rem]',
    'w-48 md:w-[29rem]',
    'w-56 md:w-[32.5rem]',
    'w-56 md:w-[32.5rem]',
    'w-64 md:w-[41.5rem]',
    'w-60 md:w-[39.5rem]',
    'w-48 md:w-[29rem]',
    'w-64 md:w-[45rem]',
  ];

  return (
    <section className={cn('flex min-h-0 flex-1 flex-col md:rounded-xl md:border-2', className)}>
      <header className="hidden border-b-2 px-5 py-4 md:block">
        <div className="flex items-center gap-2 mb-1">
          <Skeleton className="size-5.5 rounded-md" />
          <Skeleton className="h-7 w-16 rounded-md" />
        </div>
        <Skeleton className="h-5 w-70 rounded-md" />
      </header>

      <div className="flex min-h-0 flex-1 bg-white px-6 py-3 md:px-8 md:py-4">
        <ol className="grid w-full flex-1 grid-rows-8">
          {onboardingRowWidths.map((widthClassName, index) => (
            <li
              key={index}
              className="grid min-h-0 grid-cols-[3rem_1fr] items-center border-b border-border/60 last:border-b-0"
            >
              <Skeleton className="h-4 w-5 rounded-sm md:h-5 md:w-6" />
              <Skeleton className={`h-4 max-w-full rounded-md md:h-6 ${widthClassName}`} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function RecordingSessionWorkspaceSkeleton() {
  return (
    <section aria-hidden className="flex h-full w-full flex-col md:flex-row md:gap-5 md:px-10 md:py-6">
      <RecordingSessionControlsPanelSkeleton className="order-3 md:order-1" />
      <Separator className="order-2 md:hidden" />
      <RecordingSessionFeedbackPanelSkeleton className="order-1 md:order-2" />
    </section>
  );
}
