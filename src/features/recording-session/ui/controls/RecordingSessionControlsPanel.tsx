import {RecordingSessionTimer} from './RecordingSessionTimer';
import {RecordingSessionActionButtons} from './RecordingSessionActionButtons';
import {RecordingSessionReviewActions} from './RecordingSessionReviewActions';
import SelectMicrophones from './SelectMicrophones';
import {useRecordingStore} from '@/entities/speech-to-text/client';
import {Separator} from '@/shared/components';
import {cn, formatKoreanDate} from '@/shared/utils';

type Props = {
  className?: HTMLDivElement['className'];
};

export default function RecordingSessionControlsPanel({className}: Props) {
  const status = useRecordingStore(state => state.status);

  const isRecordingControlVisible =
    status === 'idle' || status === 'recording' || status === 'paused' || status === 'error';
  const isTranscriptReviewVisible = status === 'transcript_review';

  return (
    <section className={cn('w-100 flex flex-col border-2 rounded-xl px-5 py-6 gap-3', className)}>
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
