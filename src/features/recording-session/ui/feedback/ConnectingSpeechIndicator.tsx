import {Spinner, Text} from '@/shared/components';

export function ConnectingSpeechIndicator() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4" role="status" aria-live="polite">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/5">
        <Spinner className="size-9 text-primary" role="presentation" aria-hidden="true" />
      </div>
    </div>
  );
}
