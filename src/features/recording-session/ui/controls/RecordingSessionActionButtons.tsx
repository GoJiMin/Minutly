import {CirclePause, CirclePlay, CircleStop} from 'lucide-react';
import {useRecordingSessionController} from '../../lib/useRecordingSessionController';
import {useRecordingStore} from '@/entities/speech-to-text/client';
import {Button} from '@/shared/components';

export function RecordingSessionActionButtons() {
  const status = useRecordingStore(state => state.status);

  const {startRecordingSession, pauseRecordingSession, resumeRecordingSession, finishRecordingSession} =
    useRecordingSessionController();

  const canStart = status === 'idle' || status === 'error';
  const canResume = status === 'paused';
  const canPause = status === 'recording';
  const canFinish = status === 'recording' || status === 'paused';

  const handlePrimaryClick = canResume ? resumeRecordingSession : startRecordingSession;

  return (
    <div className="flex w-auto max-w-none flex-row items-center gap-2 md:mt-6 md:w-full md:max-w-85 md:flex-col md:gap-3">
      <Button
        onClick={handlePrimaryClick}
        disabled={!canStart && !canResume}
        className="size-12 w-12 rounded-full p-0 md:h-14 md:w-full md:rounded-xl md:px-4 md:text-lg md:gap-2"
      >
        <CirclePlay className="size-6" />
        <span className="sr-only md:not-sr-only">{canResume ? '이어서 녹음' : '녹음 시작'}</span>
      </Button>

      <div className="flex gap-2 md:grid md:w-full md:grid-cols-2 md:gap-3">
        <Button
          variant="outline"
          onClick={pauseRecordingSession}
          disabled={!canPause}
          className="size-12 rounded-full p-0 md:h-14 md:w-full md:rounded-xl md:px-4 md:text-lg md:gap-2"
        >
          <CirclePause className="size-6" />
          <span className="sr-only md:not-sr-only">일시 정지</span>
        </Button>

        <Button
          variant="outline"
          onClick={finishRecordingSession}
          disabled={!canFinish}
          className="size-12 rounded-full p-0 md:h-14 md:w-full md:rounded-xl md:px-4 md:text-lg md:gap-2"
        >
          <CircleStop className="size-6" />
          <span className="sr-only md:not-sr-only">녹음 종료</span>
        </Button>
      </div>
    </div>
  );
}
