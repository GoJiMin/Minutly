'use client';

import {useEffect, useRef} from 'react';
import {readRecordingDraft, saveRecordingDraft, useRecordingStore} from '@/entities/speech-to-text/client';

const AUTO_SAVE_INTERVAL_MS = 60_000;

function getAutosavableDraftStatus() {
  const {status} = useRecordingStore.getState();

  switch (status) {
    case 'recording':
    case 'paused':
      return status;
    default:
      return null;
  }
}

function saveCurrentRecordingDraft() {
  const draftStatus = getAutosavableDraftStatus();

  if (!draftStatus) return;

  saveRecordingDraft(draftStatus);
}

function isEmptyRecordingSession() {
  const state = useRecordingStore.getState();

  return state.status === 'idle' && state.startedAt === null;
}

export function useRecordingDraftPersistence() {
  const didRestoreRef = useRef(false);
  const restoreRecordingDraft = useRecordingStore(state => state.restoreRecordingDraft);

  useEffect(() => {
    if (didRestoreRef.current) return;
    didRestoreRef.current = true;

    if (!isEmptyRecordingSession()) return;

    const draft = readRecordingDraft();

    if (!draft) return;

    restoreRecordingDraft(draft);
  }, [restoreRecordingDraft]);

  useEffect(() => {
    const intervalId = window.setInterval(saveCurrentRecordingDraft, AUTO_SAVE_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    function handlePageHide() {
      saveCurrentRecordingDraft();
    }

    window.addEventListener('pagehide', handlePageHide);

    return () => {
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, []);
}
