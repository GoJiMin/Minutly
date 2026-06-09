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
    <section
      className={cn(
        'flex w-full shrink-0 flex-col gap-3 rounded-t-xl border-2 bg-background px-4 py-3',
        'md:w-100 md:rounded-xl md:px-5 md:py-6',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 md:flex-1 md:flex-col md:justify-center">
        <time className="hidden text-2xl text-foreground md:block">{formatKoreanDate(new Date())}</time>
        <RecordingSessionTimer />
        {isRecordingControlVisible && <RecordingSessionActionButtons />}
        {isTranscriptReviewVisible && <RecordingSessionReviewActions />}
      </div>

      {isRecordingControlVisible && (
        <div className="flex flex-col gap-2">
          <Separator className="hidden md:block" />
          <SelectMicrophones />
        </div>
      )}
    </section>
  );
}
