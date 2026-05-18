'use client';

import {useMutation} from '@tanstack/react-query';
import {fetchTranscriptSummary} from '../api/summaryApi';

export function useCreateSummaryMutation() {
  const {mutate, isPending} = useMutation({
    mutationFn: fetchTranscriptSummary,
    retry: 0,
  });

  return {
    createSummary: mutate,
    isCreatingSummary: isPending,
  };
}
