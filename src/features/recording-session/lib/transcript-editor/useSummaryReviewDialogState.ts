import {useState} from 'react';
import {CreateMeetingRequest} from '@/entities/meeting/client';

export function useSummaryReviewDialogState() {
  const [summaryReview, setSummaryReview] = useState<CreateMeetingRequest | null>(null);
  const [isSummaryReviewOpen, setIsSummaryReviewOpen] = useState(false);

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
    // TODO: 회의록 저장하기 연결 (POST /api/meetings)
  }

  return {
    summaryReview,
    isSummaryReviewOpen,
    isReviewLocked,
    openSummaryReview,
    closeSummaryReview,
    showSummaryReview,
    requestSummaryRegeneration,
    saveSummaryReview,
  };
}
