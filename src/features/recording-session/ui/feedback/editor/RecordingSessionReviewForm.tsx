import z from 'zod';
import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {ReviewTitleField} from './ReviewTitleField';
import {InterruptionAlertPanel} from './InterruptionAlertPanel';
import {TranscriptEditorField} from './TranscriptEditorField';
import {ReviewSubmitActions} from './ReviewSubmitActions';
import {useTranscriptEditor} from '../../../lib/transcript-editor/useTranscriptEditor';
import {useTranscriptReviewInitialState} from '@/features/recording-session/lib/transcript-editor/useTranscriptReviewInitialState';
import {createSummaryRequestSchema, useCreateSummaryMutation} from '@/entities/summary/client';
import {saveTranscriptReviewDraft, useRecordingStore} from '@/entities/speech-to-text/client';
import {CreateMeetingRequest} from '@/entities/meeting/client';

const reviewFormSchema = createSummaryRequestSchema.pick({
  title: true,
});

export type ReviewFormValues = z.infer<typeof reviewFormSchema>;

export function RecordingSessionReviewForm() {
  const [summaryReview, setSummaryReview] = useState<CreateMeetingRequest | null>(null);

  const interruptionCount = useRecordingStore(state => state.interruptionCount);
  const {initialTitle, initialDoc, interruptions, originTranscript} = useTranscriptReviewInitialState();
  const {containerRef, getTranscript, markInterruptionReviewed, moveToInterruption} = useTranscriptEditor({
    doc: initialDoc,
    interruptions,
  });
  const {createSummary, isCreatingSummary} = useCreateSummaryMutation();

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      title: initialTitle,
    },
  });

  function onSubmit({title}: ReviewFormValues) {
    const transcript = getTranscript() ?? '';

    const result = createSummaryRequestSchema.safeParse({
      title,
      transcript,
    });

    if (!result.success) {
      const transcriptError = result.error.issues.find(issue => issue.path[0] === 'transcript');

      if (transcriptError) {
        form.setError('root', {message: transcriptError.message});
      }

      return;
    }

    saveTranscriptReviewDraft(result.data);

    createSummary(result.data, {
      onSuccess(summaryRequest) {
        setSummaryReview({
          title: result.data.title,
          originTranscript,
          transcript: result.data.transcript,
          summary: summaryRequest.summary,
          keyPoints: summaryRequest.keyPoints,
        });
      },
    });
  }

  const isSubmitting = form.formState.isSubmitting || isCreatingSummary;
  const isSubmitDisabled = interruptionCount > 0 || isSubmitting;

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
          isSubmitting={isSubmitting}
          errorMessage={form.formState.errors.root?.message}
        />
      </div>
    </form>
  );
}
