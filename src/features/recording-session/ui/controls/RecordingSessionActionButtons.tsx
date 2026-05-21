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
    <div className="mt-6 flex w-full max-w-85 flex-col gap-3">
      <Button
        onClick={handlePrimaryClick}
        disabled={!canStart && !canResume}
        className="h-14 w-full rounded-xl text-lg gap-2"
      >
        <CirclePlay className="size-6" />
        {canResume ? '이어서 녹음' : '녹음 시작'}
      </Button>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={pauseRecordingSession}
          disabled={!canPause}
          className="h-14 rounded-xl text-lg gap-2"
        >
          <CirclePause className="size-6" />
          일시 정지
        </Button>

        <Button
          variant="outline"
          onClick={finishRecordingSession}
          disabled={!canFinish}
          className="h-14 rounded-xl text-lg gap-2"
        >
          <CircleStop className="size-6" />
          녹음 종료
        </Button>
      </div>
    </div>
  );
}
