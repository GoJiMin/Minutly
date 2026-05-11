import {useEffect, useState} from 'react';
import {useShallow} from 'zustand/react/shallow';
import {useRecordingStore} from '@/entities/speech-to-text/client';
import {formatDuration} from '@/shared/utils';

export function RecordingSessionTimer() {
  const {status, recordingElapsedMs, recordingStartedAt} = useRecordingStore(
    useShallow(state => ({
      status: state.status,
      recordingElapsedMs: state.recordingElapsedMs,
      recordingStartedAt: state.recordingStartedAt,
    })),
  );

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (status !== 'recording') return;

    setNow(Date.now());

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [status, recordingStartedAt]);

  let elapsedMs = recordingElapsedMs;

  if (status === 'recording' && recordingStartedAt) {
    elapsedMs += Math.max(0, now - Date.parse(recordingStartedAt));
  }

  return <div className="mt-4 text-7xl font-bold tabular-nums">{formatDuration(elapsedMs)}</div>;
}
