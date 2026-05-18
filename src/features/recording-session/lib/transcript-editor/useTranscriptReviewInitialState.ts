import {useMemo, useState} from 'react';
import {createTranscriptEditorDocument} from './createTranscriptEditorDocument';
import {readTranscriptReviewDraft, transcriptChunks, useRecordingStore} from '@/entities/speech-to-text/client';
import {createMeetingTitlePrefix, toMeetingDate} from '@/shared/utils';

export function useTranscriptReviewInitialState() {
  const startedAt = useRecordingStore(state => state.startedAt);
  const titlePrefix = createMeetingTitlePrefix(toMeetingDate(startedAt ? new Date(startedAt) : new Date()));
  const {doc: originTranscript, interruptions} = useMemo(() => createTranscriptEditorDocument(transcriptChunks), []);

  const [reviewDraft] = useState(() => readTranscriptReviewDraft());

  let initialTitle: string;
  let initialDoc: string;

  if (reviewDraft) {
    initialTitle = reviewDraft.title;
    initialDoc = reviewDraft.transcript;
  } else {
    initialTitle = titlePrefix;
    initialDoc = originTranscript;
  }

  return {
    initialTitle,
    initialDoc,
    interruptions,
    originTranscript,
  };
}
