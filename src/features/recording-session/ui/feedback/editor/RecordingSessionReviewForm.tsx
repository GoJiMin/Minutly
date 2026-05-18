import z from 'zod';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {ReviewTitleField} from './ReviewTitleField';
import {InterruptionAlertPanel} from './InterruptionAlertPanel';
import {TranscriptEditorField} from './TranscriptEditorField';
import {ReviewSubmitActions} from './ReviewSubmitActions';
import {SummaryReviewDialog} from './SummaryReviewDialog';
import {SummaryGenerationOverlay} from './SummaryGenerationOverlay';
import {useTranscriptEditor} from '../../../lib/transcript-editor/useTranscriptEditor';
import {useSummaryReviewDialogState} from '../../../lib/transcript-editor/useSummaryReviewDialogState';
import {useTranscriptReviewInitialState} from '../../../lib/transcript-editor/useTranscriptReviewInitialState';
import {createSummaryRequestSchema, useCreateSummaryMutation} from '@/entities/summary/client';
import {saveTranscriptReviewDraft, useRecordingStore} from '@/entities/speech-to-text/client';

const reviewFormSchema = createSummaryRequestSchema.pick({
  title: true,
});

export type ReviewFormValues = z.infer<typeof reviewFormSchema>;

export function RecordingSessionReviewForm() {
  const interruptionCount = useRecordingStore(state => state.interruptionCount);
  const {createSummary, isCreatingSummary} = useCreateSummaryMutation();
  const {initialTitle, initialDoc, interruptions, originTranscript} = useTranscriptReviewInitialState();
  const {
    summaryReview,
    isSummaryReviewOpen,
    isReviewLocked,
    isSavingSummaryReview,
    openSummaryReview,
    closeSummaryReview,
    showSummaryReview,
    requestSummaryRegeneration,
    saveSummaryReview,
  } = useSummaryReviewDialogState();

  const isEditorReadOnly = isReviewLocked || isCreatingSummary;
  const {containerRef, getTranscript, markInterruptionReviewed, moveToInterruption} = useTranscriptEditor({
    doc: initialDoc,
    interruptions,
    readOnly: isEditorReadOnly,
  });

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      title: initialTitle,
    },
  });

  const isSubmitting = form.formState.isSubmitting || isCreatingSummary;
  const isSubmitDisabled = interruptionCount > 0 || isSubmitting;

  function onSubmit({title}: ReviewFormValues) {
    if (summaryReview) {
      openSummaryReview();
      return;
    }

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
        showSummaryReview({
          title: result.data.title,
          originTranscript,
          transcript: result.data.transcript,
          summary: summaryRequest.summary,
          keyPoints: summaryRequest.keyPoints,
        });
        openSummaryReview();
      },
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="relative flex h-full min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b bg-background px-6 py-5">
        <ReviewTitleField control={form.control} readOnly={isEditorReadOnly} />
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
          isReviewLocked={isReviewLocked}
          errorMessage={form.formState.errors.root?.message}
          onRequestRegenerate={requestSummaryRegeneration}
        />
      </div>
      {summaryReview && (
        <SummaryReviewDialog
          isOpen={isSummaryReviewOpen}
          isSaving={isSavingSummaryReview}
          summaryReview={summaryReview}
          onClose={closeSummaryReview}
          onRequestRegenerate={requestSummaryRegeneration}
          onSave={saveSummaryReview}
        />
      )}
      {isCreatingSummary && <SummaryGenerationOverlay />}
    </form>
  );
}
