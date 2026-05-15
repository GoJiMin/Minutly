import z from 'zod';
import {useMemo} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {ReviewTitleField} from './ReviewTitleField';
import {InterruptionAlertPanel} from './InterruptionAlertPanel';
import {TranscriptEditorField} from './TranscriptEditorField';
import {ReviewSubmitActions} from './ReviewSubmitActions';
import {useTranscriptEditor} from '../../../lib/transcript-editor/useTranscriptEditor';
import {createTranscriptEditorDocument} from '../../../lib/transcript-editor/createTranscriptEditorDocument';
import {createSummaryRequestSchema} from '@/entities/summary/client';
import {transcriptChunks, useRecordingStore} from '@/entities/speech-to-text/client';
import {createMeetingTitlePrefix, toMeetingDate} from '@/shared/utils';

const reviewFormSchema = createSummaryRequestSchema.pick({
  title: true,
});

export type ReviewFormValues = z.infer<typeof reviewFormSchema>;

export function RecordingSessionReviewForm() {
  const interruptionCount = useRecordingStore(state => state.interruptionCount);

  const {doc, interruptions} = useMemo(() => createTranscriptEditorDocument(transcriptChunks), []);
  const {containerRef, getTranscript, markInterruptionReviewed, moveToInterruption} = useTranscriptEditor({
    doc,
    interruptions,
  });

  const today = toMeetingDate(new Date());
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      title: createMeetingTitlePrefix(today),
    },
  });

  function onSubmit({title}: ReviewFormValues) {
    const transcript = getTranscript() ?? '';

    const result = createSummaryRequestSchema.safeParse({
      title,
      originTranscript: doc,
      transcript,
    });

    if (!result.success) {
      const transcriptError = result.error.issues.find(issue => issue.path[0] === 'transcript');

      if (transcriptError) {
        form.setError('root', {message: transcriptError.message});
      }

      return;
    }

    // TODO: 요약 생성
    console.log(result.data);
  }

  const isSubmitDisabled = interruptionCount > 0 || form.formState.isSubmitting;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex h-full min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b bg-background px-6 py-5">
        <ReviewTitleField control={form.control} />
      </div>
      <div className="min-h-0 flex flex-1 flex-col gap-3 bg-muted/70 px-6 py-4">
        {interruptionCount > 0 && (
          <InterruptionAlertPanel
            interruptions={interruptions}
            onMarkInterruptionReviewed={markInterruptionReviewed}
            onMoveToInterruption={moveToInterruption}
          />
        )}
        <TranscriptEditorField containerRef={containerRef} />
      </div>
      <div className="shrink-0 border-t bg-background px-7 py-5">
        <ReviewSubmitActions
          disabled={isSubmitDisabled}
          isSubmitting={form.formState.isSubmitting}
          errorMessage={form.formState.errors.root?.message}
        />
      </div>
    </form>
  );
}
