import {localStorageClient} from '@/shared/utils';
import z from 'zod';

const transcriptReviewDraftStorage = z.object({
  title: z.string(),
  transcript: z.string(),
});

export type TranscriptReviewDraft = z.infer<typeof transcriptReviewDraftStorage>;

const TRANSCRIPT_REVIEW_DRAFT_STORAGE_KEY = 'transcript-review-draft:v1';

export function saveTranscriptReviewDraft(draft: TranscriptReviewDraft) {
  const result = transcriptReviewDraftStorage.safeParse(draft);

  if (!result.success) return;

  localStorageClient.write(TRANSCRIPT_REVIEW_DRAFT_STORAGE_KEY, result.data);
}

export function readTranscriptReviewDraft() {
  const value = localStorageClient.read(TRANSCRIPT_REVIEW_DRAFT_STORAGE_KEY);
  const result = transcriptReviewDraftStorage.safeParse(value);

  if (!result.success) {
    localStorageClient.remove(TRANSCRIPT_REVIEW_DRAFT_STORAGE_KEY);
    return null;
  }

  return result.data;
}

export function removeTranscriptReviewDraft() {
  localStorageClient.remove(TRANSCRIPT_REVIEW_DRAFT_STORAGE_KEY);
}
