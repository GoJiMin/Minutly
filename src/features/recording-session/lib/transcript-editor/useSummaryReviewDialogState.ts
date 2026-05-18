import {useState} from 'react';
import {CreateMeetingRequest, useCreateMeetingMutation} from '@/entities/meeting/client';
import {useRouter} from 'next/navigation';
import {removeRecordingDraft, removeTranscriptReviewDraft, useRecordingStore} from '@/entities/speech-to-text/client';

export function useSummaryReviewDialogState() {
  const [summaryReview, setSummaryReview] = useState<CreateMeetingRequest | null>(null);
  const [isSummaryReviewOpen, setIsSummaryReviewOpen] = useState(false);

  const router = useRouter();
  const resetRecording = useRecordingStore(state => state.resetRecording);
  const {createMeeting, isCreatingMeeting} = useCreateMeetingMutation();

  const isReviewLocked = summaryReview !== null;

  function openSummaryReview() {
    setIsSummaryReviewOpen(true);
  }

  function closeSummaryReview() {
    setIsSummaryReviewOpen(false);
  }

  function showSummaryReview(summaryReview: CreateMeetingRequest) {
    setSummaryReview(summaryReview);
    setIsSummaryReviewOpen(true);
  }

  function requestSummaryRegeneration() {
    setSummaryReview(null);
    setIsSummaryReviewOpen(false);
  }

  function saveSummaryReview() {
    if (!summaryReview) return;

    createMeeting(summaryReview, {
      onSuccess({id, meetingDate}) {
        const [year, month] = meetingDate.split('-');

        removeRecordingDraft();
        removeTranscriptReviewDraft();
        resetRecording();

        const searchParams = new URLSearchParams({
          year,
          month,
          meetingId: id,
        });

        router.push(`/history?${searchParams.toString()}`);
      },
    });
  }

  return {
    summaryReview,
    isSummaryReviewOpen,
    isReviewLocked,
    isSavingSummaryReview: isCreatingMeeting,
    openSummaryReview,
    closeSummaryReview,
    showSummaryReview,
    requestSummaryRegeneration,
    saveSummaryReview,
  };
}
