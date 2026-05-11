import {Separator, Text} from '@/shared/components';
import {RecordingSessionActionButtons} from './RecordingSessionActionButtons';
import {formatKoreanDate} from '@/shared/utils';
import {useRecordingStore} from '@/entities/speech-to-text/client';
import {RecordingSessionReviewActions} from './RecordingSessionReviewActions';

export default function RecordingSessionControlsPanel() {
  const status = useRecordingStore(state => state.status);

  const isRecordingControlVisible =
    status === 'idle' || status === 'recording' || status === 'paused' || status === 'error';
  const isTranscriptReviewVisible = status === 'transcript_review';

  return (
    <section className="w-110 flex flex-col border-2 rounded-xl px-5 py-6 gap-3">
      <div className="flex flex-1 flex-col justify-center items-center">
        <time className="text-2xl text-foreground">{formatKoreanDate(new Date())}</time>
        <div className="mt-4 text-7xl font-bold tabular-nums">00:00:00</div>
        {isRecordingControlVisible && <RecordingSessionActionButtons />}
        {isTranscriptReviewVisible && <RecordingSessionReviewActions />}
      </div>
      {isRecordingControlVisible && (
        <>
          <Separator />
          <div className="flex flex-col gap-1">
            <Text className="ml-2 text-muted-foreground">입력 마이크</Text>
            <div className="border bg-white w-full h-12 rounded-lg flex items-center p-4 text-muted-foreground">
              Macbook Pro Microphone
            </div>
          </div>
        </>
      )}
    </section>
  );
}
