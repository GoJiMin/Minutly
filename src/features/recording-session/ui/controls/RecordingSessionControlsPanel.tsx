import {RecordingSessionTimer} from './RecordingSessionTimer';
import {RecordingSessionActionButtons} from './RecordingSessionActionButtons';
import {RecordingSessionReviewActions} from './RecordingSessionReviewActions';
import SelectMicrophones from './SelectMicrophones';
import {useRecordingStore} from '@/entities/speech-to-text/client';
import {Separator} from '@/shared/components';
import {formatKoreanDate} from '@/shared/utils';

export default function RecordingSessionControlsPanel() {
  const status = useRecordingStore(state => state.status);

  const isRecordingControlVisible =
    status === 'idle' || status === 'recording' || status === 'paused' || status === 'error';
  const isTranscriptReviewVisible = status === 'transcript_review';

  return (
    <section className="w-100 flex flex-col border-2 rounded-xl px-5 py-6 gap-3">
      <div className="flex flex-1 flex-col justify-center items-center">
        <time className="text-2xl text-foreground">{formatKoreanDate(new Date())}</time>
        <RecordingSessionTimer />
        {isRecordingControlVisible && <RecordingSessionActionButtons />}
        {isTranscriptReviewVisible && <RecordingSessionReviewActions />}
      </div>
      {isRecordingControlVisible && (
        <>
          <Separator />
          <SelectMicrophones />
        </>
      )}
    </section>
  );
}
