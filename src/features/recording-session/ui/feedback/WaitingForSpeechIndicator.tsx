import {AudioLines} from 'lucide-react';

export function WaitingForSpeechIndicator() {
  return (
    <div className="flex flex-1 items-center justify-center" role="status">
      <div className="flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-primary/5">
        <AudioLines size={38} />
      </div>
    </div>
  );
}
